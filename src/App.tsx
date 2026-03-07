import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';

// Pages
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';

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

// Teacher Pages
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import CreateTestPage from '@/pages/teacher/CreateTestPage';
import TestResultsPage from '@/pages/teacher/TestResultsPage';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import SubjectManagementPage from '@/pages/admin/SubjectManagementPage';

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
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/subjects" element={
            <ProtectedRoute allowedRoles={['student']}>
              <SubjectsPage />
            </ProtectedRoute>
          } />
          <Route path="/student/subject/:subjectId" element={
            <ProtectedRoute allowedRoles={['student']}>
              <SubjectsPage />
            </ProtectedRoute>
          } />
          <Route path="/student/chapter/:chapterId" element={
            <ProtectedRoute allowedRoles={['student']}>
              <ChapterPage />
            </ProtectedRoute>
          } />
          <Route path="/student/tests" element={
            <ProtectedRoute allowedRoles={['student']}>
              <TestPage />
            </ProtectedRoute>
          } />
          <Route path="/student/test/:testId" element={
            <ProtectedRoute allowedRoles={['student']}>
              <TestAttemptPage />
            </ProtectedRoute>
          } />
          <Route path="/student/groups" element={
            <ProtectedRoute allowedRoles={['student']}>
              <GroupsPage />
            </ProtectedRoute>
          } />
          <Route path="/student/battle" element={
            <ProtectedRoute allowedRoles={['student']}>
              <BattlePage />
            </ProtectedRoute>
          } />
          <Route path="/student/tutor" element={
            <ProtectedRoute allowedRoles={['student']}>
              <TutorPage />
            </ProtectedRoute>
          } />
          <Route path="/student/voice" element={
            <ProtectedRoute allowedRoles={['student']}>
              <VoicePracticePage />
            </ProtectedRoute>
          } />
          <Route path="/student/heatmap" element={
            <ProtectedRoute allowedRoles={['student']}>
              <HeatmapPage />
            </ProtectedRoute>
          } />
          <Route path="/student/planner" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudyPlannerPage />
            </ProtectedRoute>
          } />
          <Route path="/student/leaderboard" element={
            <ProtectedRoute allowedRoles={['student']}>
              <LeaderboardPage />
            </ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute allowedRoles={['student']}>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/student/homework" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentHomeworkPage />
            </ProtectedRoute>
          } />

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

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
