import type { PublishingRole } from "@/lib/contracts/publishing";

export const MARKET_LISTING_STATUSES = [
  "draft",
  "pending_review",
  "published",
  "rejected",
] as const;

export type MarketListingStatus = (typeof MARKET_LISTING_STATUSES)[number];

const SUBMIT_TRANSITION_STATUS_BY_ROLE: Record<PublishingRole, MarketListingStatus> = {
  owner: "pending_review",
  agent: "published",
  admin: "published",
};

export function nextStatusForSubmit(role: PublishingRole): MarketListingStatus {
  return SUBMIT_TRANSITION_STATUS_BY_ROLE[role];
}
