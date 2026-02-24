/**
 * Edge-compatible session verification for middleware (no Node crypto).
 */
const COOKIE_NAME = "admin_session";

function base64UrlDecodeToBytes(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacSign(key: CryptoKey, data: string): Promise<string> {
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const bytes = new Uint8Array(sig);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function verifyAdminCookie(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) return false;
  const [payloadB64, sig] = cookieValue.split(".");
  if (!payloadB64 || !sig) return false;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expectedSig = await hmacSign(key, payloadB64);
    if (expectedSig.length !== sig.length) return false;
    const a = base64UrlDecodeToBytes(expectedSig);
    const b = base64UrlDecodeToBytes(sig);
    if (a.length !== b.length) return false;
    let out = 0;
    for (let i = 0; i < a.length; i++) out |= a[i] ^ b[i];
    if (out !== 0) return false;
    const payloadBytes = base64UrlDecodeToBytes(payloadB64);
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    if (payload.exp && payload.exp < Date.now()) return false;
    return Boolean(payload.email);
  } catch {
    return false;
  }
}

export function getAdminCookieName(): string {
  return COOKIE_NAME;
}
