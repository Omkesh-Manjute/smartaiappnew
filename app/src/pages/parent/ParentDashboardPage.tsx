import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { parentChildDB, userDB, gamificationDB, testAttemptDB, progressDB } from '@/services/supabaseDB';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Users,
  TrendingUp,
  Target,
  Clock,
  Flame,
  BookOpen,
  Activity,
  LogOut,
} from 'lucide-react';
import type { User, GamificationData, TestAttempt } from '@/types';

interface ChildData {
  user: User;
  gamification: GamificationData | null;
  attempts: TestAttempt[];
  progress: any[];
}

const ParentDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [children, setChildren] = useState<ChildData[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);

  useEffect(() => {
    if (user) {
      const loadAllData = async () => {
        try {
          const relations = await parentChildDB.getByParent(user.id);
          const childData: ChildData[] = await Promise.all(
            relations.map(async (rel) => {
              const [childUser, gamification, attempts, progress] = await Promise.all([
                userDB.getById(rel.childId),
                gamificationDB.getByStudent(rel.childId),
                testAttemptDB.getByStudent(rel.childId),
                progressDB.getByStudent(rel.childId),
              ]);
              return {
                user: childUser!,
                gamification,
                attempts,
                progress,
              };
            })
          );
          setChildren(childData);
          if (childData.length > 0) {
            setSelectedChild(childData[0]);
          }
        } catch (error) {
          console.error("Failed to load parent dashboard data:", error);
          toast.error("Failed to load children's data");
        }
      };
      loadAllData();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const getRecentActivity = (child: ChildData) => {
    return child.attempts.slice(-5).reverse().map((attempt) => ({
      type: 'test' as const,
      title: `Test Completed`,
      description: `Scored ${attempt.percentage}%`,
      date: attempt.completedAt,
      status: attempt.isPassed ? 'passed' : 'failed',
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Parent Dashboard</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-2">No Children Linked</h2>
            <p className="text-gray-500">Contact your school to link your children's accounts.</p>
          </div>
        ) : (
          <>
            {/* Child Selector */}
            <div className="flex gap-3 mb-6 overflow-x-auto">
              {children.map((child) => (
                <button
                  key={child.user.id}
                  onClick={() => setSelectedChild(child)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    selectedChild?.user.id === child.user.id
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={child.user.avatar} />
                    <AvatarFallback>{child.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold">{child.user.name}</p>
                    <p className="text-xs">Level {child.gamification?.level || 1}</p>
                  </div>
                </button>
              ))}
            </div>

            {selectedChild && (
              <motion.div
                key={selectedChild.user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-blue-500" />
                        <span className="text-sm text-gray-500">Tests Taken</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedChild.attempts.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-500">Avg Score</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {selectedChild.attempts.length > 0
                          ? Math.round(selectedChild.attempts.reduce((acc, a) => acc + a.percentage, 0) / selectedChild.attempts.length)
                          : 0}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-purple-500" />
                        <span className="text-sm text-gray-500">Study Time</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedChild.gamification?.totalStudyTime || 0}h</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-sm text-gray-500">Streak</span>
                      </div>
                      <p className="text-2xl font-bold">{selectedChild.gamification?.streak || 0} days</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Progress Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Learning Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>XP Progress</span>
                            <span>{selectedChild.gamification?.xp || 0} XP</span>
                          </div>
                          <Progress value={((selectedChild.gamification?.xp || 0) % 1000) / 10} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Level {selectedChild.gamification?.level || 1}</span>
                            <span>{selectedChild.gamification?.badges.length || 0} Badges</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {(selectedChild.gamification?.badges.slice(0, 5) || []).map((badge) => (
                              <span key={badge.id} className="text-2xl" title={badge.name}>
                                {badge.icon}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-500" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {getRecentActivity(selectedChild).length > 0 ? (
                        <div className="space-y-3">
                          {getRecentActivity(selectedChild).map((activity, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium">{activity.title}</p>
                                <p className="text-sm text-gray-500">{activity.description}</p>
                              </div>
                              <Badge className={activity.status === 'passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                {activity.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No recent activity</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Test History */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-500" />
                      Test History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedChild.attempts.length > 0 ? (
                      <div className="space-y-3">
                        {selectedChild.attempts.slice(-10).reverse().map((attempt) => (
                          <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">Test #{attempt.testId.slice(-4)}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(attempt.completedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${attempt.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                                {attempt.percentage}%
                              </p>
                              <p className="text-xs text-gray-500">
                                {attempt.score}/{attempt.totalMarks}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No tests taken yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ParentDashboardPage;
