import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Supabase project URL and Anon key for the user's project
export const SUPABASE_PROJECT_ID = 'elyhwhqsapymjzoqtcdz';
export const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVseWh3aHFzYXB5bWp6b3F0Y2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0OTE3MTcsImV4cCI6MjEwODA2NzcxN30.liFA9IMNsVPphtLY9tu4-KA9K9WN1n7VZ6djwcZy2YM';

// Get URL from environment or fallback to project URL
export const getSupabaseUrl = (): string => {
  return import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
};

// Get Anon Key from environment or local storage override or default project key
export const getSupabaseAnonKey = (): string => {
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envKey && envKey.trim().length > 10) {
    return envKey.trim();
  }
  const localKey = localStorage.getItem('subme_supabase_anon_key');
  if (localKey && localKey.trim().length > 10) {
    return localKey.trim();
  }
  return DEFAULT_SUPABASE_ANON_KEY;
};

export const isSupabaseConfigured = (): boolean => {
  const key = getSupabaseAnonKey();
  return Boolean(key && key.length > 15);
};

// Singleton Supabase Client
let cachedClient: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!url || !key || key.length < 15) {
    return null;
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('[Supabase] Initialization error:', err);
      return null;
    }
  }

  return cachedClient;
};

// Save custom anon key dynamically (allows in-app key connection)
export const setSupabaseAnonKey = (key: string): boolean => {
  if (!key || key.trim().length < 15) return false;
  localStorage.setItem('subme_supabase_anon_key', key.trim());
  cachedClient = null; // reset cached client
  return true;
};

// Clear custom anon key
export const clearSupabaseAnonKey = (): void => {
  localStorage.removeItem('subme_supabase_anon_key');
  cachedClient = null;
};

// Check health / connectivity to project
export const checkSupabaseConnection = async (): Promise<{
  connected: boolean;
  message: string;
  tablesFound?: boolean;
}> => {
  const client = getSupabase();
  if (!client) {
    return {
      connected: false,
      message: 'Supabase Anon API Key is missing. Add it to .env or in the connection dialog.',
    };
  }

  try {
    // Try pinging campaigns or profiles table
    const { error, status } = await client
      .from('campaigns')
      .select('id')
      .limit(1);

    if (error) {
      // If table doesn't exist yet, connection is valid but schema needs to be run
      if (error.code === '42P01' || error.message.includes('relation "public.campaigns" does not exist')) {
        return {
          connected: true,
          message: 'Connected to Supabase project! (Tables not created yet - run supabase/schema.sql in SQL editor)',
          tablesFound: false,
        };
      }
      return {
        connected: false,
        message: `Connection error: ${error.message} (Code: ${error.code || status})`,
      };
    }

    return {
      connected: true,
      message: 'Successfully connected to Supabase project elyhwhqsapymjzoqtcdz!',
      tablesFound: true,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Network error connecting to Supabase',
    };
  }
};
