import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { BookOpen, Eye, EyeOff, GraduationCap, Users, School } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        const users = JSON.parse(localStorage.getItem('smart_learning_users') || '[]');
        const user = users.find((u: any) => u.email === email);
        
        toast.success('Login successful!');
        
        // Redirect based on role
        switch (user.role) {
          case 'student':
            navigate('/student/dashboard');
            break;
          case 'teacher':
            navigate('/teacher/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'parent':
            navigate('/parent/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (role: string) => {
    const credentials: Record<string, { email: string; password: string }> = {
      student: { email: 'rahul@example.com', password: 'password123' },
      teacher: { email: 'kumar@example.com', password: 'password123' },
      admin: { email: 'admin@example.com', password: 'password123' },
      parent: { email: 'parent@example.com', password: 'password123' },
    };
    
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Smart Learning
          </h1>
          <p className="text-gray-600 mt-2">AI-Powered Education Platform</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Welcome Back!</CardTitle>
            <CardDescription>Sign in to continue your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
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
                    onClick={() => setShowPassword(!showPassword)}
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

            {/* Quick Login Buttons */}
            <div className="mt-6">
              <p className="text-xs text-gray-500 text-center mb-3">Quick Login (Demo)</p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => quickLogin('student')}
                  className="flex flex-col items-center p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <GraduationCap className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-xs text-blue-600">Student</span>
                </button>
                <button
                  onClick={() => quickLogin('teacher')}
                  className="flex flex-col items-center p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <School className="w-5 h-5 text-green-600 mb-1" />
                  <span className="text-xs text-green-600">Teacher</span>
                </button>
                <button
                  onClick={() => quickLogin('admin')}
                  className="flex flex-col items-center p-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  <Users className="w-5 h-5 text-purple-600 mb-1" />
                  <span className="text-xs text-purple-600">Admin</span>
                </button>
                <button
                  onClick={() => quickLogin('parent')}
                  className="flex flex-col items-center p-2 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
                >
                  <Users className="w-5 h-5 text-orange-600 mb-1" />
                  <span className="text-xs text-orange-600">Parent</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
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
