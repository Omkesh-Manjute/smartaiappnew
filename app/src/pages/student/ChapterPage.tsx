import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { progressDB, subjectDB, notificationDB } from '@/services/supabaseDB';
import { useGamification } from '@/contexts/GamificationContext';
import { translateContent } from '@/services/geminiAPI';
import { useTextToSpeech, cleanTextForTTS } from '@/hooks/useTextToSpeech';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  ChevronLeft,
  BookOpen,
  Play,
  CheckCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  ArrowRight,
  Star,
  Languages,
  Loader2,
} from 'lucide-react';
import type { Chapter, Subject } from '@/types';

const ChapterPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addXP } = useGamification();
  const { chapterId } = useParams();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const { speak, stop, isSpeaking, currentCharIndex } = useTextToSpeech();
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [showMcqResults, setShowMcqResults] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);

  // Translation State
  const [contentLang, setContentLang] = useState<'en' | 'hi'>('en');
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Auto-scroll to currently highlighted word
  useEffect(() => {
    if (isSpeaking && currentCharIndex >= 0) {
      const el = document.getElementById('current-tts-word');
      if (el) {
        // Find nearest scrollable container or window
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentCharIndex, isSpeaking]);

  useEffect(() => {
    if (chapterId) {
      const loadData = async () => {
        try {
          const subjects = await subjectDB.getAll();
          for (const sub of subjects) {
            const foundChapter = sub.chapters.find((c) => c.id === chapterId);
            if (foundChapter) {
              setChapter(foundChapter);
              setSubject(sub);
              break;
            }
          }
        } catch (error) {
          console.error("Failed to load chapter data:", error);
        }
      };
      loadData();
    }
  }, [chapterId]);

  const handleLangToggle = async () => {
    if (!chapter) return;
    const newLang = contentLang === 'en' ? 'hi' : 'en';
    
    stop(); // Stop any ongoing speech

    if (newLang === 'hi' && !translatedContent['hi']) {
      setIsTranslating(true);
      try {
        const translated = await translateContent(chapter.content, 'hi');
        setTranslatedContent((prev) => ({ ...prev, hi: translated }));
      } catch (error: any) {
        toast.error(error.message || 'Translation failed. Please try again later.');
        setIsTranslating(false);
        return; // fallback to English
      }
      setIsTranslating(false);
    }

    setContentLang(newLang);
    toast.success(`Language changed to ${newLang === 'hi' ? 'Hindi' : 'English'}`);
  };

  const speakContent = () => {
    if (!chapter) return;
    if (isSpeaking) {
      stop();
    } else {
      const displayContent = contentLang === 'hi' && translatedContent['hi'] 
        ? translatedContent['hi'] 
        : chapter.content;
      const cleanedText = cleanTextForTTS(displayContent);
      speak(cleanedText, contentLang);
    }
  };

  const handleMcqAnswer = (mcqId: string, answerIndex: number) => {
    if (showMcqResults) return;
    setMcqAnswers((prev) => ({ ...prev, [mcqId]: answerIndex }));
  };

  const submitMcqs = () => {
    if (!chapter || !user) return;

    let correct = 0;
    chapter.mcqs.forEach((mcq) => {
      if (mcqAnswers[mcq.id] === mcq.correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / chapter.mcqs.length) * 100);
    setMcqScore(score);
    setShowMcqResults(true);

    // Save progress
    const passed = score >= 70;
    const saveProgress = async () => {
      try {
        await progressDB.update(user.id, chapter.id, {
          studentId: user.id,
          subjectId: chapter.subjectId,
          chapterId: chapter.id,
          completed: passed,
          mcqScore: score,
          timeSpent: 15,
          lastAccessed: new Date(),
        });

        // Update gamification
        if (passed) {
          await addXP(50);
          
          // Add notification
          await notificationDB.create({
            id: `notif_${Date.now()}`,
            userId: user.id,
            title: 'Chapter Completed!',
            message: `You completed ${chapter.name} with ${score}% score!`,
            type: 'achievement',
            read: false,
            createdAt: new Date(),
          });

          toast.success(`Congratulations! You scored ${score}%`);
        } else {
          toast.info(`You scored ${score}%. Try again to pass (70% required)`);
        }
      } catch (error) {
        console.error("Failed to save progress:", error);
        toast.error("Failed to save progress");
      }
    };
    saveProgress();
  };

  const resetMcqs = () => {
    setMcqAnswers({});
    setShowMcqResults(false);
    setMcqScore(0);
  };

  if (!chapter || !subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => navigate(`/student/subject/${subject.id}`)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold">{chapter.name}</h1>
              <p className="text-sm text-gray-500">{subject.name}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Practice ({chapter.mcqs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                  <h2 className="text-xl font-semibold">{chapter.name}</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLangToggle}
                      disabled={isTranslating}
                      className="flex items-center gap-2"
                    >
                      {isTranslating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Languages className="w-4 h-4" />
                      )}
                      {contentLang === 'en' ? 'Translate to Hindi' : 'Read in English'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={speakContent}
                      disabled={isTranslating}
                      className="flex items-center gap-2"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          Read Aloud
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                    {(() => {
                      const displayContent = contentLang === 'hi' && translatedContent['hi'] 
                        ? translatedContent['hi'] 
                        : chapter.content;
                      const cleanedText = cleanTextForTTS(displayContent);
                      
                      // Split into sentences (preserving punctuation and spacing)
                      const sentences = cleanedText.match(/[^.!?।]+[.!?।]?\s*/g) || [cleanedText];
                      let currentPos = 0;
                      
                      return sentences.map((segment, idx) => {
                        const start = currentPos;
                        currentPos += segment.length;
                        
                        // Check if current speaking cursor is within this sentence
                        const isWhitespace = /^\s+$/.test(segment);
                        const isHighlighted = !isWhitespace && isSpeaking && currentCharIndex >= start && currentCharIndex < currentPos;
                        
                        return (
                          <span 
                            key={idx}
                            id={isHighlighted ? 'current-tts-word' : undefined}
                            className={`${
                              isHighlighted 
                                ? 'bg-yellow-200 text-yellow-900 rounded px-0.5 font-medium transition-all duration-150 shadow-sm border-b-2 border-yellow-400' 
                                : ''
                            }`}
                          >
                            {segment}
                          </span>
                        );
                      });
                    })()}
                  </div>
                </div>

                {chapter.videoUrl && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Video Lesson</h3>
                    <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
                      <button className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setActiveTab('practice')}>
                    Start Practice
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="practice" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Practice Questions</h2>

                {showMcqResults && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl mb-6 ${
                      mcqScore >= 70
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {mcqScore >= 70 ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : (
                        <Star className="w-8 h-8" />
                      )}
                      <div>
                        <p className="font-bold text-lg">
                          You scored {mcqScore}% ({Math.round((mcqScore / 100) * chapter.mcqs.length)}/{chapter.mcqs.length})
                        </p>
                        <p className="text-sm">
                          {mcqScore >= 70
                            ? 'Great job! You passed this chapter.'
                            : 'Keep practicing! You need 70% to pass.'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-6">
                  {chapter.mcqs.map((mcq, index) => (
                    <motion.div
                      key={mcq.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-xl p-4"
                    >
                      <p className="font-medium mb-3">
                        {index + 1}. {mcq.question}
                      </p>
                      <div className="space-y-2">
                        {mcq.options.map((option, optionIndex) => {
                          const isSelected = mcqAnswers[mcq.id] === optionIndex;
                          const isCorrect = mcq.correctAnswer === optionIndex;
                          const showCorrect = showMcqResults && isCorrect;
                          const showWrong = showMcqResults && isSelected && !isCorrect;

                          return (
                            <button
                              key={optionIndex}
                              onClick={() => handleMcqAnswer(mcq.id, optionIndex)}
                              disabled={showMcqResults}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                showCorrect
                                  ? 'border-green-500 bg-green-50'
                                  : showWrong
                                  ? 'border-red-500 bg-red-50'
                                  : isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                                    showCorrect
                                      ? 'bg-green-500 text-white'
                                      : showWrong
                                      ? 'bg-red-500 text-white'
                                      : isSelected
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-200'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optionIndex)}
                                </span>
                                <span>{option}</span>
                                {showCorrect && <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {showMcqResults && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 p-3 bg-blue-50 rounded-lg"
                        >
                          <p className="text-sm text-blue-800">
                            <strong>Explanation:</strong> {mcq.explanation}
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 flex justify-between">
                  {!showMcqResults ? (
                    <Button
                      onClick={submitMcqs}
                      disabled={Object.keys(mcqAnswers).length < chapter.mcqs.length}
                      className="w-full"
                    >
                      Submit Answers
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={resetMcqs}>
                        Try Again
                      </Button>
                      {mcqScore >= 70 && (
                        <Button onClick={() => navigate(`/student/subject/${subject.id}`)}>
                          Continue to Next Chapter
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ChapterPage;
