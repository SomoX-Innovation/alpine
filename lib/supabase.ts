import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function hasSupabase(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

/** Client for use in browser / client components */
export function createClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createSupabaseClient(url, anonKey);
}

/** Server-side client for Server Components and Server Actions (use in server context only) */
export function createServerClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  if (!url || !anonKey) return null;
  return createSupabaseClient(url, anonKey);
}
