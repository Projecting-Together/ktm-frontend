import {
  MARKET_LISTING_MODERATION_STATUSES,
  MARKET_LISTING_STATUSES,
  canModerateMarketListingTransition,
  nextStatusForSubmit,
} from "@/lib/contracts/marketListing";
import type { ListingFilters, ListingType, MarketListing } from "@/lib/api/types";
import { step1Schema } from "@/lib/validations/listingSchema";

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
    expect(() => Reflect.apply(nextStatusForSubmit, undefined, ["super-admin"])).toThrow(
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

  it("supports neighborhood and m2 area filter fields", () => {
    const filters: ListingFilters = {
      neighborhood_slug: "thamel",
      min_area_m2: 37.5,
      max_area_m2: 223.0,
    };

    expect(filters.min_area_m2).toBe(37.5);
    expect(filters.max_area_m2).toBe(223.0);
    expect(filters.neighborhood_slug).toBe("thamel");
  });

  it("accepts decimal m2 and ignores legacy sqft input", () => {
    const decimalM2Input = {
      title: "Modern 2BHK apartment in Baluwatar",
      listing_type: "apartment",
      purpose: "rent",
      address_line: "Baluwatar, Kathmandu",
      area_m2: 72.4,
    };

    expect(step1Schema.safeParse(decimalM2Input).success).toBe(true);
    const parsed = step1Schema.parse({
      ...decimalM2Input,
      area_sqft: 779,
    } as unknown);
    expect(parsed).toMatchObject(decimalM2Input);
    expect(parsed).not.toHaveProperty("area_sqft");
  });

  it("includes sponsored ranking metadata on market listing contracts", () => {
    const listing: MarketListing = {
      id: "listing-1",
      title: "Sponsored commercial space",
      slug: "sponsored-commercial-space",
      description: "Prime location space with high street frontage",
      price: 25000000,
      currency: "NPR",
      location: "New Baneshwor, Kathmandu",
      property_type: "commercial",
      status: "published",
      is_sponsored: true,
      sponsored_weight: 1.5,
      sponsored_until: "2026-12-01T00:00:00.000Z",
      created_at: "2026-04-01T00:00:00.000Z",
      updated_at: "2026-04-02T00:00:00.000Z",
    };

    expect(listing.is_sponsored).toBe(true);
    expect(listing.sponsored_weight).toBe(1.5);
    expect(listing.sponsored_until).toBe("2026-12-01T00:00:00.000Z");
  });
});
