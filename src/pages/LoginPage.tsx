import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, LogOut } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Smart Learning
          </h1>
          <p className="text-gray-600 mt-2">Sign in to continue</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Welcome Back</CardTitle>
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
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
