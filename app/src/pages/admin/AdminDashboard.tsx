import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { userDB, subjectDB, testDB, schoolDB } from '@/services/supabaseDB';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
  Users,
  BookOpen,
  FileText,
  School,
  Settings,
  ChevronRight,
  LogOut,
  Download,
  BarChart3,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import type { User } from '@/types';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    teachers: 0,
    subjects: 0,
    tests: 0,
    schools: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const users = await userDB.getAll();
      setUsers(users);
      
      const subjects = await subjectDB.getAll();
      const tests = await testDB.getAll();
      const schools = await schoolDB.getAll();
      
      setStats({
        totalUsers: users.length,
        students: users.filter((u) => u.role === 'student').length,
        teachers: users.filter((u) => u.role === 'teacher').length,
        subjects: subjects.length,
        tests: tests.length,
        schools: schools.length,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Export users to Excel
  const exportUsersToExcel = () => {
    const exportData = users.map(user => ({
      ID: user.id,
      Name: user.name,
      Email: user.email,
      Role: user.role,
      Premium: user.isPremium ? 'Yes' : 'No',
      SchoolID: user.schoolId || 'N/A',
      CreatedAt: new Date(user.createdAt).toLocaleDateString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    
    // Auto-size columns
    const colWidths = [
      { wch: 20 }, // ID
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 10 }, // Role
      { wch: 8 },  // Grade
      { wch: 10 }, // Premium
      { wch: 15 }, // SchoolID
      { wch: 15 }, // CreatedAt
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Users exported successfully!');
  };

  // Export statistics to Excel
  const exportStatsToExcel = async () => {
    try {
      const statsData = [
        { Metric: 'Total Users', Value: stats.totalUsers },
        { Metric: 'Students', Value: stats.students },
        { Metric: 'Teachers', Value: stats.teachers },
        { Metric: 'Admins', Value: users.filter(u => u.role === 'admin').length },
        { Metric: 'Parents', Value: users.filter(u => u.role === 'parent').length },
        { Metric: 'Subjects', Value: stats.subjects },
        { Metric: 'Tests', Value: stats.tests },
        { Metric: 'Schools', Value: stats.schools },
      ];

      const ws = XLSX.utils.json_to_sheet(statsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Statistics');
      
      ws['!cols'] = [{ wch: 20 }, { wch: 10 }];

      XLSX.writeFile(wb, `platform_stats_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Statistics exported successfully!');
    } catch (error) {
      console.error('Error exporting stats:', error);
      toast.error('Failed to export statistics');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Admin Dashboard</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2">
            {[
              { label: 'Dashboard', path: '/admin/dashboard', active: true },
              { label: 'Users', path: '/admin/users' },
              { label: 'Subjects', path: '/admin/subjects' },
              { label: 'AI Settings', path: '/admin/ai-settings' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  item.active ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
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
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6"
        >
          <h1 className="text-2xl font-bold mb-2">Welcome, Admin! 👋</h1>
          <p className="text-white/80">Manage users, subjects, and monitor platform activity.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
            { label: 'Students', value: stats.students, icon: Users, color: 'bg-green-500' },
            { label: 'Teachers', value: stats.teachers, icon: Users, color: 'bg-yellow-500' },
            { label: 'Subjects', value: stats.subjects, icon: BookOpen, color: 'bg-purple-500' },
            { label: 'Tests', value: stats.tests, icon: FileText, color: 'bg-pink-500' },
            { label: 'Schools', value: stats.schools, icon: School, color: 'bg-orange-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-4 border"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => navigate('/admin/users')} variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Manage Users
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button onClick={() => navigate('/admin/subjects')} variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Manage Subjects
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button onClick={() => navigate('/school/subscription')} variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <School className="w-4 h-4" />
                  School Subscriptions
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button onClick={() => navigate('/admin/tests')} variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Manage Tests
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button onClick={() => navigate('/admin/ai-settings')} variant="outline" className="w-full justify-between border-blue-200 bg-blue-50/20 hover:bg-blue-50">
                <span className="flex items-center gap-2 text-blue-700">
                  <Sparkles className="w-4 h-4" />
                  AI System Settings
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button onClick={() => navigate('/admin/import')} variant="outline" className="w-full justify-between border-green-200 bg-green-50/20 hover:bg-green-50">
                <span className="flex items-center gap-2 text-green-700">
                  <Database className="w-4 h-4" />
                  Bulk Data Import (JSON)
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={exportUsersToExcel} variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Users to Excel
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button onClick={exportStatsToExcel} variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Export Statistics
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Platform Overview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Platform Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Student-Teacher Ratio</span>
                  <span className="font-medium">
                    {stats.teachers > 0 ? (stats.students / stats.teachers).toFixed(1) : 0} : 1
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${stats.teachers > 0 ? Math.min((stats.students / stats.teachers) / 50 * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Tests per Subject</span>
                  <span className="font-medium">
                    {stats.subjects > 0 ? (stats.tests / stats.subjects).toFixed(1) : 0}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${stats.subjects > 0 ? Math.min((stats.tests / stats.subjects) / 10 * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
