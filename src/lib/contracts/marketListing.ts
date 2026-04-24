import type { PublishingRole } from "@/lib/contracts/publishing";

export const MARKET_LISTING_STATUSES = [
  "draft",
  "pending_review",
  "published",
  "rejected",
] as const;

export type MarketListingStatus = (typeof MARKET_LISTING_STATUSES)[number];
export type MarketListingModerationStatus = MarketListingStatus | "changes_requested" | "unpublished";

export function nextStatusForSubmit(role: PublishingRole): MarketListingStatus {
  switch (role) {
    case "owner":
      return "pending_review";
    case "agent":
    case "admin":
      return "published";
    default: {
      const impossibleRole: never = role;
      throw new Error(
        `Invalid publishing role for market listing submit transition: "${String(impossibleRole)}"`,
      );
    }
  }
}

export function canModerateMarketListingTransition(
  from: MarketListingModerationStatus,
  to: MarketListingModerationStatus,
): boolean {
  if (from === to) return false;
  if (to === "published") return from === "pending_review" || from === "unpublished" || from === "changes_requested";
  if (to === "changes_requested") return from === "pending_review" || from === "unpublished";
  if (to === "rejected") return from === "pending_review" || from === "changes_requested";
  if (to === "unpublished") return from === "published";
  if (to === "pending_review") return from === "rejected" || from === "changes_requested";
  if (to === "draft") return from === "rejected";
  return false;
}
