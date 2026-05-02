import {
  listingDetailToCompareSnapshot,
  listingListItemToCompareSnapshot,
} from "@/lib/compare/listingToCompareSnapshot";
import type { Listing, ListingListItem } from "@/lib/api/types";

describe("listingToCompareSnapshot", () => {
  const baseListItem: ListingListItem = {
    id: "l1",
    slug: "bright-flat",
    title: "Bright Flat",
    currency: "NPR",
    status: "active",
    images: [
      {
        id: "img1",
        listing_id: "l1",
        image_url: "https://images.ktmapartments.com/x.jpg",
        webp_url: "https://images.ktmapartments.com/x.webp",
        sort_order: 0,
        is_primary: true,
        is_cover: true,
      },
    ],
    created_at: "2026-01-01T00:00:00Z",
    price: 25000,
    price_period: "monthly",
    bedrooms: 2,
    bathrooms: 2,
    area_m2: 85,
    purpose: "rent",
  };

  it("maps list item fields for compare snapshot", () => {
    const s = listingListItemToCompareSnapshot(baseListItem);
    expect(s.id).toBe("l1");
    expect(s.slug).toBe("bright-flat");
    expect(s.cover_url).toContain("ktmapartments.com");
    expect(s.price_period).toBe("monthly");
    expect(s.purpose).toBe("rent");
  });

  it("maps listing detail fields for compare snapshot", () => {
    const listing = {
      ...baseListItem,
      owner_user_id: "u1",
      description: "Nice",
      amenities: [],
      updated_at: "2026-01-02T00:00:00Z",
    } as unknown as Listing;
    const s = listingDetailToCompareSnapshot(listing);
    expect(s.id).toBe("l1");
    expect(s.cover_url).toBeTruthy();
  });
});
