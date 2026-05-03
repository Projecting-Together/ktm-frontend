import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { contentSecurityPolicy } from "@/lib/csp";
import { resolveMemberCapabilities, sessionUserFromRoleCookie } from "@/lib/capabilities/memberCapabilities";
import { PROTECTED_PATH_PREFIXES } from "@/lib/constants/routeGuards";

function withCsp(response: NextResponse) {
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  return response;
}

/** Owner/member tools (formerly under `/manage`). */
function isMemberOwnerDashboardPath(path: string): boolean {
  if (path === "/dashboard/listings" || path.startsWith("/dashboard/listings/")) return true;
  if (path.startsWith("/dashboard/leads")) return true;
  if (path.startsWith("/dashboard/news")) return true;
  if (path.startsWith("/dashboard/analytics")) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const requiresAuth = PROTECTED_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
  const isListingCreationPath = path === "/dashboard/listings/new";

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

    if (isMemberOwnerDashboardPath(path)) {
      const roleCookie = request.cookies.get("userRole")?.value;
      const sessionUser = sessionUserFromRoleCookie(roleCookie);
      const caps = resolveMemberCapabilities({ user: sessionUser });
      const ok = isListingCreationPath ? caps.canCreateListing : caps.canUseMemberDashboard;

      if (!ok) {
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
