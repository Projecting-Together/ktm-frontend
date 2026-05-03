import type { User } from "@/lib/api/types";

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
