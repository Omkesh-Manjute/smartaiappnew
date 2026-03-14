import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

type AuthResult =
  | { success: true; role: UserRole }
  | { success: false; error: string };

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
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

const USER_ROLES: UserRole[] = ['student', 'teacher', 'admin', 'parent'];

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === 'string' && USER_ROLES.includes(value as UserRole);

const mapToUser = (row: Record<string, unknown>): User => ({
  id: String(row.id ?? ''),
  email: String(row.email ?? ''),
  name: String(row.name ?? row.email ?? 'User'),
  role: isUserRole(row.role) ? row.role : 'student',
  avatar: typeof row.avatar === 'string' ? row.avatar : undefined,
  createdAt:
    typeof row.created_at === 'string' ? new Date(row.created_at) : new Date(),
  isPremium: Boolean(row.is_premium ?? false),
  schoolId: typeof row.school_id === 'string' ? row.school_id : undefined,
  password: '',
});

const buildFallbackUser = (
  authUser: SupabaseAuthUser,
  role: UserRole = 'student',
  name?: string
): User => {
  const safeEmail = (authUser.email ?? '').toLowerCase();
  const metadataName =
    typeof authUser.user_metadata?.name === 'string'
      ? authUser.user_metadata.name
      : typeof authUser.user_metadata?.full_name === 'string'
      ? authUser.user_metadata.full_name
      : '';
  const derivedName = name || metadataName || safeEmail.split('@')[0] || 'User';

  return {
    id: authUser.id,
    email: safeEmail,
    name: derivedName,
    role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${safeEmail || authUser.id}`,
    createdAt: authUser.created_at ? new Date(authUser.created_at) : new Date(),
    isPremium: false,
    schoolId: undefined,
    password: '',
  };
};

const parseLoginError = (message?: string): string => {
  const normalized = (message ?? '').toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Invalid email or password';
  }
  if (normalized.includes('email not confirmed')) {
    return 'Please verify your email before login';
  }
  if (normalized.includes('too many requests')) {
    return 'Too many login attempts. Please try again later';
  }

  return message || 'Unable to login right now';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const profileSyncQueueRef = useRef<Promise<User | null>>(Promise.resolve(null));

  const fetchUserProfile = async (
    authUserId: string
  ): Promise<Record<string, unknown> | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .maybeSingle();

    // PGRST116 = no rows returned (profile missing)
    if (error && error.code !== 'PGRST116') {
      console.error('Failed to fetch user profile:', error?.message);
      return null;
    }

    return (data as Record<string, unknown> | null) ?? null;
  };

  const ensureUserProfile = async (
    authUser: SupabaseAuthUser,
    fallbackRole: UserRole = 'student',
    fallbackName?: string
  ): Promise<User | null> => {
    const fallbackUser = buildFallbackUser(authUser, fallbackRole, fallbackName);

    let existingProfile: Record<string, unknown> | null = null;
    try {
      existingProfile = await fetchUserProfile(authUser.id);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUser(fallbackUser);
      return fallbackUser;
    }

    if (existingProfile) {
      const mappedUser = mapToUser(existingProfile);
      setUser(mappedUser);
      return mappedUser;
    }

    // Auto-create missing public.users profile for accounts created from Supabase Auth dashboard.
    let createdProfile: Record<string, unknown> | null = null;
    let createError: { message?: string } | null = null;

    try {
      const result = await supabase
        .from('users')
        .upsert(
          {
            id: fallbackUser.id,
            email: fallbackUser.email,
            name: fallbackUser.name,
            role: fallbackUser.role,
            avatar: fallbackUser.avatar ?? null,
          },
          { onConflict: 'id' }
        )
        .select('*')
        .maybeSingle();

      createdProfile = (result.data as Record<string, unknown> | null) ?? null;
      createError = result.error ? { message: result.error.message } : null;
    } catch (error) {
      createError = {
        message: error instanceof Error ? error.message : String(error),
      };
    }

    if (createError || !createdProfile) {
      console.error('Failed to auto-create user profile:', createError?.message);
      setUser(fallbackUser);
      return fallbackUser;
    }

    const mappedUser = mapToUser(createdProfile as Record<string, unknown>);
    setUser(mappedUser);
    return mappedUser;
  };

  const queueProfileSync = (
    authUser: SupabaseAuthUser,
    fallbackRole: UserRole = 'student',
    fallbackName?: string
  ): Promise<User | null> => {
    const runSync = async () => {
      try {
        return await ensureUserProfile(authUser, fallbackRole, fallbackName);
      } catch (error) {
        console.error('Failed to sync user profile:', error);
        const fallbackUser = buildFallbackUser(authUser, fallbackRole, fallbackName);
        setUser(fallbackUser);
        return fallbackUser;
      }
    };

    // Serialize profile sync calls to avoid concurrent auth lock contention.
    profileSyncQueueRef.current = profileSyncQueueRef.current
      .catch(() => null)
      .then(runSync);

    return profileSyncQueueRef.current;
  };

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          await queueProfileSync(session.user);
        }
      } catch (error) {
        console.error('Failed to initialize auth session:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (!isMounted) return;

      if (session?.user) {
        void queueProfileSync(session.user).finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user) {
      console.error('Login failed:', error?.message);
      return { success: false, error: parseLoginError(error?.message) };
    }

    const roleFromMetadata = isUserRole(data.user.user_metadata?.role)
      ? data.user.user_metadata.role
      : 'student';
    const nameFromMetadata =
      typeof data.user.user_metadata?.name === 'string'
        ? data.user.user_metadata.name
        : undefined;

    const resolvedUser = await queueProfileSync(
      data.user,
      roleFromMetadata,
      nameFromMetadata
    );

    return { success: true, role: resolvedUser?.role ?? roleFromMetadata };
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    _grade?: number
  ): Promise<boolean> => {
    const normalizedEmail = email.trim().toLowerCase();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (authError || !authData.user) {
      console.error('Registration failed:', authError?.message);
      return false;
    }

    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      name,
      email: normalizedEmail,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedEmail}`,
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

    void queueProfileSync(authData.user, role, name);
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
