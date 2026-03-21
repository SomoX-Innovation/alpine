/** Prevent open redirects: only same-site relative paths. */
export function safeRedirectPath(path: string | null | undefined, fallback = "/account"): string {
  if (!path || typeof path !== "string") return fallback;
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  return trimmed;
}
