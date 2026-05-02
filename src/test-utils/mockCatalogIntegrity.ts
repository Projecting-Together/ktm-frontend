/**
 * Full consistency checks for `mockData` — locality FKs, embedded locality objects,
 * images, amenities, derived listing items, inquiries, visits, and favorites.
 * Run via `pnpm run validate:fixtures` and `tests/unit/fixtures/mock-catalog-integrity.test.ts`.
 */
import {
  mockAmenities,
  mockFavorites,
  mockInquiries,
  mockListingItems,
  mockListings,
  mockListingsPage1,
  mockLocalities,
  mockPendingListings,
  mockRentListingVariants,
  mockThamelListings,
  mockVisitRequests,
} from "./mockData";

export function assertMockCatalogIntegrity(): void {
  const localityById = new Map(mockLocalities.map((l) => [l.id, l]));
  const amenityById = new Map(mockAmenities.map((a) => [a.id, a]));
  const listingItemById = new Map(mockListingItems.map((item) => [item.id, item]));

  const allListings = [...mockListings, ...mockRentListingVariants];
  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const listing of allListings) {
    if (ids.has(listing.id)) {
      throw new Error(`mock catalog: duplicate listing id "${listing.id}"`);
    }
    ids.add(listing.id);
    if (slugs.has(listing.slug)) {
      throw new Error(`mock catalog: duplicate listing slug "${listing.slug}"`);
    }
    slugs.add(listing.slug);

    const lid = listing.locality_id;
    if (lid == null || lid === "") {
      throw new Error(`mock catalog: listing "${listing.id}" missing locality_id`);
    }
    if (!localityById.has(lid)) {
      throw new Error(`mock catalog: listing "${listing.id}" locality_id "${lid}" not in mockLocalities`);
    }

    const embedded = listing.location?.locality;
    if (!embedded) {
      throw new Error(`mock catalog: listing "${listing.id}" missing location.locality`);
    }
    if (embedded.id !== lid) {
      throw new Error(
        `mock catalog: listing "${listing.id}" locality_id "${lid}" !== embedded locality id "${embedded.id}"`,
      );
    }

    for (const image of listing.images) {
      if (image.listing_id !== listing.id) {
        throw new Error(
          `mock catalog: image "${image.id}" listing_id "${image.listing_id}" !== listing "${listing.id}"`,
        );
      }
    }

    for (const amenity of listing.amenities) {
      if (!amenityById.has(amenity.id)) {
        throw new Error(
          `mock catalog: listing "${listing.id}" references unknown amenity id "${amenity.id}"`,
        );
      }
    }
  }

  if (mockListingItems.length !== mockListings.length) {
    throw new Error(
      `mock catalog: mockListingItems length (${mockListingItems.length}) !== mockListings (${mockListings.length})`,
    );
  }
  for (let i = 0; i < mockListings.length; i++) {
    if (mockListingItems[i]?.id !== mockListings[i]?.id) {
      throw new Error(
        `mock catalog: mockListingItems[${i}] id "${mockListingItems[i]?.id}" !== mockListings[${i}] id "${mockListings[i]?.id}"`,
      );
    }
  }

  if (mockListingsPage1.total !== mockListingsPage1.items.length) {
    throw new Error(
      `mock catalog: mockListingsPage1.total (${mockListingsPage1.total}) !== items.length (${mockListingsPage1.items.length})`,
    );
  }
  if (mockListingsPage1.items !== mockListingItems) {
    throw new Error("mock catalog: mockListingsPage1.items must be the same array reference as mockListingItems");
  }

  const pendingItems = mockListingItems.filter((item) => item.status === "pending");
  if (mockPendingListings.items.length !== pendingItems.length) {
    throw new Error(
      `mock catalog: mockPendingListings.items (${mockPendingListings.items.length}) !== filtered pending (${pendingItems.length})`,
    );
  }
  if (mockPendingListings.total !== pendingItems.length) {
    throw new Error(
      `mock catalog: mockPendingListings.total (${mockPendingListings.total}) !== pending count (${pendingItems.length})`,
    );
  }

  const thamelItems = mockListingItems.filter((item) => item.location?.locality?.slug === "thamel");
  if (mockThamelListings.items.length !== thamelItems.length) {
    throw new Error(
      `mock catalog: mockThamelListings.items (${mockThamelListings.items.length}) !== Thamel filter (${thamelItems.length})`,
    );
  }
  if (mockThamelListings.total !== thamelItems.length) {
    throw new Error(
      `mock catalog: mockThamelListings.total (${mockThamelListings.total}) !== Thamel count (${thamelItems.length})`,
    );
  }
  for (const item of mockThamelListings.items) {
    if (item.location?.locality?.slug !== "thamel") {
      throw new Error(`mock catalog: mockThamelListings contains non-Thamel item "${item.id}"`);
    }
  }

  for (const inquiry of mockInquiries) {
    if (!listingItemById.has(inquiry.listing_id)) {
      throw new Error(
        `mock catalog: inquiry "${inquiry.id}" listing_id "${inquiry.listing_id}" not found in mockListingItems`,
      );
    }
    if (inquiry.listing != null && inquiry.listing.id !== inquiry.listing_id) {
      throw new Error(
        `mock catalog: inquiry "${inquiry.id}" embedded listing id "${inquiry.listing.id}" !== listing_id "${inquiry.listing_id}"`,
      );
    }
  }

  for (const visit of mockVisitRequests) {
    if (!listingItemById.has(visit.listing_id)) {
      throw new Error(
        `mock catalog: visit "${visit.id}" listing_id "${visit.listing_id}" not in mockListingItems`,
      );
    }
    if (visit.listing != null && visit.listing.id !== visit.listing_id) {
      throw new Error(
        `mock catalog: visit "${visit.id}" embedded listing id mismatch`,
      );
    }
  }

  for (const fav of mockFavorites) {
    if (!listingItemById.has(fav.listing_id)) {
      throw new Error(
        `mock catalog: favorite (user ${fav.user_id}) listing_id "${fav.listing_id}" not in mockListingItems`,
      );
    }
    if (fav.listing != null && fav.listing.id !== fav.listing_id) {
      throw new Error(`mock catalog: favorite listing embed id mismatch for listing_id "${fav.listing_id}"`);
    }
  }
}
