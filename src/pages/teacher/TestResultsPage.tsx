import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { testDB, testAttemptDB, userDB } from '@/services/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  Users,
  TrendingUp,
  Target,
  Award,
  Download,
  BarChart3,
} from 'lucide-react';
import type { Test, TestAttempt } from '@/types';

const TestResultsPage = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [test, setTest] = useState<Test | null>(null);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);

  useEffect(() => {
    if (testId) {
      const testData = testDB.getById(testId);
      if (testData) {
        setTest(testData);
        setAttempts(testAttemptDB.getByTest(testId));
      }
    }
  }, [testId]);

  const stats = {
    totalAttempts: attempts.length,
    avgScore: attempts.length > 0
      ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / attempts.length)
      : 0,
    passRate: attempts.length > 0
      ? Math.round((attempts.filter((a) => a.isPassed).length / attempts.length) * 100)
      : 0,
    highestScore: attempts.length > 0
      ? Math.max(...attempts.map((a) => a.percentage))
      : 0,
  };

  const scoreDistribution = {
    excellent: attempts.filter((a) => a.percentage >= 90).length,
    good: attempts.filter((a) => a.percentage >= 70 && a.percentage < 90).length,
    average: attempts.filter((a) => a.percentage >= 50 && a.percentage < 70).length,
    poor: attempts.filter((a) => a.percentage < 50).length,
  };

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button onClick={() => navigate('/teacher/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{test.title}</h1>
              <p className="text-sm text-gray-500">Test Results</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-500">Attempts</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalAttempts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-500">Avg Score</span>
              </div>
              <p className="text-2xl font-bold">{stats.avgScore}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-500">Pass Rate</span>
              </div>
              <p className="text-2xl font-bold">{stats.passRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-500">Highest</span>
              </div>
              <p className="text-2xl font-bold">{stats.highestScore}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Excellent (90-100%)', count: scoreDistribution.excellent, color: 'bg-green-500' },
                  { label: 'Good (70-89%)', count: scoreDistribution.good, color: 'bg-blue-500' },
                  { label: 'Average (50-69%)', count: scoreDistribution.average, color: 'bg-yellow-500' },
                  { label: 'Poor (0-49%)', count: scoreDistribution.poor, color: 'bg-red-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.label}</span>
                      <span className="font-medium">{item.count} students</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color}`}
                        style={{ width: `${attempts.length > 0 ? (item.count / attempts.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Attempts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Attempts</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {attempts.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {attempts.slice(-10).reverse().map((attempt) => {
                    const student = userDB.getById(attempt.studentId);
                    return (
                      <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{student?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(attempt.completedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={attempt.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {attempt.percentage}%
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {attempt.score}/{attempt.totalMarks}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No attempts yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TestResultsPage;
