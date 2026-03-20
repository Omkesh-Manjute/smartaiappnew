import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { subjectDB, progressDB } from '@/services/supabaseDB';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  ChevronLeft,
  Lock,
  CheckCircle,
  PlayCircle,
  Clock,
  FileText,
} from 'lucide-react';
import type { Subject, Chapter, StudentProgress, Board } from '@/types';

const SubjectsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subjectId } = useParams();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [progress, setProgress] = useState<Record<string, StudentProgress>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await subjectDB.getAll();
        const activeBoard = user?.board || 'CBSE';
        
        console.log('Fetched subjects:', data); // Debug log
        
        // Final fallback: If data is empty but we have local subjects, use them for now
        // Filter out deleted subjects tracking if exists in localStorage
        const deletedSubjectIds = JSON.parse(localStorage.getItem('smart_learning_deleted_subjects') || '[]');

        const filteredSubjects = data.filter((s) => {
          // Filter by board
          const supportsBoard = !activeBoard || !s.boards_supported || s.boards_supported.length === 0 || s.boards_supported.includes(activeBoard as any);
          // Filter out deleted ones
          const isNotDeleted = !deletedSubjectIds.includes(s.id);
          return supportsBoard && isNotDeleted;
        });
        
        setSubjects(filteredSubjects);

        if (subjectId) {
          const subject = filteredSubjects.find((s) => s.id === subjectId);
          if (subject) {
            setSelectedSubject(subject);
          } else {
            setSelectedSubject(null);
          }
        } else {
          setSelectedSubject(null);
        }

        if (user) {
          const userProgress = await progressDB.getByStudent(user.id);
          const progressMap: Record<string, StudentProgress> = {};
          userProgress.forEach((p) => {
            progressMap[p.chapterId] = p;
          });
          setProgress(progressMap);
        }
      } catch (error) {
        console.error("Failed to load subject data:", error);
      }
    };
    loadData();
  }, [subjectId, user]);

  const getChapterStatus = (chapter: Chapter, index: number) => {
    const chapterProgress = progress[chapter.id];
    if (chapterProgress?.completed) return 'completed';
    const prevChapterId = selectedSubject?.chapters[index - 1]?.id;
    if (index === 0 || (prevChapterId && progress[prevChapterId]?.completed)) {
      return 'unlocked';
    }
    return 'locked';
  };

  const getSubjectProgress = (subject: Subject) => {
    const completedChapters = subject.chapters.filter(
      (c) => progress[c.id]?.completed
    ).length;
    return Math.round((completedChapters / subject.chapters.length) * 100);
  };

  if (selectedSubject) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <header className="bg-white border-b sticky top-[64px] z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 h-16">
              <button
                onClick={() => navigate('/student/subjects')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className={`w-10 h-10 rounded-xl ${selectedSubject.color} flex items-center justify-center text-xl`}>
                {selectedSubject.icon}
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {(() => {
                    const nameObj = selectedSubject.name;
                    if (typeof nameObj === 'string') {
                      try {
                        const parsed = JSON.parse(nameObj);
                        return (parsed[user?.board || 'CBSE'] || parsed['CBSE'] || nameObj);
                      } catch { return nameObj; }
                    }
                    return (nameObj[user?.board || 'CBSE'] || (nameObj as any)?.CBSE || 'Subject');
                  })()}
                </h1>
                <p className="text-sm text-gray-500">{selectedSubject.chapters.length} chapters</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Progress */}
          <div className="bg-white rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Overall Progress</span>
              <span className="text-blue-600 font-bold">{getSubjectProgress(selectedSubject)}%</span>
            </div>
            <Progress value={getSubjectProgress(selectedSubject)} className="h-3" />
          </div>

          {/* Chapters */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Chapters</h2>
            {selectedSubject.chapters.map((chapter, index) => {
              const status = getChapterStatus(chapter, index);
              const isLocked = status === 'locked';
              const isCompleted = status === 'completed';

              return (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`cursor-pointer transition-all ${
                      isLocked ? 'opacity-60' : 'hover:shadow-md'
                    }`}
                    onClick={() => {
                      if (!isLocked) {
                        navigate(`/student/chapter/${chapter.id}`);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isCompleted
                              ? 'bg-green-100 text-green-600'
                              : isLocked
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : isLocked ? (
                            <Lock className="w-6 h-6" />
                          ) : (
                            <PlayCircle className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {(() => {
                                const nameObj = chapter.name;
                                if (typeof nameObj === 'string') {
                                  try {
                                    const parsed = JSON.parse(nameObj);
                                    return (parsed[user?.board || 'CBSE'] || parsed['CBSE'] || nameObj);
                                  } catch { return nameObj; }
                                }
                                return (nameObj[user?.board || 'CBSE'] || (nameObj as any)?.CBSE || 'Chapter');
                              })()}
                            </h3>
                            {isCompleted && (
                              <Badge className="bg-green-100 text-green-700">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {(() => {
                              const descObj = chapter.description;
                              if (typeof descObj === 'string') {
                                try {
                                  const parsed = JSON.parse(descObj);
                                  return (parsed[user?.board || 'CBSE'] || parsed['CBSE'] || descObj);
                                } catch { return descObj; }
                              }
                              return ((descObj as any)?.[user?.board || 'CBSE'] || (descObj as any)?.CBSE || '');
                            })()}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {chapter.mcqs.length} MCQs
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              15 mins
                            </span>
                          </div>
                        </div>
                        <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Subjects
              </span>
            </div>
            <Button variant="ghost" onClick={() => navigate('/student/dashboard')}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/student/subject/${subject.id}`)}
              className="cursor-pointer"
            >
              <Card className="hover:shadow-lg transition-all overflow-hidden">
                <div className={`h-24 ${subject.color} flex items-center justify-center`}>
                  <span className="text-5xl">{subject.icon}</span>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-1">
                    {(() => {
                      const nameObj = subject.name;
                      if (typeof nameObj === 'string') {
                        try {
                          const parsed = JSON.parse(nameObj);
                          return (parsed[user?.board || 'CBSE'] || parsed['CBSE'] || nameObj);
                        } catch { return nameObj; }
                      }
                      return (nameObj[user?.board || 'CBSE'] || (nameObj as any)?.CBSE || 'Subject');
                    })()}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {(() => {
                      const descObj = subject.description;
                      if (typeof descObj === 'string') {
                        try {
                          const parsed = JSON.parse(descObj);
                          return (parsed[user?.board || 'CBSE'] || parsed['CBSE'] || descObj);
                        } catch { return descObj; }
                      }
                      return (descObj?.[user?.board || 'CBSE'] || (descObj as any)?.CBSE || 'No description');
                    })()}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{subject.chapters.length} chapters</span>
                      <span className="font-medium">{getSubjectProgress(subject)}%</span>
                    </div>
                    <Progress value={getSubjectProgress(subject)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SubjectsPage;
