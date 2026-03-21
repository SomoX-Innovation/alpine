import { headers } from "next/headers";

/**
 * Canonical public URL for Supabase Auth redirects (confirmation links, password reset).
 *
 * In production, set `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` (no trailing slash).
 * Vercel: add the same in Project → Environment Variables.
 */
export async function getSiteUrl(): Promise<string | null> {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (env) return env;

  const h = await headers();
  const origin = h.get("origin");
  if (origin && origin !== "null") return origin;

  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return null;

  const proto =
    h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
