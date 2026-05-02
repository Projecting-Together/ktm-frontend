/**
 * KTM Apartments — API Type Definitions
 * Aligned with backend Pydantic schemas. UUIDs/datetimes as strings.
 * Domain string enums are driven by `openapi/ktm-client.openapi.yaml` → `generated/openapi-types.ts`.
 */

import type { components } from "@/lib/api/generated/openapi-types";

/** Canonical role codes (OpenAPI `UserRole`). */
export type UserRole = components["schemas"]["UserRole"];
export const USER_ROLE_VALUES = ["renter", "owner", "agent", "moderator", "admin"] as const satisfies readonly UserRole[];

/** Roles allowed to create listings (moderator is staff moderation-only in current product rules). */
export const LISTING_CREATOR_ROLE_VALUES = ["renter", "owner", "agent", "admin"] as const satisfies readonly UserRole[];

/** Roles that may access moderation / admin-queue flows. */
export const MODERATION_ROLE_VALUES = ["moderator", "admin"] as const satisfies readonly UserRole[];

/** Canonical account status codes (OpenAPI `UserStatus`). */
export type UserStatus = components["schemas"]["UserStatus"];
export const USER_STATUS_VALUES = ["active", "suspended", "pending_verification"] as const satisfies readonly UserStatus[];

export interface UserProfile {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  is_verified: boolean;
  created_at: string;
  profile?: UserProfile | null;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/** Kathmandu area / locality catalog entry (e.g. Thamel, Lazimpat). */
export interface Locality {
  id: string;
  name: string;
  name_ne?: string | null;
  slug: string;
  description?: string | null;
  description_ne?: string | null;
  lat?: number | null;
  lng?: number | null;
  meta_data?: Record<string, unknown> | null;
  listing_count?: number;
  avg_price?: number | null;
  image_url?: string | null;
}

export type AmenityType = components["schemas"]["AmenityType"];

export interface Amenity {
  id: string;
  name: string;
  amenity_type?: AmenityType | null;
  code?: string | null;
  icon?: string | null;
}

/** Canonical listing type codes (OpenAPI `ListingType`); use for Zod `z.enum` and filter option lists. */
export type ListingType = components["schemas"]["ListingType"];
export const LISTING_TYPE_VALUES = [
  "apartment",
  "room",
  "house",
  "studio",
  "penthouse",
  "commercial",
  "land",
  "video_shooting",
] as const satisfies readonly ListingType[];

export type ListingPurpose = components["schemas"]["ListingPurpose"];
export const LISTING_PURPOSE_VALUES = ["rent", "sale"] as const satisfies readonly ListingPurpose[];

/** Canonical listing lifecycle statuses (OpenAPI `ListingStatus`); labels live in `formatListingStatusLabel` / UI maps. */
export type ListingStatus = components["schemas"]["ListingStatus"];
export const LISTING_STATUS_VALUES = [
  "draft",
  "pending",
  "pending_payment",
  "active",
  "expired",
  "rented",
  "sold",
  "rejected",
  "archived",
] as const satisfies readonly ListingStatus[];

export type FurnishingType = components["schemas"]["FurnishingType"];
export const FURNISHING_TYPE_VALUES = ["fully", "semi", "unfurnished"] as const satisfies readonly FurnishingType[];

export type PricePeriod = components["schemas"]["PricePeriod"];
export const PRICE_PERIOD_VALUES = ["monthly", "yearly", "daily"] as const satisfies readonly PricePeriod[];

export interface ListingLocation {
  location_id: string;
  listing_id: string;
  address_line?: string | null;
  city?: string | null;
  municipality?: string | null;
  district?: string | null;
  province?: string | null;
  ward_no?: number | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  locality?: Locality | null;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  webp_url?: string | null;
  storage_key?: string;
  alt_text?: string | null;
  sort_order: number;
  is_primary: boolean;
  is_cover: boolean;
  upload_status?: "pending" | "processing" | "complete" | "failed";
  created_at?: string;
}

export interface ListingListItem {
  id: string;
  slug: string;
  title: string;
  purpose?: ListingPurpose | null;
  price?: string | number | null;
  price_period?: PricePeriod | null;
  currency: string;
  bedrooms?: number | null;
  bathrooms?: string | number | null;
  area_m2?: number | null;
  listing_type?: ListingType | null;
  furnishing?: FurnishingType | null;
  status: ListingStatus;
  is_verified?: boolean;
  is_moderated?: boolean;
  is_sponsored?: boolean;
  sponsored_weight?: number | null;
  sponsored_until?: string | null;
  pets_allowed?: boolean | null;
  parking?: boolean | null;
  location?: ListingLocation | null;
  images: ListingImage[];
  created_at: string;
}

export interface Listing {
  id: string;
  slug: string;
  owner_user_id: string;
  locality_id?: string | null;
  title: string;
  description?: string | null;
  listing_type?: ListingType | null;
  purpose?: ListingPurpose | null;
  price?: string | number | null;
  price_period?: PricePeriod | null;
  currency: string;
  furnishing?: FurnishingType | null;
  status: ListingStatus;
  is_verified?: boolean;
  is_moderated?: boolean;
  is_sponsored?: boolean;
  sponsored_weight?: number | null;
  sponsored_until?: string | null;
  pets_allowed?: boolean | null;
  smoking_allowed?: boolean | null;
  parking?: boolean | null;
  bedrooms?: number | null;
  bathrooms?: string | number | null;
  floor?: number | null;
  total_floors?: number | null;
  area_m2?: number | null;
  available_from?: string | null;
  security_deposit?: number | null;
  price_negotiable?: boolean | null;
  show_phone?: boolean | null;
  show_whatsapp?: boolean | null;
  show_email?: boolean | null;
  created_at: string;
  updated_at: string;
  location?: ListingLocation | null;
  images: ListingImage[];
  amenities: Amenity[];
  owner?: (UserProfile & { email?: string; role?: UserRole; is_verified?: boolean }) | null;
}

export interface ListingStats {
  listing_id: string;
  views: number;
  inquiries: number;
  favorites: number;
  visits_requested: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ListingFilters {
  skip?: number;
  limit?: number;
  page?: number;
  listing_type?: string;
  purpose?: string;
  city?: string;
  district?: string;
  min_price?: number;
  max_price?: number;
  /** Minimum bedroom count (maps to API `bedrooms` query param). */
  min_bedrooms?: number;
  /** Maximum bedroom count (API `max_bedrooms`). */
  max_bedrooms?: number;
  /** Minimum bathroom count (maps to API `bathrooms` query param). */
  min_bathrooms?: number;
  /** Maximum bathroom count (API `max_bathrooms`). */
  max_bathrooms?: number;
  furnishing?: string;
  parking?: boolean;
  pets_allowed?: boolean;
  verified?: boolean;
  available_from?: string;
  amenities?: string[];
  search?: string;
  sort_by?: "created_at" | "price" | "area_m2" | "bedrooms" | string;
  sort_order?: "asc" | "desc" | string;
  /** PostGIS bbox (reserved; backend not wired yet). */
  min_lat?: number;
  max_lat?: number;
  min_lng?: number;
  max_lng?: number;
  /** PostGIS radius search (reserved; backend not wired yet). */
  lat?: number;
  lng?: number;
  radius_km?: number;
  /** Public search: URL/store key; sent to API as `city` (substring match). */
  city_slug?: string;
  min_area_m2?: number;
  max_area_m2?: number;
}

/** Keys passed through listing search URL sync / API query building (stable order). */
export const LISTING_FILTER_PARAM_KEYS = [
  "skip",
  "limit",
  "page",
  "listing_type",
  "purpose",
  "city",
  "district",
  "city_slug",
  "min_price",
  "max_price",
  "min_area_m2",
  "max_area_m2",
  "min_bedrooms",
  "max_bedrooms",
  "min_bathrooms",
  "max_bathrooms",
  "furnishing",
  "parking",
  "pets_allowed",
  "verified",
  "available_from",
  "amenities",
  "search",
  "sort_by",
  "sort_order",
  "min_lat",
  "max_lat",
  "min_lng",
  "max_lng",
  "lat",
  "lng",
  "radius_km",
] as const satisfies ReadonlyArray<components["schemas"]["ListingSearchQueryParamKey"]>;

/** Authenticated `GET /listings/user/my-listings` query params. */
export interface MyListingsFilters {
  skip?: number;
  limit?: number;
  /** Backend stores `expired`; alias `archived` is accepted server-side. */
  status?: ListingStatus;
}

export type InquiryStatus = components["schemas"]["InquiryStatus"];

export interface Inquiry {
  id: string;
  listing_id: string;
  sender_id: string;
  owner_id: string;
  message: string;
  status: InquiryStatus;
  owner_reply?: string | null;
  move_in_date?: string | null;
  created_at: string;
  updated_at: string;
  listing?: ListingListItem | null;
  sender?: UserProfile | null;
}

export interface CreateInquiryPayload {
  listing_id: string;
  message: string;
  move_in_date?: string | null;
}

export type VisitStatus = components["schemas"]["VisitStatus"];

export interface VisitRequest {
  id: string;
  listing_id: string;
  requester_id: string;
  preferred_date: string;
  status: VisitStatus;
  confirmed_date?: string | null;
  notes?: string | null;
  created_at: string;
  listing?: ListingListItem | null;
}

export interface CreateVisitPayload {
  listing_id: string;
  preferred_date: string;
  notes?: string;
}

export interface Favorite {
  user_id: string;
  listing_id: string;
  created_at: string;
  listing?: ListingListItem | null;
}

export type ReportReason = components["schemas"]["ReportReason"];
export type ReportStatus = components["schemas"]["ReportStatus"];

export interface Report {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: ReportReason;
  status: ReportStatus;
  resolution_note?: string | null;
  created_at: string;
}

export interface PresignedUrlResponse {
  upload_url: string;
  storage_key: string;
  public_url: string;
}

export interface MediaConfirmPayload {
  listing_id: string;
  storage_key: string;
  sort_order?: number;
  is_cover?: boolean;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  target_type: string;
  target_id?: string | null;
  before_state?: Record<string, unknown> | null;
  after_state?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
  actor?: UserProfile | null;
}

export interface AdminAnalyticsOverview {
  total_listings: number;
  active_listings: number;
  pending_listings: number;
  total_users: number;
  new_users_today: number;
  total_inquiries: number;
  inquiries_today: number;
  total_views: number;
  top_localities: Array<{ name: string; count: number }>;
}

export interface NewsListItem {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  cover_image_url?: string | null;
  published_at?: string | null;
  is_published: boolean;
}

export interface NewsArticle extends NewsListItem {
  content?: string | null;
}

export interface NewsFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

/** CMS workflow state for authenticated news APIs (matches `ContentStatus` in contracts/news). */
export type NewsWorkspaceStatus = components["schemas"]["NewsWorkspaceStatus"];

/** Authenticated workspace article (`GET /news/workspace`). */
export interface NewsWorkspaceArticle {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  cover_image_url?: string | null;
  status: NewsWorkspaceStatus;
  rejection_reason?: string | null;
  published_at?: string | null;
  author_user_id?: string;
}

/** Admin moderation queue row (`GET /news/moderation/queue`). */
export interface NewsModerationQueueItem extends NewsWorkspaceArticle {
  author_user_id: string;
}

export interface NewsModerationQueueResponse {
  items: NewsModerationQueueItem[];
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  detail?: unknown;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

/** Public marketing/config from `GET .../site-config` (camelCase or snake_case from API). */
export interface SiteConfig {
  heroBannerUrl?: string | null;
  ctaBannerUrl?: string | null;
}
