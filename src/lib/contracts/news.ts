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

export function nextNewsStatusForSubmit(role: PublishingRole): ContentStatus {
  return canPublishNews(role) ? "published" : "pending_review";
}

export function canModerateNewsTransition(from: ContentStatus, to: ContentStatus): boolean {
  if (from === to) return false;
  if (to === "published") return from === "pending_review";
  if (to === "rejected") return from === "pending_review";
  if (to === "pending_review") return from === "rejected";
  if (to === "draft") return from === "rejected";
  return false;
}
