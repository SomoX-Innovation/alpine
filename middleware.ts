import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminCookie, getAdminCookieName } from "@/lib/auth-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }
  const cookieValue = request.cookies.get(getAdminCookieName())?.value;
  const valid = await verifyAdminCookie(cookieValue);
  if (!valid) {
    const login = new URL("/admin/login", request.url);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};
