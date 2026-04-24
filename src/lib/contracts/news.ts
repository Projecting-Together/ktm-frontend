import { PUBLISHING_ROLES, type PublishingRole } from "@/lib/contracts/publishing";

export const CONTENT_STATUSES = [
  "draft",
  "pending_review",
  "published",
  "rejected",
] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const PUBLISHER_ROLES = PUBLISHING_ROLES;

export function canPublishNews(role: PublishingRole): boolean {
  return role === "agent" || role === "admin";
}
