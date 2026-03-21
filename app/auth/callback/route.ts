import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { safeRedirectPath } from "@/lib/safe-redirect";

/**
 * Supabase Auth email links (confirm signup, password reset, magic link) redirect here.
 * Cookies MUST be set on the redirect Response (see setAll) or the session is lost.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const nextPath = safeRedirectPath(url.searchParams.get("next"), "/account");

  const redirectTarget = new URL(nextPath.startsWith("/") ? nextPath : `/${nextPath}`, origin);

  /** Response we attach Supabase cookies to — required for PKCE / recovery to work */
  let response = NextResponse.redirect(redirectTarget);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, origin)
      );
    }
    return response;
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as
        | "signup"
        | "recovery"
        | "email"
        | "email_change"
        | "invite"
        | "magiclink",
    });
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, origin)
      );
    }
    return response;
  }

  return NextResponse.redirect(
    new URL(
      `/login?error=${encodeURIComponent("Invalid or expired confirmation link.")}`,
      origin
    )
  );
}
