import {
  adaptAuthUser,
  adaptListingsForMap,
  adaptListingsForSearch,
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
});
