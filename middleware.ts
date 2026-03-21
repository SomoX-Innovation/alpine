import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { isUserInAdminTable } from "@/lib/admin-auth"

export async function middleware(request: NextRequest) {
  /**
   * Supabase sometimes sends users to `/?code=...` (Site URL root) instead of `/auth/callback`.
   * Forward PKCE / OTP params so the session exchange still runs.
   */
  const { pathname, searchParams } = request.nextUrl
  if (
    pathname === "/" &&
    (searchParams.has("code") || searchParams.has("token_hash"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/callback"
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Only check auth for /admin routes
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return supabaseResponse
  }

  // Allow access to login page
  if (
    request.nextUrl.pathname === "/admin/login" ||
    request.nextUrl.pathname === "/admin/forgot-password"
  ) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get current user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user is logged in, redirect to login page
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  // Logged-in customers must not access the dashboard — only rows in public.admin_users
  const isAdmin = await isUserInAdminTable(supabase, user.id)
  if (!isAdmin) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    url.searchParams.set("error", "forbidden")
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
