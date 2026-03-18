import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { GamificationProvider } from '@/contexts/GamificationContext';
import { Toaster } from '@/components/ui/sonner';

// Layout
import StudentLayout from '@/components/layout/StudentLayout';

// Pages
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import LandingPage from '@/pages/LandingPage';

// Student Pages
import StudentDashboard from '@/pages/student/StudentDashboard';
import SubjectsPage from '@/pages/student/SubjectsPage';
import ChapterPage from '@/pages/student/ChapterPage';
import TestPage from '@/pages/student/TestPage';
import TestAttemptPage from '@/pages/student/TestAttemptPage';
import GroupsPage from '@/pages/student/GroupsPage';
import BattlePage from '@/pages/student/BattlePage';
import TutorPage from '@/pages/student/TutorPage';
import VoicePracticePage from '@/pages/student/VoicePracticePage';
import HeatmapPage from '@/pages/student/HeatmapPage';
import StudyPlannerPage from '@/pages/student/StudyPlannerPage';
import LeaderboardPage from '@/pages/student/LeaderboardPage';
import ProfilePage from '@/pages/student/ProfilePage';
import StudentHomeworkPage from '@/pages/student/StudentHomeworkPage';
import NotificationsPage from '@/pages/student/NotificationsPage';

// Teacher Pages
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import CreateTestPage from '@/pages/teacher/CreateTestPage';
import TestResultsPage from '@/pages/teacher/TestResultsPage';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import SubjectManagementPage from '@/pages/admin/SubjectManagementPage';
import AdminAISettingsPage from '@/pages/admin/AdminAISettingsPage';
import AdminTestsPage from '@/pages/admin/AdminTestsPage';

// Parent Pages
import ParentDashboardPage from '@/pages/parent/ParentDashboardPage';

// School Pages
import SchoolSubscriptionPage from '@/pages/school/SchoolSubscriptionPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <GamificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Routes — wrapped in StudentLayout */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/subjects" element={<SubjectsPage />} />
              <Route path="/student/subject/:subjectId" element={<SubjectsPage />} />
              <Route path="/student/chapter/:chapterId" element={<ChapterPage />} />
              <Route path="/student/tests" element={<TestPage />} />
              <Route path="/student/test/:testId" element={<TestAttemptPage />} />
              <Route path="/student/groups" element={<GroupsPage />} />
              <Route path="/student/battle" element={<BattlePage />} />
              <Route path="/student/tutor" element={<TutorPage />} />
              <Route path="/student/voice" element={<VoicePracticePage />} />
              <Route path="/student/heatmap" element={<HeatmapPage />} />
              <Route path="/student/planner" element={<StudyPlannerPage />} />
              <Route path="/student/leaderboard" element={<LeaderboardPage />} />
              <Route path="/student/profile" element={<ProfilePage />} />
              <Route path="/student/homework" element={<StudentHomeworkPage />} />
              <Route path="/student/notifications" element={<NotificationsPage />} />
            </Route>

            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/teacher/homework" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/teacher/analytics" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/teacher/create-test" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <CreateTestPage />
              </ProtectedRoute>
            } />
            <Route path="/teacher/test-results/:testId" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TestResultsPage />
              </ProtectedRoute>
            } />
            <Route path="/teacher/edit-test/:testId" element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <CreateTestPage />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/subjects" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SubjectManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/ai-settings" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAISettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/tests" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTestsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/edit-test/:testId" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateTestPage />
              </ProtectedRoute>
            } />

            {/* Parent Routes */}
            <Route path="/parent/dashboard" element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentDashboardPage />
              </ProtectedRoute>
            } />

            {/* School Routes */}
            <Route path="/school/subscription" element={
              <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                <SchoolSubscriptionPage />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </GamificationProvider>
    </AuthProvider>
  );
}

export default App;
