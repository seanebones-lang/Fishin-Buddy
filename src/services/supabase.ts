import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserPrefs = {
  id: string;
  species: string; // 'bass' | 'trout' etc.
  home_lat?: number;
  home_lng?: number;
};

export async function getUserPrefs(userId: string): Promise<UserPrefs | null> {
  const { data, error } = await supabase
    .from('user_prefs')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function upsertUserPrefs(prefs: Omit<UserPrefs, 'id'> & { user_id: string }) {
  const { error } = await supabase
    .from('user_prefs')
    .upsert(prefs);
  if (error) throw error;
}
