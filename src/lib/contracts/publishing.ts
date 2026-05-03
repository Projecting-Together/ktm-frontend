import type { UserRole } from "@/lib/api/types";

/** Roles that may participate in news publish flows (`admin` publishes; `user` submits). */
export const PUBLISHING_ROLE_VALUES = ["user", "admin"] as const satisfies readonly UserRole[];

export type PublishingRole = (typeof PUBLISHING_ROLE_VALUES)[number];
