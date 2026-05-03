/**
 * KTM Apartments — Mock data assembly (canonical rows live under fixtures/catalog/*.json).
 */
import type {
  Favorite,
  Inquiry,
  Listing,
  ListingListItem,
  PaginatedResponse,
  VisitRequest,
} from "@/lib/api/types";

import {
  favoritesSeed,
  inquiriesSeed,
  mockAdmin,
  mockAdminAnalytics,
  mockAdminAuthTokens,
  mockAgent,
  mockAgentAuthTokens,
  mockAgentProfile,
  mockAmenities,
  mockAuditLogs,
  mockAuthTokens,
  mockListings,
  mockLocalities,
  mockOwner,
  mockOwnerAuthTokens,
  mockOwnerProfile,
  mockRenter,
  mockRenterProfile,
  mockRentListingVariants,
  mockReports,
  mswAuthLogins,
  mswScenarioKnobs,
  mswSyntheticIds,
  mswUploadTemplates,
  visitRequestsSeed,
} from "./fixtures";

export {
  mockAdmin,
  mockAdminAnalytics,
  mockAdminAuthTokens,
  mockAgent,
  mockAgentAuthTokens,
  mockAgentProfile,
  mockAmenities,
  mockAuditLogs,
  mockAuthTokens,
  mockListings,
  mockLocalities,
  mockOwner,
  mockOwnerAuthTokens,
  mockOwnerProfile,
  mockRenter,
  mockRenterProfile,
  mockRentListingVariants,
  mockReports,
  mswAuthLogins,
  mswScenarioKnobs,
  mswSyntheticIds,
  mswUploadTemplates,
};

function cloneListingVariant(id: string): Listing {
  const listing = mockRentListingVariants.find((l) => l.id === id);
  if (!listing) {
    throw new Error(`mock rent variant "${id}" missing from fixtures/catalog/listings.json`);
  }
  // JSON round-trip: deep clone without relying on `structuredClone` (missing in some Jest runtimes).
  return JSON.parse(JSON.stringify(listing)) as Listing;
}

export function buildRentListingFull(): Listing {
  return cloneListingVariant("rent-variant-full");
}

export function buildRentListingSparse(): Listing {
  return cloneListingVariant("rent-variant-sparse");
}

export function buildRentListingMixed(): Listing {
  return cloneListingVariant("rent-variant-mixed");
}

export function buildRentListingPremium(): Listing {
  return cloneListingVariant("rent-variant-premium");
}

export function buildRentListingMinimal(): Listing {
  return cloneListingVariant("rent-variant-minimal");
}

export const mockListingItems: ListingListItem[] = mockListings.map((l) => ({
  id: l.id,
  slug: l.slug,
  title: l.title,
  purpose: l.purpose,
  price: l.price,
  price_period: l.price_period,
  currency: l.currency,
  bedrooms: l.bedrooms,
  bathrooms: l.bathrooms,
  area_m2: l.area_m2,
  listing_type: l.listing_type,
  furnishing: l.furnishing,
  status: l.status,
  is_verified: l.is_verified,
  is_sponsored: l.is_sponsored,
  sponsored_weight: l.sponsored_weight ?? null,
  sponsored_until: l.sponsored_until ?? null,
  pets_allowed: l.pets_allowed,
  parking: l.parking,
  location: l.location,
  images: l.images,
  created_at: l.created_at,
}));

function attachListingItem<T extends { listing_id: string; listing?: ListingListItem | null }>(
  rows: T[],
): (T & { listing: ListingListItem | null })[] {
  return rows.map((row) => ({
    ...row,
    listing: mockListingItems.find((item) => item.id === row.listing_id) ?? row.listing ?? null,
  }));
}

export const mockInquiries: Inquiry[] = attachListingItem(inquiriesSeed).map((row) => ({
  ...row,
  sender: mockRenterProfile,
})) as Inquiry[];

export const mockVisitRequests: VisitRequest[] = attachListingItem(visitRequestsSeed) as VisitRequest[];

export const mockFavorites: Favorite[] = attachListingItem(favoritesSeed) as Favorite[];

export const mockSaleListings = mockListings.filter(
  (listing) => listing.purpose === "sale" && listing.status === "active",
);

export const mockSaleInquiries = mockInquiries.filter(
  (inquiry) =>
    inquiry.listing?.purpose === "sale" &&
    mockSaleListings.some((listing) => listing.id === inquiry.listing_id),
);

export const mockListingsPage1: PaginatedResponse<ListingListItem> = {
  items: mockListingItems,
  total: mockListingItems.length,
  page: 1,
  page_size: 20,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

export const mockThamelListings: PaginatedResponse<ListingListItem> = {
  items: mockListingItems.filter((l) => l.location?.locality?.slug === "thamel"),
  total: mockListingItems.filter((l) => l.location?.locality?.slug === "thamel").length,
  page: 1,
  page_size: 20,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

const mockPendingListingItems = mockListingItems.filter((l) => l.status === "pending");

export const mockPendingListings: PaginatedResponse<ListingListItem> = {
  items: mockPendingListingItems,
  total: mockPendingListingItems.length,
  page: 1,
  page_size: 20,
  total_pages: 1,
  has_next: false,
  has_prev: false,
};

export const mockListingsByPrice = {
  under10k: mockListingItems.filter((l) => Number(l.price) < 10000),
  between10kAnd30k: mockListingItems.filter((l) => Number(l.price) >= 10000 && Number(l.price) <= 30000),
  above30k: mockListingItems.filter((l) => Number(l.price) > 30000),
};

export const mockListingsByFurnishing = {
  fully: mockListingItems.filter((l) => l.furnishing === "fully"),
  semi: mockListingItems.filter((l) => l.furnishing === "semi"),
  unfurnished: mockListingItems.filter((l) => l.furnishing === "unfurnished"),
};

export const mockListingsByBedrooms = {
  studio: mockListingItems.filter((l) => l.bedrooms === 0),
  oneBed: mockListingItems.filter((l) => l.bedrooms === 1),
  twoBed: mockListingItems.filter((l) => l.bedrooms === 2),
  threePlus: mockListingItems.filter((l) => (l.bedrooms ?? 0) >= 3),
};
