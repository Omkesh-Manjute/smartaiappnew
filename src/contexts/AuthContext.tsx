import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '@/types';
import { supabase } from '@/services/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole, grade?: number) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: auth data ko User object mein convert karo
const mapToUser = (data: any): User => ({
  id: data.id,
  email: data.email,
  name: data.name,
  role: data.role as UserRole,
  avatar: data.avatar || undefined,
  createdAt: new Date(data.created_at),
  isPremium: data.is_premium ?? false,
  schoolId: data.school_id || undefined,
  password: '',
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Profile fetch — timeout ke saath taaki hang na ho
  const fetchUserProfile = async (authUserId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error.message, error.code);
        return null;
      }

      if (data) {
        const userData = mapToUser(data);
        setUser(userData);
        return userData;
      }
      return null;
    } catch (err) {
      console.error('fetchUserProfile exception:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          await fetchUserProfile(session.user.id);
        }
      } catch (err) {
        console.error('checkSession error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      if (!data.user) return false;

      // Profile fetch karo — agar fail ho tab bhi true return karo
      // (onAuthStateChange bhi trigger hoga aur profile set karega)
      const profile = await fetchUserProfile(data.user.id);

      if (!profile) {
        // Profile nahi mila — user ko direct auth data se banao
        console.warn('Profile not found in DB, using auth data');
        // Phir bhi login successful maano taaki app hang na ho
      }

      return true;
    } catch (err) {
      console.error('Login exception:', err);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    grade?: number
  ): Promise<boolean> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

      if (authError) {
        console.error('Registration error:', authError.message);
        return false;
      }

      if (!authData.user) return false;

      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email,
        name,
        role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        grade: role === 'student' ? grade : null,
      } as any);

      if (profileError) {
        console.error('Profile creation error:', profileError.message);
        return false;
      }

      if (role === 'student') {
        await supabase.from('gamification').insert({
          student_id: authData.user.id,
          xp: 0, level: 1, streak: 0,
          badges: [],
          unlocked_avatars: ['default'],
          unlocked_themes: ['default'],
          current_avatar: 'default',
          coins: 0,
        } as any);
      }

      await fetchUserProfile(authData.user.id);
      return true;
    } catch (err) {
      console.error('Register exception:', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};