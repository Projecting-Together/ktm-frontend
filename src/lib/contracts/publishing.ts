import type { UserRole } from "@/lib/api/types";

/** Subset of `UserRole` that may act in news publish / manage flows. */
export const PUBLISHING_ROLE_VALUES = ["owner", "agent", "admin"] as const satisfies readonly UserRole[];

export type PublishingRole = (typeof PUBLISHING_ROLE_VALUES)[number];
