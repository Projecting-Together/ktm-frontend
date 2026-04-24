import "server-only";
import type { ApiResponse, Listing, ListingFilters, ListingListItem, PaginatedResponse } from "./types";
import { buildListingQueryParams } from "./listing-query-params";
import { LISTING_PUBLIC_LIST_TAG, listingPublicDetailTag } from "@/lib/cache/listing-tags";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ktmapartments.com/api/v1";

const API_FETCH_TIMEOUT_MS = 25_000;

async function readJson<T>(res: Response): Promise<ApiResponse<T>> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { detail?: string; message?: string };
      message = typeof body.detail === "string" ? body.detail : body.message ?? message;
    } catch {
      /* ignore */
    }
    return { data: null, error: { message, status: res.status } };
  }
  if (res.status === 204) return { data: null, error: null };
  return { data: (await res.json()) as T, error: null };
}

export async function fetchPublicListings(
  filters: ListingFilters,
  nextCache: { revalidate: number }
): Promise<ApiResponse<PaginatedResponse<ListingListItem>>> {
  const q = buildListingQueryParams(filters).toString();
  const path = q ? `/listings/?${q}` : "/listings/";
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    signal: AbortSignal.timeout(API_FETCH_TIMEOUT_MS),
    cache: "force-cache",
    next: {
      tags: [LISTING_PUBLIC_LIST_TAG],
      revalidate: nextCache.revalidate,
    },
  });
  return readJson<PaginatedResponse<ListingListItem>>(res);
}

export async function fetchPublicListingDetail(
  slugOrId: string,
  nextCache: { revalidate: number }
): Promise<ApiResponse<Listing>> {
  const res = await fetch(`${API_BASE}/listings/${encodeURIComponent(slugOrId)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    signal: AbortSignal.timeout(API_FETCH_TIMEOUT_MS),
    cache: "force-cache",
    next: {
      tags: [LISTING_PUBLIC_LIST_TAG, listingPublicDetailTag(slugOrId)],
      revalidate: nextCache.revalidate,
    },
  });
  return readJson<Listing>(res);
}
