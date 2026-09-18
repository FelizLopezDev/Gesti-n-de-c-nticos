import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export type AccessTokenProvider = () => Promise<string | null>;

/**
 * Creates a data client that delegates authenticated requests to Clerk.
 * Supabase Auth persistence is disabled because Clerk owns the session.
 */
export const createSupabaseClient = (
  accessToken: AccessTokenProvider,
): SupabaseClient | null => {
  if (!isSupabaseConfigured) {
    return null;
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    accessToken,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};
