import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { testDB, testAttemptDB, homeworkDB, teacherAnalyticsDB, storageDB } from '@/services/supabaseDB';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Plus,
  Users,
  TrendingUp,
  Target,
  Clock,
  ChevronRight,
  BarChart3,
  FileText,
  Upload,
  Calendar,
  CheckCircle,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import type { Test, TestAttempt, Homework, Subject, TeacherAnalytics } from '@/types';
import { subjectDB } from '@/services/supabaseDB';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newHomework, setNewHomework] = useState({
    title: '',
    description: '',
    subjectId: '',
    chapterId: '',
    dueDate: '',
    maxMarks: 100,
    file: null as File | null,
  });
  const [stats, setStats] = useState({
    totalTests: 0,
    totalAttempts: 0,
    avgScore: 0,
    activeStudents: 0,
    totalHomework: 0,
    pendingSubmissions: 0,
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Load tests
      const teacherTests = await testDB.getByTeacher(user.id);
      setTests(teacherTests);

      // Load attempts
      let allAttempts: TestAttempt[] = [];
      for (const test of teacherTests) {
        const attempts = await testAttemptDB.getByTest(test.id);
        allAttempts = [...allAttempts, ...attempts];
      }
      setAttempts(allAttempts);

      // Load homework
      const teacherHomework = await homeworkDB.getByTeacher(user.id);
      setHomework(teacherHomework);

      // Load subjects
      const allSubjects = await subjectDB.getAll();
      setSubjects(allSubjects);

      // Load analytics
      const teacherAnalytics = await teacherAnalyticsDB.getAnalytics(user.id);
      setAnalytics(teacherAnalytics);

      // Calculate stats
      const uniqueStudents = new Set(allAttempts.map((a) => a.studentId));
      
      // Count pending submissions (simplified)
      const pendingCount = 0;

      setStats({
        totalTests: teacherTests.length,
        totalAttempts: allAttempts.length,
        avgScore: allAttempts.length > 0
          ? Math.round(allAttempts.reduce((acc, a) => acc + a.percentage, 0) / allAttempts.length)
          : 0,
        activeStudents: uniqueStudents.size,
        totalHomework: teacherHomework.length,
        pendingSubmissions: pendingCount,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleCreateHomework = async () => {
    if (!user) return;
    
    if (!newHomework.title || !newHomework.subjectId || !newHomework.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    try {
      let fileUrl = null;
      let fileName = null;

      // Upload file if provided
      if (newHomework.file) {
        const path = `homework/${user.id}/${Date.now()}_${newHomework.file.name}`;
        fileUrl = await storageDB.uploadFile('homework', path, newHomework.file);
        fileName = newHomework.file.name;
      }

      // Create homework
      const homework: Homework = {
        id: `hw_${Date.now()}`,
        title: newHomework.title,
        description: newHomework.description,
        subjectId: newHomework.subjectId,
        chapterId: newHomework.chapterId || null,
        teacherId: user.id,
        fileUrl,
        fileName,
        dueDate: new Date(newHomework.dueDate),
        maxMarks: newHomework.maxMarks,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await homeworkDB.create(homework);
      toast.success('Homework created successfully');
      
      // Reset form and reload
      setNewHomework({
        title: '',
        description: '',
        subjectId: '',
        chapterId: '',
        dueDate: '',
        maxMarks: 100,
        file: null,
      });
      loadData();
    } catch (error) {
      console.error('Error creating homework:', error);
      toast.error('Failed to create homework');
    } finally {
      setIsUploading(false);
    }
  };

  const selectedSubject = subjects.find(s => s.id === newHomework.subjectId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Teacher Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{user?.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2">
            {[
              { label: 'Dashboard', path: '/teacher/dashboard', active: true },
              { label: 'Create Test', path: '/teacher/create-test' },
              { label: 'Homework', path: '/teacher/homework' },
              { label: 'Analytics', path: '/teacher/analytics' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  item.active ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white mb-6"
        >
          <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-white/80">Create tests, assign homework, and track your students' progress.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'Tests Created', value: stats.totalTests, icon: FileText, color: 'text-blue-500' },
            { label: 'Total Attempts', value: stats.totalAttempts, icon: Target, color: 'text-green-500' },
            { label: 'Avg Score', value: stats.avgScore, icon: TrendingUp, color: 'text-purple-500', suffix: '%' },
            { label: 'Active Students', value: stats.activeStudents, icon: Users, color: 'text-orange-500' },
            { label: 'Homework', value: stats.totalHomework, icon: BookOpen, color: 'text-pink-500' },
            { label: 'Pending', value: stats.pendingSubmissions, icon: AlertCircle, color: 'text-red-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-4 border"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-gray-500">{stat.label}</span>
              </div>
              <p className="text-xl font-bold">{stat.value}{stat.suffix || ''}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button onClick={() => navigate('/teacher/create-test')}>
            <Plus className="w-4 h-4 mr-2" />
            Create Test
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Assign Homework
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Homework</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={newHomework.title}
                    onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                    placeholder="e.g., Math Worksheet Chapter 5"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newHomework.description}
                    onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
                    placeholder="Instructions for students..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Subject *</Label>
                    <Select
                      value={newHomework.subjectId}
                      onValueChange={(value) => setNewHomework({ ...newHomework, subjectId: value, chapterId: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Chapter</Label>
                    <Select
                      value={newHomework.chapterId}
                      onValueChange={(value) => setNewHomework({ ...newHomework, chapterId: value })}
                      disabled={!selectedSubject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedSubject?.chapters.map((chapter) => (
                          <SelectItem key={chapter.id} value={chapter.id}>
                            {chapter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Due Date *</Label>
                    <Input
                      type="datetime-local"
                      value={newHomework.dueDate}
                      onChange={(e) => setNewHomework({ ...newHomework, dueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Max Marks</Label>
                    <Input
                      type="number"
                      value={newHomework.maxMarks}
                      onChange={(e) => setNewHomework({ ...newHomework, maxMarks: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Attachment (Optional)</Label>
                  <Input
                    type="file"
                    onChange={(e) => setNewHomework({ ...newHomework, file: e.target.files?.[0] || null })}
                  />
                  {newHomework.file && (
                    <p className="text-sm text-gray-500 mt-1">
                      Selected: {newHomework.file.name}
                    </p>
                  )}
                </div>
                <Button 
                  onClick={handleCreateHomework} 
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Homework
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => navigate('/teacher/analytics')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>

        {/* Tabs for Tests and Homework */}
        <Tabs defaultValue="tests" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tests">Tests ({tests.length})</TabsTrigger>
            <TabsTrigger value="homework">Homework ({homework.length})</TabsTrigger>
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="tests">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Tests</CardTitle>
                <Badge variant="outline">{tests.length} tests</Badge>
              </CardHeader>
              <CardContent>
                {tests.length > 0 ? (
                  <div className="space-y-3">
                    {tests.map((test, index) => {
                      const testAttempts = attempts.filter((a) => a.testId === test.id);
                      const avgScore = testAttempts.length > 0
                        ? Math.round(testAttempts.reduce((acc, a) => acc + a.percentage, 0) / testAttempts.length)
                        : 0;

                      return (
                        <motion.div
                          key={test.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => navigate(`/teacher/test-results/${test.id}`)}
                          className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md cursor-pointer transition-all"
                        >
                          <div>
                            <h3 className="font-semibold">{test.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {test.duration} mins
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                {test.questions.length} questions
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {testAttempts.length} attempts
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Avg Score</p>
                              <p className={`font-bold ${avgScore >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                                {avgScore}%
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No tests created yet</p>
                    <Button onClick={() => navigate('/teacher/create-test')} className="mt-3">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Test
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homework">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Assigned Homework</CardTitle>
                <Badge variant="outline">{homework.length} assignments</Badge>
              </CardHeader>
              <CardContent>
                {homework.length > 0 ? (
                  <div className="space-y-3">
                    {homework.map((hw, index) => {
                      const isOverdue = new Date(hw.dueDate) < new Date();
                      
                      return (
                        <motion.div
                          key={hw.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition-all"
                        >
                          <div>
                            <h3 className="font-semibold">{hw.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {subjects.find(s => s.id === hw.subjectId)?.name || 'Unknown'}
                              </span>
                              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
                                <Calendar className="w-4 h-4" />
                                Due: {new Date(hw.dueDate).toLocaleDateString()}
                              </span>
                              {hw.fileName && (
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  {hw.fileName}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant={isOverdue ? 'destructive' : 'default'}>
                              {isOverdue ? 'Overdue' : 'Active'}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No homework assigned yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics ? (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-blue-600">Total Students</p>
                        <p className="text-2xl font-bold text-blue-700">{analytics.totalStudents}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-600">Tests Created</p>
                        <p className="text-2xl font-bold text-green-700">{analytics.totalTests}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-purple-600">Homework Assigned</p>
                        <p className="text-2xl font-bold text-purple-700">{analytics.totalHomework}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <p className="text-sm text-orange-600">Average Score</p>
                        <p className="text-2xl font-bold text-orange-700">{analytics.averageScore.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Student Performance */}
                    <div>
                      <h3 className="font-semibold mb-3">Student Performance</h3>
                      {analytics.studentPerformance.length > 0 ? (
                        <div className="space-y-2">
                          {analytics.studentPerformance.slice(0, 5).map((student) => (
                            <div key={student.studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium">{student.name}</span>
                              <div className="flex gap-4 text-sm">
                                <span className="text-blue-600">{student.testsTaken} tests</span>
                                <span className="text-green-600">{student.averageScore.toFixed(0)}% avg</span>
                                <span className="text-purple-600">{student.homeworkSubmitted} HW</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No student data available yet</p>
                      )}
                    </div>

                    {/* Test Performance */}
                    <div>
                      <h3 className="font-semibold mb-3">Test Performance</h3>
                      {analytics.testPerformance.length > 0 ? (
                        <div className="space-y-2">
                          {analytics.testPerformance.map((test) => (
                            <div key={test.testId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium">{test.testName}</span>
                              <div className="flex gap-4 text-sm">
                                <span className="text-blue-600">{test.totalAttempts} attempts</span>
                                <span className="text-green-600">{test.averageScore.toFixed(0)}% avg</span>
                                <span className="text-purple-600">{test.passRate.toFixed(0)}% pass</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No test data available yet</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Analytics data loading...</p>
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

export default TeacherDashboard;
