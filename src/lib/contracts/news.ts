import type { UserRole } from "@/lib/api/types";
import { PUBLISHING_ROLE_VALUES, type PublishingRole } from "@/lib/contracts/publishing";

/** News CMS workflow states (frontend domain; keep in sync with admin/manage news UI). */
export const CONTENT_STATUS_VALUES = [
  "draft",
  "pending_review",
  "published",
  "rejected",
] as const;

export type ContentStatus = (typeof CONTENT_STATUS_VALUES)[number];

export const PUBLISHER_ROLES = PUBLISHING_ROLE_VALUES;

export function canPublishNews(role: UserRole): boolean {
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
