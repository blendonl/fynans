import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/register"];
const PROTECTED_PREFIX = "/";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === PROTECTED_PREFIX || pathname.startsWith("/transactions") || pathname.startsWith("/add") || pathname.startsWith("/analytics") || pathname.startsWith("/families") || pathname.startsWith("/notifications") || pathname.startsWith("/profile")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sw\\.js|icon-.*|apple-touch-icon\\.png|manifest\\.webmanifest).*)"],
};
