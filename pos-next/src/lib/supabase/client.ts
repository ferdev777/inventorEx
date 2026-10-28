// ==========================================================
// Supabase Client - Server & Browser instances
// ==========================================================
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client using service role key.
 * Use ONLY in API routes and server components.
 * This bypasses Row Level Security (RLS) — ideal for backend operations.
 */
export function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.',
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

import { createBrowserClient as createBrowserClientSSR } from '@supabase/ssr';

/**
 * Browser-side Supabase client using anon key.
 * Use in client components for auth flows.
 * Returns a singleton instance to prevent multiple clients.
 */
let browserClient: SupabaseClient | undefined;

export function createBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  browserClient = createBrowserClientSSR(url, key);
  
  return browserClient;
}
