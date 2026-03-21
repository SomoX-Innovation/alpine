import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns true if `userId` exists in `public.admin_users` (must be called with a
 * Supabase client that has the user session, e.g. middleware or server action).
 */
export async function isUserInAdminTable(
  supabase: SupabaseClient,
  userId: string | undefined
): Promise<boolean> {
  if (!userId) return false;

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[admin-auth] admin_users lookup:", error.message);
    return false;
  }

  return data != null;
}
