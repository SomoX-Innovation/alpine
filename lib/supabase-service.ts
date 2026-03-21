import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Server-only client for privileged operations (e.g. increment sales counters). Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. */
export function createServiceRoleClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
