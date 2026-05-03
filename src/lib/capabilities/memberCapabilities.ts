import type { User } from "@/lib/api/types";
import type { UserRole } from "@/lib/constants/userRole";

/**
 * Minimal `User` for `resolveMemberCapabilities` when only `userRole` cookie is present (Edge
 * middleware). Missing/expired session rows are represented by invalid roles → `null`.
 * Status is **`active`** when the cookie matches `user` | `admin` — JWT/session validity is
 * implied by `accessToken` already checked in middleware before calling this.
 */
export function sessionUserFromRoleCookie(role: string | undefined): User | null {
  if (role !== "user" && role !== "admin") return null;
  const typed = role as UserRole;
  return {
    id: "__cookie__",
    email: "",
    role: typed,
    status: "active",
    is_verified: false,
    created_at: new Date(0).toISOString(),
  };
}

/** Booleans used by guards and UI — no owner/agent naming here. */
export interface MemberCapabilities {
  /** Can access member dashboard routes protected by session (non-admin portal). */
  canUseMemberDashboard: boolean;
  /** Can open listing creation routes (wizard entry). */
  canCreateListing: boolean;
  /** Admin portal — operational; not shown as second persona inside /dashboard. */
  canAccessAdminPortal: boolean;
}

export interface ResolveMemberCapabilitiesInput {
  user: User | null | undefined;
  /** When API later sends explicit flags, pass through here (optional). Tranche 1: omit. */
  apiCapabilities?: Partial<MemberCapabilities> | null;
}

/** Conservative defaults when user missing — deny risky actions. */
export function resolveMemberCapabilities(input: ResolveMemberCapabilitiesInput): MemberCapabilities {
  const { user, apiCapabilities } = input;
  if (apiCapabilities && Object.keys(apiCapabilities).length > 0) {
    return {
      canUseMemberDashboard: apiCapabilities.canUseMemberDashboard ?? Boolean(user),
      canCreateListing: apiCapabilities.canCreateListing ?? false,
      canAccessAdminPortal: apiCapabilities.canAccessAdminPortal ?? false,
    };
  }
  if (!user || user.status !== "active") {
    return {
      canUseMemberDashboard: false,
      canCreateListing: false,
      canAccessAdminPortal: false,
    };
  }

  const role = user.role;
  const isAdmin = role === "admin";

  return {
    canUseMemberDashboard: role === "user" || isAdmin,
    canCreateListing: role === "user" || isAdmin,
    canAccessAdminPortal: isAdmin,
  };
}
