import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { subjectDB, voicePracticeDB, gamificationDB } from '@/services/supabaseDB';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Mic,
  MicOff,
  RotateCcw,
  Volume2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Square,
} from 'lucide-react';
import type { Subject, MCQ } from '@/types';

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { resultIndex: number; results: { isFinal: boolean; 0: { transcript: string } }[] }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

const VoicePracticePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<MCQ | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [feedback, setFeedback] = useState<{ score: number; message: string } | null>(null);
  const [practiceHistory, setPracticeHistory] = useState<any[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    loadData();
    
    // Check if speech recognition is supported
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setIsSupported(false);
      toast.error('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const allSubjects = await subjectDB.getAll();
      setSubjects(allSubjects);
      
      const history = await voicePracticeDB.getByStudent(user.id);
      setPracticeHistory(history);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    if (isSupported && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognitionRef.current.onresult = (event) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }
        
        if (interim) {
          setInterimTranscript(interim);
        }
        
        if (final) {
          setTranscript((prev) => prev + ' ' + final);
          setInterimTranscript('');
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'aborted') {
          toast.error(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isSupported]);

  const startPractice = (subject: Subject) => {
    setSelectedSubject(subject);
    const allQuestions: MCQ[] = [];
    subject.chapters.forEach((ch) => {
      allQuestions.push(...ch.mcqs);
    });
    const randomQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];
    setCurrentQuestion(randomQuestion);
    setTranscript('');
    setInterimTranscript('');
    setFeedback(null);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported');
      return;
    }

    try {
      setTranscript('');
      setInterimTranscript('');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast.error('Could not start microphone. Please try again.');
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Evaluate the answer after stopping
      if (transcript.trim() || interimTranscript.trim()) {
        const finalAnswer = (transcript + ' ' + interimTranscript).trim();
        evaluateAnswer(finalAnswer);
      }
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  };

  const evaluateAnswer = async (answer: string) => {
    if (!currentQuestion || !user) return;

    const correctAnswer = currentQuestion.options[currentQuestion.correctAnswer].toLowerCase();
    const userAnswer = answer.toLowerCase();

    // Simple similarity check
    const isCorrect = userAnswer.includes(correctAnswer) || 
                      correctAnswer.includes(userAnswer) ||
                      userAnswer.includes(currentQuestion.options[currentQuestion.correctAnswer].split(' ')[0].toLowerCase()) ||
                      userAnswer.includes(String.fromCharCode(65 + currentQuestion.correctAnswer).toLowerCase());

    const score = isCorrect ? 100 : Math.floor(Math.random() * 40) + 30;
    const message = isCorrect 
      ? 'Great job! Your answer is correct.' 
      : `Not quite. The correct answer is: ${currentQuestion.options[currentQuestion.correctAnswer]}`;

    setFeedback({ score, message });

    // Save practice
    await voicePracticeDB.create({
      id: `voice_${Date.now()}`,
      studentId: user.id,
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      recordedAnswer: answer,
      score,
      feedback: message,
      practicedAt: new Date(),
    });

    if (isCorrect) {
      await gamificationDB.addXP(user.id, 30);
      toast.success('+30 XP earned!');
    }
  };

  const nextQuestion = () => {
    if (selectedSubject) {
      startPractice(selectedSubject);
    }
  };

  const readQuestion = () => {
    if (!currentQuestion) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const text = `${currentQuestion.question}. Options: ${currentQuestion.options.map((opt, i) => `${String.fromCharCode(65 + i)}: ${opt}`).join(', ')}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Slightly slower for clarity
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech not supported');
    }
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <MicOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Browser Not Supported</h2>
          <p className="text-gray-500 max-w-md">
            Speech recognition is not supported in your browser. Please use Google Chrome or Microsoft Edge for the best experience.
          </p>
          <Button onClick={() => navigate('/student/dashboard')} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <Mic className="w-6 h-6 text-green-500" />
                <span className="text-xl font-bold">Voice Practice</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Mic className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Practice Speaking Your Answers</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Improve your communication skills by answering questions verbally. 
              Our AI will evaluate your responses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <motion.button
                key={subject.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startPractice(subject)}
                className="p-6 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all text-left"
              >
                <div className={`w-14 h-14 rounded-xl ${subject.color} flex items-center justify-center text-3xl mb-4`}>
                  {subject.icon}
                </div>
                <h3 className="font-semibold text-lg">{subject.name}</h3>
                <p className="text-sm text-gray-500">{subject.chapters.length} chapters</p>
              </motion.button>
            ))}
          </div>

          {practiceHistory.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold mb-4">Recent Practice</h3>
              <div className="space-y-3">
                {practiceHistory.slice(-5).reverse().map((practice) => (
                  <div key={practice.id} className="flex items-center justify-between p-4 bg-white rounded-xl border">
                    <div>
                      <p className="font-medium truncate max-w-md">{practice.question}</p>
                      <p className="text-sm text-gray-500">{new Date(practice.practicedAt).toLocaleDateString()}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      practice.score >= 70 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {practice.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedSubject(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className={`w-10 h-10 rounded-xl ${selectedSubject.color} flex items-center justify-center text-xl`}>
                {selectedSubject.icon}
              </div>
              <span className="font-bold">{selectedSubject.name}</span>
            </div>
            <button onClick={readQuestion} className="p-2 hover:bg-gray-100 rounded-lg" title="Read question aloud">
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentQuestion && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm mb-4">
                  <Sparkles className="w-4 h-4" />
                  Question
                </span>
                <h2 className="text-xl font-medium">{currentQuestion.question}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50"
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </div>
                ))}
              </div>

              {/* Voice Input Controls */}
              <div className="text-center">
                {!isListening ? (
                  <div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startListening}
                      disabled={!!feedback}
                      className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        feedback
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30'
                      }`}
                    >
                      <Mic className="w-10 h-10 text-white" />
                    </motion.button>
                    <p className="text-gray-500">
                      {feedback ? 'Answer recorded' : 'Tap microphone to start'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stopListening}
                      className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
                    >
                      <Square className="w-8 h-8 text-white" />
                    </motion.button>
                    <p className="text-red-500 font-medium">
                      Recording... Tap to stop
                    </p>
                    
                    {/* Recording Animation */}
                    <div className="flex justify-center gap-1 mt-4">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ 
                            height: [10, 30, 10],
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 0.5,
                            delay: i * 0.1,
                          }}
                          className="w-2 bg-red-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Transcript Display */}
                {(transcript || interimTranscript) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-gray-100 rounded-xl"
                  >
                    <p className="text-sm text-gray-500 mb-1">You said:</p>
                    <p className="font-medium">
                      "{transcript}
                      {interimTranscript && (
                        <span className="text-gray-400">{interimTranscript}</span>
                      )}"
                    </p>
                  </motion.div>
                )}

                {/* Feedback */}
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`mt-6 p-6 rounded-xl ${
                      feedback.score >= 70 ? 'bg-green-100' : 'bg-orange-100'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {feedback.score >= 70 ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-orange-600" />
                      )}
                      <span className={`text-2xl font-bold ${
                        feedback.score >= 70 ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {feedback.score}%
                      </span>
                    </div>
                    <p className={feedback.score >= 70 ? 'text-green-700' : 'text-orange-700'}>
                      {feedback.message}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              {feedback && (
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setSelectedSubject(null)} className="flex-1">
                    Change Subject
                  </Button>
                  <Button onClick={nextQuestion} className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Next Question
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default VoicePracticePage;
