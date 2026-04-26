import {
  MARKET_LISTING_MODERATION_STATUSES,
  MARKET_LISTING_STATUSES,
  canModerateMarketListingTransition,
  nextStatusForSubmit,
} from "@/lib/contracts/marketListing";
import type { ListingFilters, ListingType } from "@/lib/api/types";

describe("market listing contract", () => {
  it("defines expected full market listing statuses", () => {
    expect(MARKET_LISTING_STATUSES).toEqual([
      "draft",
      "pending_review",
      "published",
      "rejected",
    ]);
  });

  it("defines expected moderation statuses including review-only states", () => {
    expect(MARKET_LISTING_MODERATION_STATUSES).toEqual([
      "draft",
      "pending_review",
      "published",
      "rejected",
      "changes_requested",
      "unpublished",
    ]);
  });

  it("maps owner submit transition to pending_review", () => {
    expect(nextStatusForSubmit("owner")).toBe("pending_review");
  });

  it("maps agent and admin submit transitions to published", () => {
    expect(nextStatusForSubmit("agent")).toBe("published");
    expect(nextStatusForSubmit("admin")).toBe("published");
  });

  it("throws deterministic error for invalid runtime role input", () => {
    expect(() => nextStatusForSubmit("super-admin" as unknown as "owner")).toThrow(
      'Invalid publishing role for market listing submit transition: "super-admin"',
    );
  });

  it("allows admin moderation transitions for approve/reject/unpublish paths", () => {
    expect(canModerateMarketListingTransition("pending_review", "published")).toBe(true);
    expect(canModerateMarketListingTransition("pending_review", "rejected")).toBe(true);
    expect(canModerateMarketListingTransition("published", "unpublished")).toBe(true);
    expect(canModerateMarketListingTransition("draft", "published")).toBe(false);
  });

  it("supports land and video_shooting listing property types", () => {
    const listingTypeValues: ListingType[] = ["land", "video_shooting"];

    expect(listingTypeValues).toEqual(["land", "video_shooting"]);
  });

  it("supports neighborhood and area filter fields", () => {
    const filters: ListingFilters = {
      neighborhood_slug: "thamel",
      min_area_sqft: 400,
      max_area_sqft: 2400,
    };

    expect(filters.min_area_sqft).toBe(400);
    expect(filters.max_area_sqft).toBe(2400);
    expect(filters.neighborhood_slug).toBe("thamel");
  });
});
