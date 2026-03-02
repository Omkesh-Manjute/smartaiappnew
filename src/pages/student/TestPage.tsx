import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { testDB, testAttemptDB } from '@/services/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Clock,
  Target,
  TrendingUp,
  Play,
  CheckCircle,
  AlertCircle,
  Award,
} from 'lucide-react';
import type { Test, TestAttempt } from '@/types';

const TestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);

  useEffect(() => {
    const allTests = testDB.getAll().filter((t) => t.isActive);
    setTests(allTests);

    if (user) {
      const userAttempts = testAttemptDB.getByStudent(user.id);
      setAttempts(userAttempts);
    }
  }, [user]);

  const getTestAttempts = (testId: string) => {
    return attempts.filter((a) => a.testId === testId);
  };

  const getBestScore = (testId: string) => {
    const testAttempts = getTestAttempts(testId);
    if (testAttempts.length === 0) return null;
    return Math.max(...testAttempts.map((a) => a.percentage));
  };

  const getAverageScore = () => {
    if (attempts.length === 0) return 0;
    return Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length);
  };

  const stats = [
    { label: 'Tests Available', value: tests.length, icon: Target, color: 'text-blue-500' },
    { label: 'Tests Taken', value: attempts.length, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Average Score', value: getAverageScore(), icon: TrendingUp, color: 'text-purple-500', suffix: '%' },
    { label: 'Passed', value: attempts.filter((a) => a.isPassed).length, icon: Award, color: 'text-yellow-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/student/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xl font-bold">Tests</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 border"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">
                {stat.value}{stat.suffix || ''}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tests List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Available Tests</h2>
          {tests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tests.map((test, index) => {
                const bestScore = getBestScore(test.id);
                const attemptCount = getTestAttempts(test.id).length;

                return (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{test.title}</h3>
                            <p className="text-sm text-gray-500">{test.description}</p>
                          </div>
                          {bestScore !== null && (
                            <Badge
                              className={
                                bestScore >= 70
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-orange-100 text-orange-700'
                              }
                            >
                              Best: {bestScore}%
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {test.duration} mins
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {test.questions.length} questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            {test.totalMarks} marks
                          </span>
                        </div>

                        {attemptCount > 0 && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-500">Attempts</span>
                              <span className="font-medium">{attemptCount}</span>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={() => navigate(`/student/test/${test.id}`)}
                          className="w-full"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {attemptCount > 0 ? 'Retake Test' : 'Start Test'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No tests available yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Check back later for new tests
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default TestPage;
