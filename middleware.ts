import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/manage", "/admin"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const requiresAuth = PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));

  if (!requiresAuth) {
    return NextResponse.next();
  }

  const hasToken = Boolean(request.cookies.get("accessToken")?.value);
  if (hasToken) {
    if (path.startsWith("/admin")) {
      const role = request.cookies.get("userRole")?.value;
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    if (path.startsWith("/manage")) {
      const role = request.cookies.get("userRole")?.value;
      if (role !== "admin" && role !== "landlord") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return NextResponse.next();
  }

  const url = new URL("/login", request.url);
  url.searchParams.set("next", path);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/manage/:path*", "/admin/:path*"],
};
