// Forced redeploy trigger - Vercel build stability fix
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { tutorMessageDB, subjectDB, tutorDB } from '@/services/supabaseDB';
import { getTutorResponse } from '@/services/geminiAPI';
import type { TutorMode } from '@/services/geminiAPI';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import AIAvatar from './AIAvatar';
import type { AvatarState } from './AIAvatar';
import {
  ChevronLeft,
  Send,
  Bot,
  Sparkles,
  BookOpen,
  Lightbulb,
  Calculator,
  FlaskConical,
  Loader2,
  Trash2,
  Volume2,
  Square,
  Pause,
  Play,
  GraduationCap,
  BrainCircuit,
  ClipboardCheck,
  HelpCircle,
} from 'lucide-react';
import type { TutorMessage, Subject } from '@/types';

const AI_TIPS = [
  "Ask me to explain any concept you're struggling with",
  "I can help solve math problems step by step",
  "Request practice questions on any topic",
  "Ask for study tips and techniques",
  "Get explanations in simpler terms",
];

const LEARNING_MODES: { id: TutorMode; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'simple', label: 'Explain Simply', icon: Lightbulb, description: 'Easy language, short explanations' },
  { id: 'teacher', label: 'Like Teacher', icon: GraduationCap, description: 'Structured, detailed explanations' },
  { id: 'exam', label: 'Exam Prep', icon: ClipboardCheck, description: 'Key points, practice questions' },
  { id: 'quiz', label: 'Quiz Mode', icon: HelpCircle, description: 'Test your understanding' },
];

const TutorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<TutorMode>('teacher');
  const [usage, setUsage] = useState<{ today: number, limit: number, isPremium: boolean }>({ today: 0, limit: 5, isPremium: false });
  const [showTtsControls, setShowTtsControls] = useState<string | null>(null);
  const [voiceLang, setVoiceLang] = useState<'en' | 'hi'>('hi');
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    speak, stop: stopSpeech, supported: ttsSupported, isSpeaking,
    isPaused, pause: pauseSpeech, resume: resumeSpeech,
    rate, setRate,
  } = useTextToSpeech();
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');

  useEffect(() => {
    // Wave on load
    setAvatarState('waving');
    const timer = setTimeout(() => setAvatarState('idle'), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isTyping) {
      setAvatarState('thinking');
    } else if (isSpeaking) {
      setAvatarState('talking');
    } else {
      setAvatarState('idle');
    }
  }, [isTyping, isSpeaking]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const allSubjects = await subjectDB.getAll();
      setSubjects(allSubjects);
    } catch (error) {
      console.error('Error loading subjects for tutor:', error);
    }

    try {
      const history = await tutorMessageDB.getByStudent(user.id);
      setMessages(history);
      
      const usageData = await tutorDB.getUsage(user.id);
      setUsage(usageData);
    } catch (error) {
      console.error('Error loading tutor history:', error);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage: TutorMessage = {
      id: `msg_${Date.now()}`,
      studentId: user.id,
      message: input,
      response: '',
      subjectId: selectedSubject || undefined,
      chapterId: selectedChapter || undefined,
      sentAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const recentMessages = messages.slice(-5).map(m => ({
        role: 'user' as const,
        content: m.message,
      }));

      const subjectName = selectedSubject
        ? subjects.find(s => s.id === selectedSubject)?.name
        : undefined;
      const chapterName = selectedSubject && selectedChapter
        ? subjects.find(s => s.id === selectedSubject)?.chapters.find(c => c.id === selectedChapter)?.name
        : undefined;

      // --- Layer 1: Local Search ---
      const localResponse = await tutorDB.searchLocalContent(input, selectedSubject || undefined);
      if (localResponse) {
        const updatedMessage = { ...userMessage, response: localResponse };
        setMessages((prev) =>
          prev.map((m) => (m.id === userMessage.id ? updatedMessage : m))
        );
        void tutorMessageDB.create(updatedMessage);
        setIsTyping(false);
        return;
      }

      // --- Layer 2: Usage Limits ---
      if (usage.today >= usage.limit) {
        const limitMsg = `⚠️ You've reached your daily limit of ${usage.limit} questions. ${!usage.isPremium ? 'Upgrade to Premium for up to 30 questions/day!' : ''}`;
        const updatedMessage = { ...userMessage, response: limitMsg };
        setMessages((prev) =>
          prev.map((m) => (m.id === userMessage.id ? updatedMessage : m))
        );
        setIsTyping(false);
        toast.error('Limit reached');
        return;
      }

      // --- Layer 3: AI API Call ---
      const aiResponse = await getTutorResponse(input, {
        subject: subjectName,
        chapter: chapterName,
        previousMessages: recentMessages,
        mode: selectedMode,
      });

      // Increment usage if AI was called
      await tutorDB.incrementUsage(user.id);
      setUsage(prev => ({ ...prev, today: prev.today + 1 }));

      const updatedMessage = { ...userMessage, response: aiResponse };
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? updatedMessage : m))
      );

      void tutorMessageDB.create(updatedMessage).catch((error) => {
        console.error('Failed to save tutor message:', error);
      });
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      const errText = error?.message || '';
      let friendlyMsg = '❌ Could not reach AI. Please try again.';
      if (errText.includes('API key') || errText.includes('403') || errText.includes('401')) {
        friendlyMsg = '🔑 Invalid or missing Gemini API key. Get a free key at https://aistudio.google.com/apikey and set VITE_GEMINI_API_KEY in your .env file.';
      } else if (errText.includes('quota') || errText.includes('429')) {
        friendlyMsg = '⏳ Gemini API quota exceeded. Please wait a moment and try again.';
      }
      const updatedMessage = { ...userMessage, response: friendlyMsg };
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? updatedMessage : m))
      );
      toast.error('AI Tutor: ' + friendlyMsg.slice(0, 60));
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    
    // Optimistic UI update
    const previousMessages = [...messages];
    setMessages([]);
    
    try {
      const success = await tutorMessageDB.deleteByStudent(user.id);
      if (success) {
        toast.success('Chat history cleared permanently');
      } else {
        throw new Error('Failed to clear database');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      setMessages(previousMessages);
      toast.error('Failed to clear history from database');
    }
  };

  const quickQuestions = [
    { icon: Calculator, text: "Help with quadratic equations", subject: "math" },
    { icon: FlaskConical, text: "Explain photosynthesis", subject: "science" },
    { icon: BookOpen, text: "Grammar tips", subject: "english" },
    { icon: BrainCircuit, text: "Study techniques", subject: null },
  ];

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject);

  const handleTtsAction = (msgId: string, text: string) => {
    if (!ttsSupported) {
      toast.error('Text-to-speech is not supported in this browser');
      return;
    }

    if (isSpeaking && showTtsControls === msgId) {
      stopSpeech();
      setShowTtsControls(null);
      return;
    }

    setShowTtsControls(msgId);
    
    // Explicitly use the user-selected language preference
    speak(text, voiceLang);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold">AI Tutor</h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">Powered by Gemini</p>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <p className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${usage.isPremium ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                    {usage.isPremium ? 'PREMIUM' : 'FREE'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-[10px] font-medium text-gray-400">DAILY USAGE</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${usage.today >= usage.limit ? 'bg-red-500' : 'bg-purple-500'}`}
                      style={{ width: `${Math.min((usage.today / usage.limit) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600">{usage.today}/{usage.limit}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  const newLang = voiceLang === 'en' ? 'hi' : 'en';
                  setVoiceLang(newLang);
                  toast.success(`Voice set to ${newLang === 'hi' ? 'Hindi' : 'English'}`);
                }}
                className="hidden sm:flex px-2.5 py-1.5 text-xs font-bold rounded-lg border hover:bg-gray-50 items-center justify-center min-w-[50px]"
                title="Toggle Voice Language (English / Hindi)"
              >
                {voiceLang === 'hi' ? '🇮🇳 HI' : '🇺🇸 EN'}
              </button>
              <button
                onClick={clearHistory}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                title="Clear history"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        </div>
      </header>

      {/* Learning Mode Selector */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-xs text-gray-500 mb-2 font-medium">Learning Mode</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {LEARNING_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all border ${selectedMode === mode.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {mode.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {LEARNING_MODES.find(m => m.id === selectedMode)?.description}
          </p>
        </div>
      </div>

      {/* Subject Filter */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => {
                setSelectedSubject(null);
                setSelectedChapter(null);
              }}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${selectedSubject === null
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              All Subjects
            </button>
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => {
                  setSelectedSubject(subject.id);
                  setSelectedChapter(null);
                }}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${selectedSubject === subject.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {subject.name}
              </button>
            ))}
          </div>

          {selectedSubjectData && (
            <div className="flex gap-2 overflow-x-auto mt-2 pt-2 border-t">
              <button
                onClick={() => setSelectedChapter(null)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${selectedChapter === null
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                All Chapters
              </button>
              {selectedSubjectData.chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => setSelectedChapter(chapter.id)}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${selectedChapter === chapter.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {chapter.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
        <ScrollArea className="h-[calc(100vh-450px)]" ref={scrollRef}>
          <div className="space-y-4">
            {/* 3D Avatar Display */}
            <div className="mb-6">
              <AIAvatar state={avatarState} />
            </div>

            {messages.length === 0 && (
              <div className="text-center py-2">
                <h2 className="text-xl font-semibold mb-2">Hello! I'm your AI Tutor</h2>
                <p className="text-gray-500 mb-1">Powered by Google's Gemini AI</p>
                <p className="text-sm text-purple-600 mb-4 font-medium">
                  Mode: {LEARNING_MODES.find(m => m.id === selectedMode)?.label}
                </p>
                <p className="text-gray-500 mb-6">I can help you with any subject. Try asking:</p>

                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {quickQuestions.map((q, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(q.text);
                        if (q.subject) {
                          const sub = subjects.find((s) => s.name.toLowerCase().includes(q.subject!));
                          if (sub) setSelectedSubject(sub.id);
                        }
                      }}
                      className="flex items-center gap-2 p-3 rounded-xl border hover:bg-gray-50 transition-colors text-left"
                    >
                      <q.icon className="w-5 h-5 text-purple-500" />
                      <span className="text-sm">{q.text}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-8">
                  <p className="text-sm text-gray-400 mb-3">Tips:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {AI_TIPS.map((tip, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full cursor-pointer hover:bg-purple-100"
                        onClick={() => setInput(tip)}
                      >
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id}>
                {/* User Message */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-end mb-2"
                >
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-2">
                      <p>{msg.message}</p>
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{user?.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                </motion.div>

                {/* AI Response */}
                {msg.response && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start gap-2 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border rounded-2xl rounded-tl-sm px-4 py-2 space-y-2">
                        <p className="text-gray-700 whitespace-pre-wrap">{msg.response}</p>

                        {/* TTS Controls */}
                        <div className="border-t pt-2 space-y-2">
                          <button
                            onClick={() => handleTtsAction(msg.id, msg.response)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full transition-colors"
                            type="button"
                          >
                            {isSpeaking && showTtsControls === msg.id ? (
                              <>
                                <Square className="w-3 h-3" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3" />
                                🔊 Listen Explanation
                              </>
                            )}
                          </button>

                          {/* Expanded TTS Controls */}
                          {showTtsControls === msg.id && isSpeaking && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="flex items-center gap-3 bg-gray-50 rounded-lg p-2"
                            >
                              <button
                                onClick={() => isPaused ? resumeSpeech() : pauseSpeech()}
                                className="p-1.5 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                                type="button"
                              >
                                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                              </button>
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-xs text-gray-500 whitespace-nowrap">Speed</span>
                                <Slider
                                  value={[rate]}
                                  onValueChange={([val]) => setRate(val)}
                                  min={0.5}
                                  max={2}
                                  step={0.1}
                                  className="w-24"
                                />
                                <span className="text-xs font-mono text-gray-600 w-8">{rate.toFixed(1)}x</span>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isTyping && sendMessage()}
              placeholder={selectedSubject
                ? `Ask about ${selectedSubjectData?.name}...`
                : "Ask me anything..."}
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            AI Tutor is powered by Gemini Flash • Mode: {LEARNING_MODES.find(m => m.id === selectedMode)?.label}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TutorPage;
