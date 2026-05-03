import type { components } from "@/lib/api/generated/openapi-types";

export type UserRole = components["schemas"]["UserRole"];

export const USER_ROLE_USER = "user" as const satisfies UserRole;
export const USER_ROLE_ADMIN = "admin" as const satisfies UserRole;

export const USER_ROLE_VALUES = [USER_ROLE_USER, USER_ROLE_ADMIN] as const satisfies readonly UserRole[];

/** Any signed-in non-admin user (default customer account). */
export const LISTING_CREATOR_ROLE_VALUES = USER_ROLE_VALUES;

/** Platform moderation / admin-queue UI — admin portal only. */
export const MODERATION_ROLE_VALUES = [USER_ROLE_ADMIN] as const satisfies readonly UserRole[];

export function isAdminRole(role: UserRole | undefined | null): boolean {
  return role === USER_ROLE_ADMIN;
}

export function canAccessAdminPortal(role: UserRole | undefined | null): boolean {
  return role === USER_ROLE_ADMIN;
}
