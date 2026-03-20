import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { tutorMessageDB, subjectDB, tutorDB } from '@/services/supabaseDB';
import { getTutorResponse } from '@/services/geminiAPI';
import type { TutorMode } from '@/services/geminiAPI';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import AIAvatar from './AIAvatar';
import type { AvatarState } from './AIAvatar';
import {
  Send,
  Bot,
  Lightbulb,
  GraduationCap,
  ClipboardCheck,
  HelpCircle,
  Loader2,
  Trash2,
  Volume2,
  Square,
  ChevronDown,
  Zap,
} from 'lucide-react';
import type { TutorMessage, Subject } from '@/types';

const LEARNING_MODES: { id: TutorMode; label: string; icon: React.ElementType; description: string; gradient: string }[] = [
  { id: 'simple', label: 'Simple', icon: Lightbulb, description: 'Easy explanations', gradient: 'from-amber-500 to-orange-500' },
  { id: 'teacher', label: 'Teacher', icon: GraduationCap, description: 'Detailed teaching', gradient: 'from-blue-500 to-indigo-500' },
  { id: 'exam', label: 'Exam Prep', icon: ClipboardCheck, description: 'Key points & practice', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle, description: 'Test yourself', gradient: 'from-pink-500 to-rose-500' },
];

const quickPrompts = [
  { text: 'Explain photosynthesis simply', mode: 'simple' },
  { text: 'Help with quadratic equations', mode: 'simple' },
  { text: 'What are the key topics for exams?', mode: 'exam' },
  { text: 'Create a practice quiz', mode: 'quiz' },
];

const TutorPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<TutorMode>('teacher');
  const [usage, setUsage] = useState<{ today: number; limit: number; isPremium: boolean }>({ today: 0, limit: 5, isPremium: false });
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showTtsControls, setShowTtsControls] = useState<string | null>(null);
  const [voiceLang, setVoiceLang] = useState<'en' | 'hi'>('hi');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    speak,
    stop: stopSpeech,
    supported: ttsSupported,
    isSpeaking,
  } = useTextToSpeech();
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');

  useEffect(() => {
    setAvatarState('waving');
    const timer = setTimeout(() => setAvatarState('idle'), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isTyping) setAvatarState('thinking');
    else if (isSpeaking) setAvatarState('talking');
    else setAvatarState('idle');
  }, [isTyping, isSpeaking]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const allSubjects = await subjectDB.getAll();
      setSubjects(allSubjects);
    } catch (error) {
      console.error('Error loading subjects:', error);
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
      sentAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const recentMessages = messages.slice(-5).map((m) => ({
        role: 'user' as const,
        content: m.message,
      }));

      const subjectObj = selectedSubject ? subjects.find((s) => s.id === selectedSubject) : undefined;
      const subjectName =
        subjectObj?.name
          ? typeof subjectObj.name === 'string'
            ? subjectObj.name
            : subjectObj.name[user?.board || 'CBSE'] || 'Subject'
          : undefined;

      // Layer 1: Local Search
      const localResponse = await tutorDB.searchLocalContent(currentInput, selectedSubject || undefined);
      if (localResponse) {
        const updatedMessage = { ...userMessage, response: localResponse };
        setMessages((prev) => prev.map((m) => (m.id === userMessage.id ? updatedMessage : m)));
        void tutorMessageDB.create(updatedMessage);
        setIsTyping(false);
        return;
      }

      // Layer 2: Usage Limits
      if (usage.today >= usage.limit) {
        const limitMsg = `⚠️ Daily Limit Reached (${usage.today}/${usage.limit})\nUpgrade to Premium for unlimited access`;
        const updatedMessage = { ...userMessage, response: limitMsg };
        setMessages((prev) => prev.map((m) => (m.id === userMessage.id ? updatedMessage : m)));
        setIsTyping(false);
        toast.error('Daily limit reached');
        return;
      }

      // Layer 3: AI API Call
      const aiResponse = await getTutorResponse(currentInput, {
        subject: subjectName,
        previousMessages: recentMessages,
        mode: selectedMode,
      });

      await tutorDB.incrementUsage(user.id);
      setUsage((prev) => ({ ...prev, today: prev.today + 1 }));

      const updatedMessage = { ...userMessage, response: aiResponse };
      setMessages((prev) => prev.map((m) => (m.id === userMessage.id ? updatedMessage : m)));
      void tutorMessageDB.create(updatedMessage).catch(console.error);
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      let friendlyMsg = '❌ Could not reach AI. Please try again.';
      if (error?.message?.includes('API key') || error?.message?.includes('403')) {
        friendlyMsg = '🔑 Invalid or missing AI API key. Please check settings.';
      } else if (error?.message?.includes('quota') || error?.message?.includes('429')) {
        friendlyMsg = '⏳ AI provider quota exceeded. Please wait and try again.';
      }
      const updatedMessage = { ...userMessage, response: friendlyMsg };
      setMessages((prev) => prev.map((m) => (m.id === userMessage.id ? updatedMessage : m)));
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    const previousMessages = [...messages];
    setMessages([]);
    try {
      await tutorMessageDB.deleteByStudent(user.id);
      toast.success('Chat history cleared');
    } catch (error) {
      setMessages(previousMessages);
      toast.error('Failed to clear history');
    }
  };

  const handleTtsAction = (msgId: string, text: string) => {
    if (!ttsSupported) {
      toast.error('Text-to-speech not supported');
      return;
    }
    if (isSpeaking && showTtsControls === msgId) {
      stopSpeech();
      setShowTtsControls(null);
      return;
    }
    setShowTtsControls(msgId);
    speak(text, voiceLang);
  };

  const currentMode = LEARNING_MODES.find((m) => m.id === selectedMode) || LEARNING_MODES[1];

  return (
    <div className="bg-gray-50 flex flex-col h-[calc(100vh-64px)]">
      {/* Mode Selector Bar */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Mode Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowModeMenu(!showModeMenu)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r ${currentMode.gradient} text-white shadow-sm transition-all hover:shadow-md`}
            >
              <currentMode.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{currentMode.label}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showModeMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowModeMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border p-2 min-w-[200px]"
                  >
                    {LEARNING_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          setSelectedMode(mode.id);
                          setShowModeMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                          selectedMode === mode.id
                            ? 'bg-gray-100'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mode.gradient} flex items-center justify-center`}>
                          <mode.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{mode.label}</p>
                          <p className="text-xs text-gray-500">{mode.description}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Usage Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${usage.isPremium ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                {usage.isPremium ? 'PREMIUM' : `${usage.today}/${usage.limit}`}
              </span>
              <span className="text-xs text-gray-500 hidden sm:inline">queries</span>
            </div>
            <button
              onClick={() => setVoiceLang(voiceLang === 'en' ? 'hi' : 'en')}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold"
            >
              {voiceLang === 'hi' ? '🇮🇳' : '🇺🇸'}
            </button>
            <button onClick={clearHistory} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Subject Pills */}
      <div className="bg-white border-b px-4 py-2 overflow-x-auto">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <button
            onClick={() => setSelectedSubject(null)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
              selectedSubject === null
                ? 'bg-purple-100 text-purple-700 font-semibold'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {subjects.slice(0, 5).map((subject) => (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                selectedSubject === subject.id
                  ? 'bg-purple-100 text-purple-700 font-semibold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {typeof subject.name === 'string' ? subject.name : subject.name.CBSE || 'Subject'}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome State */}
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
              {/* Avatar */}
              <div className="w-24 h-24 mx-auto mb-6">
                <AIAvatar state={avatarState} />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Hello! I'm your AI Tutor 👋
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                I can help you with any subject. Ask me questions about science, math, english, or anything else!
              </p>

              {/* Mode Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-2xl mx-auto">
                {LEARNING_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      selectedMode === mode.id
                        ? `border-transparent bg-gradient-to-br ${mode.gradient} text-white shadow-lg`
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <mode.icon className={`w-6 h-6 mx-auto mb-2 ${selectedMode === mode.id ? 'text-white' : 'text-gray-600'}`} />
                    <p className={`font-semibold text-sm ${selectedMode === mode.id ? 'text-white' : 'text-gray-900'}`}>{mode.label}</p>
                  </button>
                ))}
              </div>

              {/* Quick Prompts */}
              <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt.text)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all shadow-sm"
                  >
                    {prompt.text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-4">
              {/* User Message */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
                <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-lg">
                    <p className="text-sm">{msg.message}</p>
                  </div>
                  <Avatar className="w-8 h-8 ring-2 ring-white shadow-sm flex-shrink-0">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-blue-500 text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
              </motion.div>

              {/* AI Response */}
              {msg.response && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                  <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg space-y-3">
                      {msg.response.includes('Daily Limit Reached') ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-red-600 font-bold bg-red-50 p-3 rounded-xl text-sm">
                            ⚠️ Daily Limit Reached
                          </div>
                          <button className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl text-sm">
                            🔓 Upgrade to Premium
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{msg.response}</div>
                          
                          {/* TTS Button */}
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <button
                              onClick={() => handleTtsAction(msg.id, msg.response)}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all ${
                                isSpeaking && showTtsControls === msg.id
                                  ? 'bg-red-100 text-red-600 border border-red-200'
                                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              }`}
                            >
                              {isSpeaking && showTtsControls === msg.id ? (
                                <>
                                  <Square className="w-4 h-4 fill-current" /> Stop
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-4 h-4" /> Listen
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setInput('Explain this more simply')}
                              className="px-3 py-2 bg-gray-100 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-200"
                            >
                              <Zap className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 bg-gray-100 rounded-2xl px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-500/30 transition-all">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isTyping && input.trim() && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent border-0 shadow-none text-base focus-visible:ring-0 px-0"
              disabled={isTyping}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl px-4"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">
            Powered by AI • {currentMode.label} Mode
          </p>
        </div>
      </div>
    </div>
  );
};

export default TutorPage;
