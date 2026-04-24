import {
  adaptAuthUser,
  adaptListingsForMap,
  adaptListingsForSearch,
  adaptMarketListingSubmitStatus,
  adaptNewsPublishPermission,
  adaptProfile,
} from "@/lib/contracts/adapters";

describe("contract adapters", () => {
  it("normalizes listing DTOs for search UI consumption", () => {
    const listings = adaptListingsForSearch([
      {
        id: "listing-1",
        slug: "listing-1",
        title: "  Bright Apartment  ",
        currency: "NPR",
        status: "active",
        created_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "listing-2",
        slug: "listing-2",
        title: "Missing image and location",
        status: "active",
        created_at: "2026-01-02T00:00:00Z",
      },
    ]);

    expect(listings).toHaveLength(2);
    expect(listings[0].title).toBe("Bright Apartment");
    expect(listings[0].images).toEqual([]);
    expect(listings[1].currency).toBe("NPR");
    expect(listings[1].location).toBeNull();
  });

  it("falls back to null for unsupported listing enum values", () => {
    const [listing] = adaptListingsForSearch([
      {
        id: "listing-enum",
        slug: "listing-enum",
        title: "Enum fallback",
        currency: "NPR",
        status: "active",
        created_at: "2026-01-01T00:00:00Z",
        listing_type: "castle" as never,
        furnishing: "luxury" as never,
        price_period: "weekly" as never,
      },
    ]);

    expect(listing.listing_type).toBeNull();
    expect(listing.furnishing).toBeNull();
    expect(listing.price_period).toBeNull();
  });

  it("drops malformed image entries and normalizes valid image fields", () => {
    const [listing] = adaptListingsForSearch([
      {
        id: "listing-images",
        slug: "listing-images",
        title: "Image normalize",
        currency: "NPR",
        status: "active",
        created_at: "2026-01-01T00:00:00Z",
        images: [
          null,
          "invalid-shape",
          {
            id: "img-1",
            listing_id: "listing-images",
            image_url: "https://cdn.example.com/1.jpg",
            sort_order: 5,
            is_primary: true,
            is_cover: false,
          },
          {
            image_url: "  ",
          },
          {
            image_url: "https://cdn.example.com/2.jpg",
          },
        ] as never,
      },
    ]);

    expect(listing.images).toHaveLength(2);
    expect(listing.images[0]).toMatchObject({
      id: "img-1",
      listing_id: "listing-images",
      image_url: "https://cdn.example.com/1.jpg",
      sort_order: 5,
      is_primary: true,
      is_cover: false,
    });
    expect(listing.images[1]).toMatchObject({
      id: "listing-images-image-4",
      listing_id: "listing-images",
      image_url: "https://cdn.example.com/2.jpg",
      sort_order: 4,
      is_primary: false,
      is_cover: false,
    });
  });

  it("adapts listings for map markers and filters invalid coordinates", () => {
    const markers = adaptListingsForMap([
      {
        id: "valid-1",
        slug: "valid-1",
        title: "Valid marker",
        currency: "NPR",
        status: "active",
        created_at: "2026-01-01T00:00:00Z",
        location: {
          location_id: "loc-1",
          listing_id: "valid-1",
          latitude: "27.7172",
          longitude: "85.3240",
        },
      },
      {
        id: "invalid-1",
        slug: "invalid-1",
        title: "Invalid marker",
        currency: "NPR",
        status: "active",
        created_at: "2026-01-01T00:00:00Z",
        location: {
          location_id: "loc-2",
          listing_id: "invalid-1",
          latitude: null,
          longitude: "85.3240",
        },
      },
    ]);

    expect(markers).toHaveLength(1);
    expect(markers[0]).toMatchObject({
      lat: 27.7172,
      lng: 85.324,
      listing: { id: "valid-1" },
    });
  });

  it("maps auth user DTO into UI-safe auth model", () => {
    const authUser = adaptAuthUser({
      id: "user-1",
      email: "sita.thapa@example.com",
      role: "owner",
      status: "active",
      is_verified: true,
      profile: {
        first_name: "Sita",
        last_name: "Thapa",
        avatar_url: null,
      },
    });

    expect(authUser).toMatchObject({
      id: "user-1",
      role: "owner",
      isVerified: true,
      fullName: "Sita Thapa",
      initials: "ST",
    });
  });

  it("reuses profile adapter through the compatibility layer", () => {
    const profile = adaptProfile({
      id: "agent-1",
      email: "agent@example.com",
      role: "agent",
      profile: { first_name: "Ramesh", last_name: "Sharma" },
    });

    expect(profile.fullName).toBe("Ramesh Sharma");
  });

  it("adapts news publish permission consistently", () => {
    expect(adaptNewsPublishPermission("owner")).toBe(false);
    expect(adaptNewsPublishPermission("agent")).toBe(true);
    expect(adaptNewsPublishPermission("admin")).toBe(true);
  });

  it("adapts market listing submit status consistently", () => {
    expect(adaptMarketListingSubmitStatus("owner")).toBe("pending_review");
    expect(adaptMarketListingSubmitStatus("agent")).toBe("published");
    expect(adaptMarketListingSubmitStatus("admin")).toBe("published");
  });

  it("surfaces deterministic error for invalid runtime market listing role", () => {
    expect(() => adaptMarketListingSubmitStatus("invalid-role" as never)).toThrow(
      'Invalid publishing role for market listing submit transition: "invalid-role"',
    );
  });
});
