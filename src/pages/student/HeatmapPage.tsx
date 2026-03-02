import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { subjectDB, conceptMasteryDB } from '@/services/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  Brain,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Lightbulb,
} from 'lucide-react';
import type { Subject, ConceptMastery } from '@/types';

const HeatmapPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [masteryData, setMasteryData] = useState<ConceptMastery[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  useEffect(() => {
    setSubjects(subjectDB.getAll());
    if (user) {
      setMasteryData(conceptMasteryDB.getByStudent(user.id));
    }
  }, [user]);

  const getMasteryColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-yellow-500';
    if (level >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMasteryLabel = (level: number) => {
    if (level >= 80) return 'Mastered';
    if (level >= 60) return 'Proficient';
    if (level >= 40) return 'Developing';
    return 'Needs Practice';
  };

  const getChapterMastery = (subjectId: string, chapterId: string) => {
    const chapterMastery = masteryData.filter(
      (m) => m.subjectId === subjectId && m.chapterId === chapterId
    );
    if (chapterMastery.length === 0) return 0;
    return Math.round(
      chapterMastery.reduce((acc, m) => acc + m.masteryLevel, 0) / chapterMastery.length
    );
  };

  const getSubjectMastery = (subjectId: string) => {
    const subjectMastery = masteryData.filter((m) => m.subjectId === subjectId);
    if (subjectMastery.length === 0) return 0;
    return Math.round(
      subjectMastery.reduce((acc, m) => acc + m.masteryLevel, 0) / subjectMastery.length
    );
  };

  const getWeakAreas = () => {
    return masteryData
      .filter((m) => m.masteryLevel < 50)
      .sort((a, b) => a.masteryLevel - b.masteryLevel)
      .slice(0, 5);
  };

  const getStrongAreas = () => {
    return masteryData
      .filter((m) => m.masteryLevel >= 80)
      .sort((a, b) => b.masteryLevel - a.masteryLevel)
      .slice(0, 5);
  };

  const weakAreas = getWeakAreas();
  const strongAreas = getStrongAreas();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <Brain className="w-6 h-6 text-pink-500" />
              <span className="text-xl font-bold">Brain Map</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{strongAreas.length}</p>
                  <p className="text-sm text-gray-500">Strong Areas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {masteryData.length > 0
                      ? Math.round(masteryData.reduce((acc, m) => acc + m.masteryLevel, 0) / masteryData.length)
                      : 0}%
                  </p>
                  <p className="text-sm text-gray-500">Overall Mastery</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{weakAreas.length}</p>
                  <p className="text-sm text-gray-500">Needs Practice</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subject Heatmaps */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Subject Mastery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjects.map((subject) => {
                    const mastery = getSubjectMastery(subject.id);
                    return (
                      <motion.div
                        key={subject.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 border rounded-xl hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setSelectedSubject(selectedSubject?.id === subject.id ? null : subject)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg ${subject.color} flex items-center justify-center text-lg`}>
                            {subject.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <h3 className="font-semibold">{subject.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                mastery >= 80 ? 'bg-green-100 text-green-700' :
                                mastery >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                mastery >= 40 ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {getMasteryLabel(mastery)}
                              </span>
                            </div>
                            <Progress value={mastery} className="h-2 mt-2" />
                          </div>
                          <span className="font-bold text-lg">{mastery}%</span>
                        </div>

                        {/* Chapter Breakdown */}
                        {selectedSubject?.id === subject.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 pt-4 border-t"
                          >
                            <p className="text-sm font-medium mb-3">Chapter Breakdown:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {subject.chapters.map((chapter) => {
                                const chapterMastery = getChapterMastery(subject.id, chapter.id);
                                return (
                                  <div
                                    key={chapter.id}
                                    className="p-2 rounded-lg bg-gray-50"
                                  >
                                    <p className="text-xs text-gray-600 truncate">{chapter.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full ${getMasteryColor(chapterMastery)}`}
                                          style={{ width: `${chapterMastery}%` }}
                                        />
                                      </div>
                                      <span className="text-xs font-medium">{chapterMastery}%</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weak Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weakAreas.length > 0 ? (
                  <div className="space-y-3">
                    {weakAreas.map((area, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-600 font-bold">{area.masteryLevel}%</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{area.conceptName}</p>
                          <p className="text-xs text-gray-500">{area.chapterId}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>Great job! No weak areas.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Strong Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Lightbulb className="w-5 h-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                {strongAreas.length > 0 ? (
                  <div className="space-y-3">
                    {strongAreas.map((area, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-bold">{area.masteryLevel}%</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{area.conceptName}</p>
                          <p className="text-xs text-gray-500">{area.chapterId}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Keep practicing to build strengths!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeatmapPage;
