import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { tutorMessageDB, subjectDB } from '@/services/supabaseDB';
import { getTutorResponse } from '@/services/geminiAPI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
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
} from 'lucide-react';
import type { TutorMessage, Subject } from '@/types';

const AI_TIPS = [
  "Ask me to explain any concept you're struggling with",
  "I can help solve math problems step by step",
  "Request practice questions on any topic",
  "Ask for study tips and techniques",
  "Get explanations in simpler terms",
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
  const scrollRef = useRef<HTMLDivElement>(null);

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
      // Get recent message history for context
      const recentMessages = messages.slice(-5).map(m => ({
        role: 'user' as const,
        content: m.message,
      }));

      // Get subject and chapter names
      const subjectName = selectedSubject 
        ? subjects.find(s => s.id === selectedSubject)?.name 
        : undefined;
      const chapterName = selectedSubject && selectedChapter
        ? subjects.find(s => s.id === selectedSubject)?.chapters.find(c => c.id === selectedChapter)?.name
        : undefined;

      // Call Gemini API
      const aiResponse = await getTutorResponse(input, {
        subject: subjectName,
        chapter: chapterName,
        previousMessages: recentMessages,
      });

      const updatedMessage = { ...userMessage, response: aiResponse };
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? updatedMessage : m))
      );

      // Persist history in background; chat should still work even if DB write fails.
      void tutorMessageDB.create(updatedMessage).catch((error) => {
        console.error('Failed to save tutor message:', error);
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      const fallbackResponse = "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
      const updatedMessage = { ...userMessage, response: fallbackResponse };
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? updatedMessage : m))
      );
      toast.error('AI service is unavailable right now');
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    
    // Note: In a real implementation, you'd want to delete from the database
    // For now, we'll just clear the local state
    setMessages([]);
    toast.success('Chat history cleared');
  };

  const quickQuestions = [
    { icon: Calculator, text: "Help with quadratic equations", subject: "math" },
    { icon: FlaskConical, text: "Explain photosynthesis", subject: "science" },
    { icon: BookOpen, text: "Grammar tips", subject: "english" },
    { icon: Lightbulb, text: "Study techniques", subject: null },
  ];

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject);

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
                <p className="text-xs text-gray-500">Powered by Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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

      {/* Subject Filter */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => {
                setSelectedSubject(null);
                setSelectedChapter(null);
              }}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedSubject === null
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
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedSubject === subject.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {subject.name}
              </button>
            ))}
          </div>
          
          {/* Chapter Filter (only show if subject selected) */}
          {selectedSubjectData && (
            <div className="flex gap-2 overflow-x-auto mt-2 pt-2 border-t">
              <button
                onClick={() => setSelectedChapter(null)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                  selectedChapter === null
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
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                    selectedChapter === chapter.id
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
        <ScrollArea className="h-[calc(100vh-320px)]" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Hello! I'm your AI Tutor</h2>
                <p className="text-gray-500 mb-2">Powered by Google's Gemini AI</p>
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
                      <div className="bg-white border rounded-2xl rounded-tl-sm px-4 py-2">
                        <p className="text-gray-700 whitespace-pre-wrap">{msg.response}</p>
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
            AI Tutor is powered by Gemini Flash. Always verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TutorPage;
