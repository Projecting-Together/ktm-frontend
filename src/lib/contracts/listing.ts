import {
  FURNISHING_TYPE_VALUES,
  LISTING_TYPE_VALUES,
  PRICE_PERIOD_VALUES,
  type FurnishingType,
  type ListingImage,
  type ListingListItem,
  type ListingLocation,
  type ListingStatus,
  type ListingType,
  type PricePeriod,
} from "@/lib/api/types";

export type ListingDto = Partial<ListingListItem> & {
  id: string;
  slug: string;
  title?: string | null;
};

export interface ListingMapMarker {
  listing: ListingListItem;
  lat: number;
  lng: number;
}

const DEFAULT_CURRENCY = "NPR";
const DEFAULT_STATUS: ListingStatus = "active";
const ALLOWED_PRICE_PERIODS: ReadonlySet<PricePeriod> = new Set(PRICE_PERIOD_VALUES);
const ALLOWED_LISTING_TYPES: ReadonlySet<ListingType> = new Set(LISTING_TYPE_VALUES);
const ALLOWED_FURNISHING_TYPES: ReadonlySet<FurnishingType> = new Set(FURNISHING_TYPE_VALUES);

const trimText = (value: string | null | undefined): string => value?.trim() ?? "";

function normalizeLocation(location?: ListingLocation | null): ListingLocation | null {
  if (!location) return null;
  return {
    ...location,
    latitude: location.latitude ?? null,
    longitude: location.longitude ?? null,
  };
}

function toFiniteNumber(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}

function normalizeEnum<T extends string>(value: unknown, allowlist: ReadonlySet<T>): T | null {
  if (typeof value !== "string") return null;
  return allowlist.has(value as T) ? (value as T) : null;
}

function normalizeImages(listingId: string, images: unknown): ListingImage[] {
  if (!Array.isArray(images)) return [];

  return images.flatMap((image, index) => {
    if (!image || typeof image !== "object") return [];

    const candidate = image as Partial<ListingImage>;
    if (typeof candidate.image_url !== "string" || trimText(candidate.image_url) === "") return [];

    return [{
      id: typeof candidate.id === "string" && candidate.id ? candidate.id : `${listingId}-image-${index}`,
      listing_id: typeof candidate.listing_id === "string" && candidate.listing_id ? candidate.listing_id : listingId,
      image_url: trimText(candidate.image_url),
      webp_url: typeof candidate.webp_url === "string" ? candidate.webp_url : null,
      storage_key: typeof candidate.storage_key === "string" ? candidate.storage_key : "",
      alt_text: typeof candidate.alt_text === "string" ? candidate.alt_text : null,
      sort_order: typeof candidate.sort_order === "number" && Number.isFinite(candidate.sort_order) ? candidate.sort_order : index,
      is_primary: Boolean(candidate.is_primary),
      is_cover: Boolean(candidate.is_cover),
      upload_status: candidate.upload_status,
      created_at: typeof candidate.created_at === "string" ? candidate.created_at : undefined,
    }];
  });
}

export function mapListingDto(dto: ListingDto): ListingListItem {
  const title = trimText(dto.title) || "Untitled listing";

  return {
    id: dto.id,
    slug: dto.slug,
    title,
    price: dto.price ?? null,
    price_period: normalizeEnum(dto.price_period, ALLOWED_PRICE_PERIODS),
    currency: trimText(dto.currency) || DEFAULT_CURRENCY,
    bedrooms: dto.bedrooms ?? null,
    bathrooms: dto.bathrooms ?? null,
    area_m2: dto.area_m2 ?? null,
    listing_type: normalizeEnum(dto.listing_type, ALLOWED_LISTING_TYPES),
    furnishing: normalizeEnum(dto.furnishing, ALLOWED_FURNISHING_TYPES),
    status: dto.status ?? DEFAULT_STATUS,
    is_verified: dto.is_verified ?? false,
    pets_allowed: dto.pets_allowed ?? null,
    parking: dto.parking ?? null,
    location: normalizeLocation(dto.location),
    images: normalizeImages(dto.id, dto.images),
    created_at: dto.created_at ?? new Date(0).toISOString(),
  };
}

export function mapListingDtos(dtos: ListingDto[] | null | undefined): ListingListItem[] {
  if (!Array.isArray(dtos) || dtos.length === 0) return [];
  return dtos.map(mapListingDto);
}

export function mapListingsToMapMarkers(listings: ListingListItem[]): ListingMapMarker[] {
  return listings.flatMap((listing) => {
    const lat = toFiniteNumber(listing.location?.latitude);
    const lng = toFiniteNumber(listing.location?.longitude);
    if (lat == null || lng == null) return [];
    return [{ listing, lat, lng }];
  });
}
