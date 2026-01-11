/**
 * App Context - No Authentication Required
 * Provides app state and preferences for demo mode (fully functional, no login)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Species = 'bass' | 'trout' | 'catfish' | 'walleye';

export type UserPrefs = {
  species: Species;
  home_lat?: number;
  home_lng?: number;
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
};

type AppContextType = {
  prefs: UserPrefs;
  loading: boolean;
  updatePrefs: (newPrefs: Partial<UserPrefs>) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'bitecast_prefs';
const DEFAULT_PREFS: UserPrefs = {
  species: 'bass',
  skill_level: 'intermediate',
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UserPrefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);

  // Load preferences from storage
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as UserPrefs;
          setPrefs({ ...DEFAULT_PREFS, ...parsed });
        }
      } catch (error) {
        console.warn('Failed to load preferences:', error);
        // Use defaults if loading fails
      } finally {
        setLoading(false);
      }
    };

    loadPrefs();
  }, []);

  const updatePrefs = async (newPrefs: Partial<UserPrefs>) => {
    const updated = { ...prefs, ...newPrefs };
    setPrefs(updated);
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  return (
    <AppContext.Provider value={{ prefs, loading, updatePrefs }}>
      {children}
    </AppContext.Provider>
  );
}
