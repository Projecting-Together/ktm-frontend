/**
 * DTOs aligned with KTM-Apartments-Back Pydantic schemas (app/schemas/schemas.py).
 * UUIDs and datetimes are serialized as strings in JSON.
 */

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
  role: string;
  created_at: string;
  profile?: UserProfile | null;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Amenity {
  id: string;
  name: string;
  amenity_type?: string | null;
  code?: string | null;
}

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
}

export interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  alt_text?: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at?: string;
}

/** GET /listings — items use ListingList schema. */
export interface ListingListItem {
  id: string;
  title: string;
  price?: string | number | null;
  currency: string;
  bedrooms?: number | null;
  bathrooms?: string | number | null;
  area_sqft?: number | null;
  listing_type?: string | null;
  status: string;
  location?: ListingLocation | null;
  images: ListingImage[];
}

/** GET /listings/{id} — full Listing schema. */
export interface Listing {
  id: string;
  owner_user_id: string;
  title: string;
  description?: string | null;
  listing_type?: string | null;
  purpose?: string | null;
  price?: string | number | null;
  price_period?: string | null;
  currency: string;
  furnished?: boolean | null;
  status: string;
  pets_allowed?: boolean | null;
  smoking_allowed?: boolean | null;
  bedrooms?: number | null;
  bathrooms?: string | number | null;
  floor?: number | null;
  total_floors?: number | null;
  area_sqft?: number | null;
  created_at: string;
  updated_at: string;
  location?: ListingLocation | null;
  images: ListingImage[];
  amenities: Amenity[];
}

/** PaginatedResponse[T] from app/schemas/pagination.py */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/** Query params for GET /listings — matches app/api/v1/listings.py */
export interface ListingFilters {
  skip?: number;
  limit?: number;
  listing_type?: string;
  city?: string;
  district?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  bathrooms?: number;
  purpose?: string;
  furnished?: boolean;
  /** Backend requires min_length=2 when present */
  search?: string;
  sort_by?: "created_at" | "price" | "area_sqft" | "bedrooms" | string;
  sort_order?: "asc" | "desc" | string;
}
