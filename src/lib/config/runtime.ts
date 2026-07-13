export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '';

export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.VITE_DEMO_MODE === 'true';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function shouldUseSupabase() {
  return !isDemoMode && isSupabaseConfigured;
}
