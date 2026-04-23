import type {
  ListingImage,
  ListingListItem,
  ListingLocation,
  ListingStatus,
  ListingType,
  FurnishingType,
  PricePeriod,
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

export function mapListingDto(dto: ListingDto): ListingListItem {
  const title = trimText(dto.title) || "Untitled listing";

  return {
    id: dto.id,
    slug: dto.slug,
    title,
    price: dto.price ?? null,
    price_period: (dto.price_period as PricePeriod | null | undefined) ?? null,
    currency: trimText(dto.currency) || DEFAULT_CURRENCY,
    bedrooms: dto.bedrooms ?? null,
    bathrooms: dto.bathrooms ?? null,
    area_sqft: dto.area_sqft ?? null,
    listing_type: (dto.listing_type as ListingType | null | undefined) ?? null,
    furnishing: (dto.furnishing as FurnishingType | null | undefined) ?? null,
    status: dto.status ?? DEFAULT_STATUS,
    is_verified: dto.is_verified ?? false,
    pets_allowed: dto.pets_allowed ?? null,
    parking: dto.parking ?? null,
    location: normalizeLocation(dto.location),
    images: Array.isArray(dto.images) ? (dto.images as ListingImage[]) : [],
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
