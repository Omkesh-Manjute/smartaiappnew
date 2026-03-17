import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { testAttemptDB, notificationDB } from '@/services/supabaseDB';
import { useGamification } from '@/contexts/GamificationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Mail,
  Crown,
  Target,
  Clock,
  Flame,
  Award,
  Bell,
  LogOut,
  Edit,
} from 'lucide-react';
import type { TestAttempt, Notification } from '@/types';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { gamification, isLoading: gamificationLoading } = useGamification();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        try {
          const [attemptsData, notificationsData] = await Promise.all([
            testAttemptDB.getByStudent(user.id),
            notificationDB.getByUser(user.id),
          ]);
          setAttempts(attemptsData);
          setNotifications(notificationsData);
        } catch (error) {
          console.error("Failed to load profile data:", error);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const markNotificationRead = (id: string) => {
    notificationDB.markAsRead(id);
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'battle':
        return <Target className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!user || gamificationLoading || loading || !gamification) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xl font-bold">Profile</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                    {gamification.level}
                  </div>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                    <Badge className="bg-purple-100 text-purple-700">
                      <Crown className="w-3 h-3 mr-1" />
                      Level {gamification.level}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700">
                      <Target className="w-3 h-3 mr-1" />
                      {attempts.length} Tests
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-700">
                      <Flame className="w-3 h-3 mr-1" />
                      {gamification.streak} Streak
                    </Badge>
                  </div>
                </div>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{gamification.xp.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total XP</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{gamification.badges.length}</p>
              <p className="text-sm text-gray-500">Badges</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">{gamification.coins}</p>
              <p className="text-sm text-gray-500">Coins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-orange-600">{gamification.totalStudyTime}</p>
              <p className="text-sm text-gray-500">Study Hours</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="activity">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {attempts.length > 0 ? (
                  <div className="space-y-3">
                    {attempts.slice(-10).reverse().map((attempt) => (
                      <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Test Completed</p>
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
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No activity yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Earned Badges</CardTitle>
              </CardHeader>
              <CardContent>
                {gamification.badges.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {gamification.badges.map((badge) => (
                      <div key={badge.id} className="p-4 border rounded-xl text-center">
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <p className="font-medium text-sm">{badge.name}</p>
                        <p className="text-xs text-gray-500">{badge.description}</p>
                        <Badge className="mt-2 capitalize" variant="outline">
                          {badge.rarity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No badges yet</p>
                    <p className="text-sm">Complete tests and challenges to earn badges!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Notifications</CardTitle>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      notificationDB.markAllAsRead(user.id);
                      setNotifications(notifications.map((n) => ({ ...n, read: true })));
                    }}
                  >
                    Mark all read
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationRead(notification.id)}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          notification.read ? 'bg-gray-50' : 'bg-blue-50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${notification.read ? 'text-gray-700' : 'text-blue-700'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No notifications</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProfilePage;
