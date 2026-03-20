import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, LogOut, Sparkles, Mail, Lock, ArrowRight, GraduationCap, Users, Brain, Mic } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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

const features = [
  { icon: Brain, title: 'AI-Powered Learning', desc: 'Smart tutoring with personalized explanations' },
  { icon: Mic, title: 'Voice Practice', desc: 'Improve pronunciation with speech recognition' },
  { icon: GraduationCap, title: 'Smart Tests', desc: 'Adaptive quizzes that match your level' },
  { icon: Users, title: 'Study Groups', desc: 'Learn together with classmates and friends' },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, logout, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Welcome back! 🎉');
        navigate(getDashboardPath(result.role), { replace: true });
      } else {
        setError(result.error);
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
      toast.success('Signed out successfully');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 flex flex-col">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-lg sm:text-xl text-white">Smart Learning</p>
              <p className="text-xs text-blue-300 hidden sm:block">AI-Powered Education Platform</p>
            </div>
          </div>
          <Link 
            to="/register" 
            className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all duration-200 text-sm font-medium border border-white/20"
          >
            Create Account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:flex lg:col-span-2 flex-col justify-center text-white">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">India's #1 AI Learning Platform</span>
              </div>
              
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
                Learn Smarter,
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> Score Better</span>
              </h1>
              
              <p className="text-blue-200 text-lg max-w-md">
                Your personal AI tutor available 24/7. Get instant help with homework, tests, and any subject.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <p className="text-xs text-blue-300">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:col-span-3">
            <Card className="bg-white/95 backdrop-blur-xl border-0 shadow-2xl shadow-black/20 rounded-3xl overflow-hidden">
              {/* Card Header Gradient */}
              <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
              
              <CardContent className="p-6 sm:p-8 lg:p-10">
                {user ? (
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mb-2">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
                      <p className="text-gray-500">
                        Logged in as <span className="font-semibold text-gray-700">{user.email}</span>
                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full capitalize">{user.role}</span>
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <Button 
                        onClick={() => navigate(getDashboardPath(user.role), { replace: true })}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-200"
                      >
                        Go to Dashboard
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleSwitchAccount}
                        disabled={isLoading}
                        className="w-full h-12 border-2 border-gray-200 hover:border-gray-300 rounded-xl font-medium"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Use Different Account
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Mobile Branding */}
                    <div className="lg:hidden text-center space-y-3">
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Welcome Back! 👋
                      </h2>
                      <p className="text-gray-500">Sign in to continue your learning journey</p>
                    </div>

                    {/* Desktop Title */}
                    <div className="hidden lg:block space-y-2">
                      <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                      <p className="text-gray-500">Enter your credentials to access your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Email Field */}
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-12 pl-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-base"
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
                          <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                            Forgot Password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-12 pl-12 pr-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-base"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                          {error}
                        </div>
                      )}

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all duration-200 disabled:opacity-70"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">or</span>
                      </div>
                    </div>

                    {/* Demo Accounts */}
                    <div className="space-y-3">
                      <p className="text-center text-sm text-gray-500">Try demo accounts</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => { setEmail('student@demo.com'); setPassword('Demo@12345'); }}
                          className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-left transition-all"
                        >
                          <p className="font-semibold text-sm text-gray-900">Student</p>
                          <p className="text-xs text-gray-500">student@demo.com</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEmail('teacher@demo.com'); setPassword('Demo@12345'); }}
                          className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-left transition-all"
                        >
                          <p className="font-semibold text-sm text-gray-900">Teacher</p>
                          <p className="text-xs text-gray-500">teacher@demo.com</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEmail('admin@demo.com'); setPassword('Demo@12345'); }}
                          className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-left transition-all"
                        >
                          <p className="font-semibold text-sm text-gray-900">Admin</p>
                          <p className="text-xs text-gray-500">admin@demo.com</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEmail('parent@demo.com'); setPassword('Demo@12345'); }}
                          className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-left transition-all"
                        >
                          <p className="font-semibold text-sm text-gray-900">Parent</p>
                          <p className="text-xs text-gray-500">parent@demo.com</p>
                        </button>
                      </div>
                    </div>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-gray-500">
                      Don't have an account?{' '}
                      <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                        Create one free
                      </Link>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-blue-200">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                support@smartlearning.edu
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">+91 98765 43210</span>
            </div>
            <p>© 2026 Smart Learning. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
