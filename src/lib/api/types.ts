/**
 * KTM Apartments — API Type Definitions
 * Aligned with backend Pydantic schemas. UUIDs/datetimes as strings.
 */

export type UserRole = "renter" | "owner" | "agent" | "moderator" | "admin";
export type UserStatus = "active" | "suspended" | "pending_verification";

export interface UserProfile {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  whatsapp?: string | null;
  viber?: string | null;
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

export interface Neighborhood {
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

export type AmenityType = "building" | "unit" | "nearby";

export interface Amenity {
  id: string;
  name: string;
  amenity_type?: AmenityType | null;
  code?: string | null;
  icon?: string | null;
}

export type ListingType = "apartment" | "room" | "house" | "studio" | "penthouse" | "commercial" | "land" | "video_shooting";
export type ListingPurpose = "rent" | "sale";
export type ListingStatus = "draft" | "pending" | "active" | "rented" | "sold" | "rejected" | "archived";
export type FurnishingType = "fully" | "semi" | "unfurnished";
export type PricePeriod = "monthly" | "yearly" | "daily";

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
  neighborhood?: Neighborhood | null;
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
  area_sqft?: number | null;
  listing_type?: ListingType | null;
  furnishing?: FurnishingType | null;
  status: ListingStatus;
  is_verified?: boolean;
  is_moderated?: boolean;
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
  neighborhood_id?: string | null;
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
  pets_allowed?: boolean | null;
  smoking_allowed?: boolean | null;
  parking?: boolean | null;
  bedrooms?: number | null;
  bathrooms?: string | number | null;
  floor?: number | null;
  total_floors?: number | null;
  area_sqft?: number | null;
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
  owner?: (UserProfile & { email?: string; role?: UserRole; is_verified?: boolean; whatsapp_number?: string }) | null;
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
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string;
  parking?: boolean;
  pets_allowed?: boolean;
  verified?: boolean;
  available_from?: string;
  amenities?: string[];
  search?: string;
  sort_by?: "created_at" | "price" | "area_sqft" | "bedrooms" | string;
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
  neighborhood_slug?: string;
  min_area_sqft?: number;
  max_area_sqft?: number;
}

export type InquiryStatus = "pending" | "replied" | "closed";

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

export type VisitStatus = "pending" | "confirmed" | "cancelled" | "completed";

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

export type ReportReason = "spam" | "duplicate" | "misleading" | "inappropriate" | "fraud" | "other";
export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

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
  top_neighborhoods: Array<{ neighborhood: string; count: number }>;
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

export type MarketListingStatus = "draft" | "pending_review" | "published" | "rejected";
export type MarketListingPropertyType = "apartment" | "house" | "commercial" | "land" | "video_shooting";
export type MarketListingCurrency = "NPR" | "USD";

export interface MarketListing {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: MarketListingCurrency;
  location: string;
  property_type: MarketListingPropertyType;
  status: MarketListingStatus;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MarketListingFilters {
  page?: number;
  limit?: number;
  status?: MarketListingStatus;
  property_type?: MarketListingPropertyType;
  search?: string;
  min_price?: number;
  max_price?: number;
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
