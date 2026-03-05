import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { supabase } from '@/services/supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    grade?: number
  ) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapToUser = (row: Record<string, unknown>): User => ({
  id: String(row.id ?? ''),
  email: String(row.email ?? ''),
  name: String(row.name ?? row.email ?? 'User'),
  role: String(row.role ?? 'student') as UserRole,
  avatar: typeof row.avatar === 'string' ? row.avatar : undefined,
  createdAt:
    typeof row.created_at === 'string' ? new Date(row.created_at) : new Date(),
  isPremium: Boolean(row.is_premium ?? false),
  schoolId: typeof row.school_id === 'string' ? row.school_id : undefined,
  password: '',
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (authUserId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .single();

    if (error || !data) {
      console.error('Failed to fetch user profile:', error?.message);
      setUser(null);
      return null;
    }

    const mappedUser = mapToUser(data as Record<string, unknown>);
    setUser(mappedUser);
    return mappedUser;
  };

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          await fetchUserProfile(session.user.id);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!isMounted) return;

      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      console.error('Login failed:', error?.message);
      return false;
    }

    const profile = await fetchUserProfile(data.user.id);
    if (!profile) {
      await supabase.auth.signOut();
      return false;
    }

    return true;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    _grade?: number
  ): Promise<boolean> => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error('Registration failed:', authError?.message);
      return false;
    }

    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      name,
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    });

    if (profileError) {
      console.error('Profile creation failed:', profileError.message);
      await supabase.auth.signOut();
      return false;
    }

    if (role === 'student') {
      await supabase.from('gamification').insert({
        student_id: authData.user.id,
        xp: 0,
        level: 1,
        streak: 0,
        badges: [],
        unlocked_avatars: ['default'],
        unlocked_themes: ['default'],
        current_avatar: 'default',
        coins: 0,
      });
    }

    await fetchUserProfile(authData.user.id);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
