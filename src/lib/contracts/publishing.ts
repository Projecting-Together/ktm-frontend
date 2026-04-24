export const PUBLISHING_ROLES = ["owner", "agent", "admin"] as const;

export type PublishingRole = (typeof PUBLISHING_ROLES)[number];
