import type { PublishingRole } from "@/lib/contracts/publishing";

export const MARKET_LISTING_STATUSES = [
  "draft",
  "pending_review",
  "published",
  "rejected",
] as const;

export type MarketListingStatus = (typeof MARKET_LISTING_STATUSES)[number];

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
