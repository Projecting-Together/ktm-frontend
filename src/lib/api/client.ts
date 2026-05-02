/**
 * KTM Apartments — API Client
 * Typed fetch wrapper with JWT access-token management.
 * Access token: in-memory only (15-min expiry).
 * Refresh token: httpOnly cookie (30-day expiry, browser-managed).
 */
import { buildListingQueryParams } from "./listing-query-params";
import { API_BASE, API_FETCH_TIMEOUT_MS } from "@/shared/appConfig";
import type {
  ApiResponse, TokenPair, User, Listing, ListingListItem,
  ListingFilters, MyListingsFilters, PaginatedResponse, Amenity,
  Inquiry, CreateInquiryPayload, VisitRequest, CreateVisitPayload,
  Favorite, PresignedUrlResponse, MediaConfirmPayload, ListingStats,
  AuditLog, AdminAnalyticsOverview, NewsArticle, NewsFilters, NewsListItem,
} from "./types";

export type { Listing, ListingListItem, ListingFilters, MyListingsFilters, PaginatedResponse, Amenity, User, Inquiry, VisitRequest, Favorite, AuditLog, AdminAnalyticsOverview, NewsListItem, NewsArticle, NewsFilters };

function mergeFetchSignals(userSignal: AbortSignal | undefined): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(API_FETCH_TIMEOUT_MS);
  if (!userSignal) return timeoutSignal;
  return AbortSignal.any([userSignal, timeoutSignal]);
}

function mapFetchFailure(err: unknown): string {
  if (err instanceof DOMException && err.name === "AbortError") {
    return "Request timed out. The server may be slow or unreachable — check your connection and try again.";
  }
  if (err instanceof TypeError) {
    const m = err.message.toLowerCase();
    if (m.includes("fetch") || m.includes("network") || m.includes("failed")) {
      return "Cannot reach the API server. Check your internet connection, firewall, or NEXT_PUBLIC_API_URL in development.";
    }
  }
  return err instanceof Error ? err.message : "Network error";
}

let accessToken: string | null = null;
export function setAccessToken(t: string | null) { accessToken = t; }
export function getAccessToken() { return accessToken; }
export function clearTokens() { accessToken = null; }
export function persistTokens(tokens: TokenPair) { accessToken = tokens.access_token; }
export function initializeAuth() { /* access token is in-memory only */ }

async function apiFetch<T>(path: string, options: RequestInit = {}, withAuth = true): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (withAuth && accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  try {
    const { signal: userSignal, ...restOptions } = options;
    const signal = mergeFetchSignals(userSignal ?? undefined);
    const res = await fetch(`${API_BASE}${path}`, {
      ...restOptions,
      headers,
      credentials: "include",
      signal,
    });

    if (res.status === 401 && withAuth) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${accessToken}`;
        const retrySignal = mergeFetchSignals(userSignal ?? undefined);
        const retry = await fetch(`${API_BASE}${path}`, {
          ...restOptions,
          headers,
          credentials: "include",
          signal: retrySignal,
        });
        if (retry.ok) {
          const data = retry.status === 204 ? null : await retry.json();
          return { data: data as T, error: null };
        }
      }
      clearTokens();
      return { data: null, error: { message: "Unauthorized", status: 401 } };
    }

    if (!res.ok) {
      let body: { detail?: string; message?: string } = {};
      try { body = await res.json(); } catch { /* ignore */ }
      const message = typeof body.detail === "string" ? body.detail : body.message ?? `HTTP ${res.status}`;
      return { data: null, error: { message, status: res.status } };
    }

    if (res.status === 204) return { data: null, error: null };
    return { data: await res.json() as T, error: null };
  } catch (err) {
    return { data: null, error: { message: mapFetchFailure(err) } };
  }
}

// Auth
export async function register(email: string, password: string) {
  return apiFetch<TokenPair>("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }, false);
}
export async function login(email: string, password: string) {
  const res = await apiFetch<TokenPair>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }, false);
  if (res.data) persistTokens(res.data);
  return res;
}
export async function logout() { await apiFetch("/auth/logout", { method: "POST" }); clearTokens(); }
export async function refreshAccessToken(): Promise<boolean> {
  const res = await apiFetch<TokenPair>("/auth/refresh", { method: "POST" }, false);
  if (res.data) { persistTokens(res.data); return true; }
  clearTokens(); return false;
}
export async function verifyEmail(token: string) {
  return apiFetch<{ message: string }>("/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) }, false);
}
export async function getCurrentUser() { return apiFetch<User>("/auth/me"); }
export async function upgradeCurrentUserToAgent() {
  return apiFetch<User>("/auth/upgrade-agent", { method: "POST" });
}

// Listings
export async function getListings(filters: ListingFilters = {}) {
  const q = buildListingQueryParams(filters).toString();
  return apiFetch<PaginatedResponse<ListingListItem>>(q ? `/listings/?${q}` : "/listings/", {}, false);
}

/** Current user's listings (authenticated). Supports optional `status` filter (e.g. `archived` → expired count). */
export async function getMyListings(filters: MyListingsFilters = {}) {
  const params = new URLSearchParams();
  if (filters.skip != null) params.set("skip", String(filters.skip));
  if (filters.limit != null) params.set("limit", String(filters.limit));
  if (filters.status != null) params.set("status", String(filters.status));
  const q = params.toString();
  return apiFetch<PaginatedResponse<ListingListItem>>(
    q ? `/listings/user/my-listings?${q}` : "/listings/user/my-listings",
  );
}

export async function getListing(slugOrId: string) { return apiFetch<Listing>(`/listings/${slugOrId}`, {}, false); }
export function buildNewsQueryParams(filters: NewsFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(filters)) {
    if (val === undefined || val === null || val === "") continue;
    params.set(key, String(val));
  }
  return params;
}
export async function getNews(filters: NewsFilters = {}) {
  const q = buildNewsQueryParams(filters).toString();
  return apiFetch<PaginatedResponse<NewsListItem>>(q ? `/news/published?${q}` : "/news/published", {}, false);
}
export async function getNewsDetail(slug: string) {
  return apiFetch<NewsArticle>(`/news/published/${slug}`, {}, false);
}
export async function createListing(payload: Partial<Listing>) {
  return apiFetch<Listing>("/listings", { method: "POST", body: JSON.stringify(payload) });
}
export async function updateListing(id: string, payload: Partial<Listing>) {
  return apiFetch<Listing>(`/listings/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}
export async function deleteListing(id: string) { return apiFetch<null>(`/listings/${id}`, { method: "DELETE" }); }
export async function publishListing(id: string) { return apiFetch<Listing>(`/listings/${id}/publish`, { method: "POST" }); }
export async function markListingRented(id: string) { return apiFetch<Listing>(`/listings/${id}/mark-rented`, { method: "POST" }); }
export async function getListingStats(id: string) { return apiFetch<ListingStats>(`/listings/${id}/stats`); }

// Media
export async function getPresignedUrl(listingId: string, filename: string, contentType: string) {
  return apiFetch<PresignedUrlResponse>("/media/presigned-url", { method: "POST", body: JSON.stringify({ listing_id: listingId, filename, content_type: contentType }) });
}
export async function confirmMediaUpload(payload: MediaConfirmPayload) {
  return apiFetch<{ id: string }>("/media/confirm", { method: "POST", body: JSON.stringify(payload) });
}
export async function deleteMedia(mediaId: string) { return apiFetch<null>(`/media/${mediaId}`, { method: "DELETE" }); }
export async function reorderMedia(listingId: string, order: string[]) {
  return apiFetch<null>(`/listings/${listingId}/media/reorder`, { method: "PATCH", body: JSON.stringify({ order }) });
}

// Amenities
export async function getAmenities(skip = 0, limit = 100) {
  return apiFetch<Amenity[]>(`/amenities/?skip=${skip}&limit=${limit}`, {}, false);
}

// Inquiries
export async function createInquiry(payload: CreateInquiryPayload) {
  return apiFetch<Inquiry>("/inquiries", { method: "POST", body: JSON.stringify(payload) });
}
export async function getMyInquiries() { return apiFetch<Inquiry[]>("/inquiries/sent"); }
export async function getReceivedInquiries() { return apiFetch<Inquiry[]>("/inquiries/received"); }
export async function replyToInquiry(id: string, reply: string) {
  return apiFetch<Inquiry>(`/inquiries/${id}/reply`, { method: "PATCH", body: JSON.stringify({ owner_reply: reply }) });
}

// Visits
export async function createVisitRequest(payload: CreateVisitPayload) {
  return apiFetch<VisitRequest>("/visits", { method: "POST", body: JSON.stringify(payload) });
}
export async function getMyVisitRequests() { return apiFetch<VisitRequest[]>("/visits/my"); }
export async function getReceivedVisitRequests() { return apiFetch<VisitRequest[]>("/visits/received"); }
export async function confirmVisit(id: string, confirmedDate: string) {
  return apiFetch<VisitRequest>(`/visits/${id}/confirm`, { method: "PATCH", body: JSON.stringify({ confirmed_date: confirmedDate }) });
}

// Favorites
export async function getFavorites() { return apiFetch<Favorite[]>("/favorites"); }
export async function addFavorite(listingId: string) {
  return apiFetch<Favorite>("/favorites", { method: "POST", body: JSON.stringify({ listing_id: listingId }) });
}
export async function removeFavorite(listingId: string) { return apiFetch<null>(`/favorites/${listingId}`, { method: "DELETE" }); }

// Admin
export async function adminGetPendingListings(page = 1) {
  return apiFetch<PaginatedResponse<ListingListItem>>(`/admin/listings?status=pending&page=${page}`);
}
export async function adminApproveListing(id: string) {
  return apiFetch<Listing>(`/admin/listings/${id}/approve`, { method: "PATCH" });
}
export async function adminRejectListing(id: string, reason: string) {
  return apiFetch<Listing>(`/admin/listings/${id}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) });
}
export async function adminGetUsers(page = 1) {
  return apiFetch<PaginatedResponse<User>>(`/admin/users?page=${page}`);
}
export async function adminSuspendUser(id: string, reason: string) {
  return apiFetch<User>(`/admin/users/${id}/suspend`, { method: "PATCH", body: JSON.stringify({ reason }) });
}
export async function adminGetAuditLog(page = 1) {
  return apiFetch<PaginatedResponse<AuditLog>>(`/admin/audit-log?page=${page}`);
}
export async function adminGetAnalytics() { return apiFetch<AdminAnalyticsOverview>("/admin/analytics/overview"); }
