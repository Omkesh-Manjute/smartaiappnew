import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { gamificationDB, subjectDB, testAttemptDB, notificationDB, homeworkDB, homeworkSubmissionDB } from '@/services/supabaseDB';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import XPBar from '@/components/gamification/XPBar';
import BadgesDisplay from '@/components/gamification/BadgesDisplay';
import DailyQuote from '@/components/gamification/DailyQuote';
import AchievementNotification from '@/components/gamification/AchievementNotification';
import {
  BookOpen,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Flame,
  ChevronRight,
  Bell,
  Gamepad2,
  Mic,
  Brain,
  Calendar,
  MessageSquare,
  FileText,
  AlertCircle,
  Clock3,
} from 'lucide-react';
import type { GamificationData, Subject, TestAttempt, Homework, HomeworkSubmission } from '@/types';

const buildDefaultGamification = (studentId: string): GamificationData => ({
  studentId,
  xp: 0,
  level: 1,
  streak: 0,
  lastStudyDate: new Date(),
  totalStudyTime: 0,
  badges: [],
  unlockedAvatars: ['default'],
  unlockedThemes: ['default'],
  currentAvatar: 'default',
  coins: 0,
});

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [recentTests, setRecentTests] = useState<TestAttempt[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementData] = useState({
    type: 'badge' as const,
    title: '',
    message: '',
    icon: '',
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      let gamificationData = await gamificationDB.getByStudent(user.id);
      if (!gamificationData) {
        gamificationData = buildDefaultGamification(user.id);
        setGamification(gamificationData);
        void gamificationDB.create(gamificationData).catch(() => {
          // Ignore create failures (RLS/duplicate); local default keeps dashboard usable.
        });
      } else {
        setGamification(gamificationData);
      }

      const allSubjects = await subjectDB.getAll();
      setSubjects(allSubjects);

      const attempts = await testAttemptDB.getByStudent(user.id);
      setRecentTests(attempts.slice(-5).reverse());

      const unreadCount = await notificationDB.getUnreadCount(user.id);
      setUnreadNotifications(unreadCount);

      // Load homework for student's subjects
      const allHomework: Homework[] = [];
      for (const subject of allSubjects) {
        const subjectHomework = await homeworkDB.getBySubject(subject.id);
        allHomework.push(...subjectHomework);
      }
      setHomework(allHomework);

      // Load student's submissions
      const submissions = await homeworkSubmissionDB.getByStudent(user.id);
      setHomeworkSubmissions(submissions);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setGamification((prev) => prev ?? buildDefaultGamification(user.id));
    }
  };

  const quickActions = [
    { icon: Gamepad2, label: 'Battle Mode', color: 'bg-red-500', path: '/student/battle' },
    { icon: MessageSquare, label: 'AI Tutor', color: 'bg-purple-500', path: '/student/tutor' },
    { icon: Mic, label: 'Voice Practice', color: 'bg-green-500', path: '/student/voice' },
    { icon: Brain, label: 'Brain Map', color: 'bg-pink-500', path: '/student/heatmap' },
    { icon: Calendar, label: 'Study Plan', color: 'bg-blue-500', path: '/student/planner' },
    { icon: Trophy, label: 'Leaderboard', color: 'bg-yellow-500', path: '/student/leaderboard' },
  ];

  const stats = [
    { label: 'Tests Taken', value: recentTests.length, icon: Target, color: 'text-blue-500' },
    { label: 'Avg Score', value: recentTests.length > 0 ? Math.round(recentTests.reduce((acc, t) => acc + t.percentage, 0) / recentTests.length) : 0, icon: TrendingUp, color: 'text-green-500', suffix: '%' },
    { label: 'Study Time', value: gamification?.totalStudyTime || 0, icon: Clock, color: 'text-purple-500', suffix: 'h' },
    { label: 'Current Streak', value: gamification?.streak || 0, icon: Flame, color: 'text-orange-500', suffix: ' days' },
  ];

  // Get pending homework
  const pendingHomework = homework.filter(hw => {
    const submission = homeworkSubmissions.find(s => s.homeworkId === hw.id);
    return !submission && new Date(hw.dueDate) > new Date();
  });

  // Get overdue homework
  const overdueHomework = homework.filter(hw => {
    const submission = homeworkSubmissions.find(s => s.homeworkId === hw.id);
    return !submission && new Date(hw.dueDate) < new Date();
  });

  if (!user || !gamification) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Learning
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/student/notifications')}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">Level {gamification.level}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {[
              { label: 'Dashboard', path: '/student/dashboard', active: true },
              { label: 'Subjects', path: '/student/subjects' },
              { label: 'Tests', path: '/student/tests' },
              { label: 'Groups', path: '/student/groups' },
              { label: 'Battle', path: '/student/battle' },
              { label: 'Tutor', path: '/student/tutor' },
              { label: 'Homework', path: '/student/homework' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  item.active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white"
            >
              <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
              <p className="text-white/80 mb-4">
                You're on a {gamification.streak}-day streak! Keep learning to maintain it.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate('/student/subjects')}
                  className="bg-white text-blue-600 hover:bg-white/90"
                >
                  Continue Learning
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center p-3 rounded-xl bg-white border hover:shadow-md transition-all"
                  >
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

            {/* Homework Quick Actions */}
            {(pendingHomework.length > 0 || overdueHomework.length > 0) && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Homework
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/student/homework')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {overdueHomework.slice(0, 2).map((hw) => (
                      <div
                        key={hw.id}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                      >
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="font-medium text-red-700">{hw.title}</p>
                            <p className="text-sm text-red-600">
                              Overdue - Due {new Date(hw.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => navigate('/student/homework')}>
                          Submit Now
                        </Button>
                      </div>
                    ))}
                    {pendingHomework.slice(0, 3).map((hw) => (
                      <div
                        key={hw.id}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Clock3 className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{hw.title}</p>
                            <p className="text-sm text-gray-500">
                              Due {new Date(hw.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => navigate('/student/homework')}>
                          Start
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Continue Learning */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Continue Learning</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.slice(0, 4).map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/student/subject/${subject.id}`)}
                    className="bg-white rounded-xl p-4 border hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl ${subject.color} flex items-center justify-center text-2xl`}>
                        {subject.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{subject.name}</h3>
                        <p className="text-sm text-gray-500">{subject.chapters.length} chapters</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium">0%</span>
                          </div>
                          <Progress value={0} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Recent Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTests.length > 0 ? (
                  <div className="space-y-3">
                    {recentTests.map((test) => (
                      <div
                        key={test.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">Test #{test.testId.slice(-4)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(test.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${test.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                            {test.percentage}%
                          </p>
                          <p className="text-xs text-gray-500">
                            {test.score}/{test.totalMarks}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No tests taken yet</p>
                    <Button
                      onClick={() => navigate('/student/tests')}
                      variant="outline"
                      className="mt-3"
                    >
                      Take Your First Test
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* XP Bar */}
            <XPBar gamification={gamification} />

            {/* Daily Quote */}
            <DailyQuote />

            {/* Badges */}
            <BadgesDisplay gamification={gamification} />

            {/* Homework Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Homework Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Pending</span>
                    <Badge variant="default">{pendingHomework.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Overdue</span>
                    <Badge variant="destructive">{overdueHomework.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Submitted</span>
                    <Badge variant="outline" className="text-green-600">
                      {homeworkSubmissions.length}
                    </Badge>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => navigate('/student/homework')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Homework
                </Button>
              </CardContent>
            </Card>

            {/* Premium Banner */}
            {!user.isPremium && (
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-4 text-white">
                <h3 className="font-bold text-lg mb-2">Upgrade to Premium</h3>
                <p className="text-sm text-white/90 mb-3">
                  Unlock AI Tutor, Voice Practice, and more!
                </p>
                <Button
                  onClick={() => navigate('/school/subscription')}
                  className="w-full bg-white text-orange-600 hover:bg-white/90"
                >
                  Upgrade Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Achievement Notification */}
      <AchievementNotification
        isOpen={showAchievement}
        onClose={() => setShowAchievement(false)}
        type={achievementData.type}
        title={achievementData.title}
        message={achievementData.message}
        icon={achievementData.icon}
      />
    </div>
  );
};

export default StudentDashboard;
