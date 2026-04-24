export const CONTENT_STATUSES = [
  "draft",
  "pending_review",
  "published",
  "rejected",
] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const PUBLISHER_ROLES = ["owner", "agent", "admin"] as const;

export type PublisherRole = (typeof PUBLISHER_ROLES)[number];

export function canPublishNews(role: PublisherRole): boolean {
  return role === "agent" || role === "admin";
}
