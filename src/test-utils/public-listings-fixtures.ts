/**
 * Server-side public listing reads when `NEXT_PUBLIC_USE_MSW=true`.
 * Mirrors MSW `handlers.ts` filtering so home ISR and `/listings` stay consistent without HTTP.
 */
import type { ApiResponse, Listing, ListingFilters, ListingListItem, PaginatedResponse } from "@/lib/api/types";
import { buildListingQueryParams } from "@/lib/api/listing-query-params";
import {
  mockListingItems,
  mockListings,
  mockListingsPage1,
  mockPendingListings,
  mockRentListingVariants,
  mockThamelListings,
} from "@/test-utils/mockData";

const mockListingsWithRentVariants = [...mockListings, ...mockRentListingVariants];

export function isServerListingMocksEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MSW === "true";
}

/** Same filtering rules as MSW `filterListingItems` plus optional `purpose` query param. */
export function buildFilteredListingPageFromSearchParams(
  searchParams: URLSearchParams,
): PaginatedResponse<ListingListItem> {
  const status = searchParams.get("status");
  const city = searchParams.get("city");
  if (status === "pending") return mockPendingListings;
  if (city?.toLowerCase() === "thamel") return mockThamelListings;

  let filtered = [...mockListingItems];

  const purposeRaw = searchParams.get("purpose");
  const purpose: "rent" | "sale" = purposeRaw === "sale" ? "sale" : "rent";
  filtered = filtered.filter((l) => (l.purpose ?? "rent") === purpose);

  const priceMax = searchParams.get("price_max") ?? searchParams.get("max_price");
  const bedsMin = searchParams.get("beds") ?? searchParams.get("bedrooms");
  const bedsMax = searchParams.get("max_bedrooms");
  const bathsMin = searchParams.get("bathrooms");
  const bathsMax = searchParams.get("max_bathrooms");
  const furnishingValues = searchParams.getAll("furnishing");
  const verified = searchParams.get("verified");

  if (priceMax) filtered = filtered.filter((l) => Number(l.price) <= Number(priceMax));
  if (bedsMin) filtered = filtered.filter((l) => (l.bedrooms ?? 0) >= Number(bedsMin));
  if (bedsMax) filtered = filtered.filter((l) => (l.bedrooms ?? 999) <= Number(bedsMax));
  if (bathsMin) filtered = filtered.filter((l) => Number(l.bathrooms ?? 0) >= Number(bathsMin));
  if (bathsMax) filtered = filtered.filter((l) => Number(l.bathrooms ?? 999) <= Number(bathsMax));
  if (furnishingValues.length > 0) {
    const allowed = new Set(furnishingValues);
    filtered = filtered.filter((l) => l.furnishing != null && allowed.has(l.furnishing));
  }
  if (verified === "true") filtered = filtered.filter((l) => l.is_verified);
  if (city && city.toLowerCase() !== "thamel") {
    const q = city.trim().toLowerCase();
    filtered = filtered.filter((l) => (l.location?.city ?? "").toLowerCase().includes(q));
  }

  return {
    ...mockListingsPage1,
    items: filtered,
    total: filtered.length,
  };
}

export function getMockPaginatedPublicListings(filters: ListingFilters): PaginatedResponse<ListingListItem> {
  const params = buildListingQueryParams(filters);
  const base = buildFilteredListingPageFromSearchParams(params);
  const items = [...base.items];

  const sortBy = filters.sort_by ?? params.get("sort_by") ?? "created_at";
  const sortOrderRaw = filters.sort_order ?? params.get("sort_order") ?? "desc";
  const sortOrder = sortOrderRaw === "asc" ? "asc" : "desc";
  const ord = sortOrder === "asc" ? 1 : -1;
  items.sort((a, b) => {
    if (sortBy === "price") return (Number(a.price) - Number(b.price)) * ord;
    if (sortBy === "area_m2") return ((a.area_m2 ?? 0) - (b.area_m2 ?? 0)) * ord;
    return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * ord;
  });

  const limitRaw = filters.limit ?? Number(params.get("limit"));
  const pageRaw = filters.page ?? Number(params.get("page"));
  const pageSize = Math.min(100, Math.max(1, (Number.isFinite(limitRaw) ? limitRaw : 20) || 20));
  const page = Math.max(1, (Number.isFinite(pageRaw) ? pageRaw : 1) || 1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);

  return {
    items: slice,
    total,
    page,
    page_size: pageSize,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_prev: page > 1,
  };
}

export function getMockPublicListingsResponse(
  filters: ListingFilters,
): ApiResponse<PaginatedResponse<ListingListItem>> {
  return { data: getMockPaginatedPublicListings(filters), error: null };
}

export function getMockPublicListingDetail(slugOrId: string): ApiResponse<Listing> {
  const listing = mockListingsWithRentVariants.find((l) => l.slug === slugOrId || l.id === slugOrId);
  if (!listing) {
    return { data: null, error: { message: "Listing not found", status: 404 } };
  }
  return { data: listing, error: null };
}
