import { USER_ROLE_ADMIN, USER_ROLE_USER, type UserRole } from "@/lib/constants/userRole";

/** Path prefixes that require a session cookie (see `middleware.ts`). */
export const PROTECTED_PATH_PREFIXES = ["/dashboard", "/admin"] as const;

/**
 * Roles allowed for owner/member business routes under `/dashboard` (listings, leads, news workspace, analytics).
 * Aligns with former `/manage` access; listing creation uses the same set today (see `LISTING_NEW_ACCESS_ROLES`).
 */
export const MEMBER_OWNER_PORTAL_ROLES: readonly UserRole[] = [USER_ROLE_USER, USER_ROLE_ADMIN];

/** Roles allowed to open `/dashboard/listings/new`. */
export const LISTING_NEW_ACCESS_ROLES: readonly UserRole[] = [USER_ROLE_USER, USER_ROLE_ADMIN];

const ADMIN_PORTAL_PREFIX = "/admin";

/** True when an admin should see the customer-portal preview banner (non-admin routes only). */
export function shouldShowPreviewAsCustomerBanner(pathname: string, role: UserRole | undefined | null): boolean {
  if (!role || role !== USER_ROLE_ADMIN) return false;
  return !pathname.startsWith(ADMIN_PORTAL_PREFIX);
}
