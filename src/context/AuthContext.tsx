import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, upsertUserPrefs, type UserPrefs } from '../services/supabase';

type AuthContextType = {
  userId: string | null;
  prefs: UserPrefs | null;
  loading: boolean;
  upsertPrefs: (newPrefs: Partial<UserPrefs>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be in AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Supabase auth listener (real: supabase.auth.getSession())
    const getDemoUser = async () => {
      // Demo: await until real auth
      setUserId('demo_user');
      const demoPrefs = await supabase
        .from('user_prefs')
        .select('*')
        .eq('user_id', 'demo_user')
        .single();
      if (demoPrefs.data) setPrefs(demoPrefs.data as UserPrefs);
      setLoading(false);
    };
    getDemoUser();

    // Cleanup
    return () => supabase.removeAllChannels();
  }, []);

  const upsertPrefs = async (newPrefs: Partial<UserPrefs>) => {
    if (!userId) throw new Error('No user');
    const fullPrefs = { user_id: userId, species: newPrefs.species || prefs?.species || 'bass', ...newPrefs };
    await upsertUserPrefs(fullPrefs as any);
    setPrefs({ ...prefs!, ...fullPrefs } as UserPrefs);
  };

  return (
    <AuthContext.Provider value={{ userId, prefs, loading, upsertPrefs }}>
      {children}
    </AuthContext.Provider>
  );
}
