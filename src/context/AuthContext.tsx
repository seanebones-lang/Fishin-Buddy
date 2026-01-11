import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, upsertUserPrefs, getUserPrefs, type UserPrefs } from '../services/supabase';
import { clearAuthTokens, storeUserId, getUserId } from '../utils/secureStorage';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  prefs: UserPrefs | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  upsertPrefs: (newPrefs: Partial<UserPrefs>) => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user preferences
  const loadUserPrefs = useCallback(async (userId: string) => {
    try {
      const userPrefs = await getUserPrefs(userId);
      if (userPrefs) {
        setPrefs(userPrefs);
        await storeUserId(userId);
      }
    } catch (err) {
      console.warn('Failed to load user preferences:', err);
      // Don't throw - prefs are optional
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            await loadUserPrefs(initialSession.user.id);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize authentication');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);
        setError(null);

        if (newSession?.user) {
          await loadUserPrefs(newSession.user.id);
        } else {
          setPrefs(null);
          await clearAuthTokens();
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserPrefs]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!data.session) throw new Error('No session returned');

      // Session and user will be set via onAuthStateChange listener
    } catch (err) {
      const errorMessage = err instanceof AuthError 
        ? err.message 
        : err instanceof Error 
        ? err.message 
        : 'Failed to sign in';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'bitecast://auth/callback', // Deep link for email verification
        },
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('No user returned');

      // User will need to verify email before signing in
      // Session will be set when they verify and sign in
    } catch (err) {
      const errorMessage = err instanceof AuthError 
        ? err.message 
        : err instanceof Error 
        ? err.message 
        : 'Failed to sign up';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      // State will be cleared via onAuthStateChange listener
      await clearAuthTokens();
    } catch (err) {
      const errorMessage = err instanceof AuthError 
        ? err.message 
        : err instanceof Error 
        ? err.message 
        : 'Failed to sign out';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'bitecast://auth/reset-password',
      });
      if (resetError) throw resetError;
    } catch (err) {
      const errorMessage = err instanceof AuthError 
        ? err.message 
        : err instanceof Error 
        ? err.message 
        : 'Failed to send password reset email';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
      }
    } catch (err) {
      console.error('Session refresh failed:', err);
      // Optionally sign out if refresh fails
      await signOut();
    }
  }, [signOut]);

  const upsertPrefs = useCallback(async (newPrefs: Partial<UserPrefs>) => {
    if (!user) throw new Error('Must be authenticated to update preferences');
    
    try {
      const fullPrefs = { 
        user_id: user.id, 
        species: newPrefs.species || prefs?.species || 'bass', 
        ...newPrefs 
      };
      await upsertUserPrefs(fullPrefs as any);
      setPrefs({ ...prefs!, ...fullPrefs } as UserPrefs);
    } catch (err) {
      console.error('Failed to update preferences:', err);
      throw err;
    }
  }, [user, prefs]);

  const value: AuthContextType = {
    user,
    session,
    prefs,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    upsertPrefs,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
