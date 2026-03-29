import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { contentSecurityPolicy } from "@/lib/csp";

const PROTECTED_PREFIXES = ["/dashboard", "/manage", "/admin"];

function withCsp(response: NextResponse) {
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  return response;
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const requiresAuth = PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));

  if (!requiresAuth) {
    return withCsp(NextResponse.next());
  }

  const hasToken = Boolean(request.cookies.get("accessToken")?.value);
  if (hasToken) {
    if (path.startsWith("/admin")) {
      const role = request.cookies.get("userRole")?.value;
      if (role !== "admin") {
        return withCsp(NextResponse.redirect(new URL("/dashboard", request.url)));
      }
    }

    if (path.startsWith("/manage")) {
      const role = request.cookies.get("userRole")?.value;
      if (role !== "admin" && role !== "landlord") {
        return withCsp(NextResponse.redirect(new URL("/dashboard", request.url)));
      }
    }

    return withCsp(NextResponse.next());
  }

  const url = new URL("/login", request.url);
  url.searchParams.set("next", path);
  return withCsp(NextResponse.redirect(url));
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|woff2?)$).*)",
  ],
};
