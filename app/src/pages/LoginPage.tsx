import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, LogOut, Home, Mail, Phone, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { UserRole } from '@/types';

const getDashboardPath = (role: UserRole): string => {
  switch (role) {
    case 'student':
      return '/student/dashboard';
    case 'teacher':
      return '/teacher/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'parent':
      return '/parent/dashboard';
    default:
      return '/login';
  }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, logout, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Login successful');
        navigate(getDashboardPath(result.role), { replace: true });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Login exception:', error);
      toast.error('Unable to login right now');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchAccount = async () => {
    setIsLoading(true);
    try {
      await logout();
      setEmail('');
      setPassword('');
      toast.success('Signed out. Please login with another account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-cyan-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">Smart Learning</p>
              <p className="text-xs text-gray-500">School AI Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/login" className="inline-flex items-center gap-1 text-gray-600 hover:text-blue-700">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link to="/register" className="text-blue-700 font-medium hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="relative rounded-2xl overflow-hidden min-h-[260px] lg:min-h-[620px]">
            <img
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=80"
              alt="Students learning together"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/75 via-cyan-900/45 to-slate-900/70" />
            <div className="relative p-8 text-white h-full flex flex-col justify-end">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100">Professional Learning Suite</p>
              <h1 className="text-3xl sm:text-4xl font-bold mt-2 max-w-md leading-tight">
                Learn smarter with AI-driven tests, homework, and analytics.
              </h1>
              <p className="text-sm text-cyan-100 mt-3 max-w-md">
                Secure access for students, teachers, admins, and parents in one unified platform.
              </p>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Use your account credentials to login</CardDescription>
            </CardHeader>
            <CardContent>
              {user && (
                <div className="mb-4 rounded-lg border bg-blue-50 p-4">
                  <p className="text-sm text-blue-900">
                    You are logged in as <span className="font-semibold">{user.email}</span> ({user.role}).
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      onClick={() => navigate(getDashboardPath(user.role), { replace: true })}
                      className="h-9 bg-blue-600 hover:bg-blue-700"
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSwitchAccount}
                      disabled={isLoading}
                      className="h-9"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Use Another Account
                    </Button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <Link to="/register" className="text-blue-700 hover:underline font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <Mail className="w-4 h-4" />
              support@smartlearning.edu
            </span>
            <span className="inline-flex items-center gap-1">
              <Phone className="w-4 h-4" />
              +91 98765 43210
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/register" className="hover:text-blue-700">Get Started</Link>
            <a href="#" className="inline-flex items-center gap-1 hover:text-blue-700">
              <FileText className="w-4 h-4" />
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
