import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET must be set and at least 16 characters");
  }
  return secret;
}

export function signPayload(payload: string): string {
  const secret = getSecret();
  const hmac = createHmac("sha256", secret);
  hmac.update(payload);
  return hmac.digest("base64url");
}

export function verifyPayload(payload: string, signature: string): boolean {
  try {
    const expected = signPayload(payload);
    if (expected.length !== signature.length) return false;
    return timingSafeEqual(Buffer.from(expected, "base64url"), Buffer.from(signature, "base64url"));
  } catch {
    return false;
  }
}

export async function createSession(email: string): Promise<void> {
  const payload = JSON.stringify({
    email,
    exp: Date.now() + MAX_AGE * 1000,
  });
  const payloadB64 = Buffer.from(payload).toString("base64url");
  const sig = signPayload(payloadB64);
  const value = `${payloadB64}.${sig}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  const [payloadB64, sig] = cookie.value.split(".");
  if (!payloadB64 || !sig) return null;
  if (!verifyPayload(payloadB64, sig)) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload.email ?? null;
  } catch {
    return null;
  }
}

export function getCookieName(): string {
  return COOKIE_NAME;
}
