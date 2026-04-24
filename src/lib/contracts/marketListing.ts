import type { PublisherRole } from "@/lib/contracts/news";

export const MARKET_LISTING_SUBMIT_STATUSES = [
  "pending_review",
  "published",
] as const;

export type MarketListingSubmitStatus = (typeof MARKET_LISTING_SUBMIT_STATUSES)[number];

export function getMarketListingSubmitStatus(role: PublisherRole): MarketListingSubmitStatus {
  return role === "owner" ? "pending_review" : "published";
}
