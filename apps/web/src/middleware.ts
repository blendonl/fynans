import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
];

const SIGNED_OUT_ONLY_ROUTES = ["/login", "/register"];

const PUBLIC_ROUTES = [
  ...SIGNED_OUT_ONLY_ROUTES,
  "/auth/callback",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/welcome",
  "/privacy",
  "/terms",
];

function hasSession(request: NextRequest) {
  return SESSION_COOKIES.some((name) => Boolean(request.cookies.get(name)?.value));
}

function matches(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const signedIn = hasSession(request);

  if (pathname === "/") {
    return signedIn
      ? NextResponse.next()
      : NextResponse.rewrite(new URL("/welcome", request.url));
  }

  if (signedIn && matches(pathname, SIGNED_OUT_ONLY_ROUTES)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (matches(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  if (!signedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sw\\.js|icon-.*|apple-touch-icon\\.png|manifest\\.webmanifest).*)"],
};
