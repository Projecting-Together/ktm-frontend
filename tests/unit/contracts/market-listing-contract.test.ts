import {
  MARKET_LISTING_MODERATION_STATUSES,
  MARKET_LISTING_STATUSES,
  canModerateMarketListingTransition,
  nextStatusForSubmit,
} from "@/lib/contracts/marketListing";
import type { ListingFilters, ListingType, MarketListing } from "@/lib/api/types";

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

  it("supports optional market listing moderation metadata", () => {
    const listing: MarketListing = {
      id: "listing-1",
      title: "Shoot-ready rooftop space",
      slug: "shoot-ready-rooftop-space",
      description: "Large open rooftop suitable for video production.",
      price: 90000,
      currency: "NPR",
      location: "Lazimpat",
      property_type: "video_shooting",
      status: "pending_review",
      created_at: "2026-04-25T00:00:00.000Z",
      updated_at: "2026-04-25T00:00:00.000Z",
      is_moderated: true,
      is_verified: false,
      moderated_at: "2026-04-25T02:00:00.000Z",
      moderated_by: "admin-1",
      moderation_note: "Please provide additional ownership proof.",
    };

    expect(listing.is_moderated).toBe(true);
    expect(listing.is_verified).toBe(false);
    expect(listing.moderated_by).toBe("admin-1");
    expect(listing.moderation_note).toContain("ownership proof");
  });
});
