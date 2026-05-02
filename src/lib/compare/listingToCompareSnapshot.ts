import type { Listing, ListingListItem } from "@/lib/api/types";
import { getListingCoverImage } from "@/lib/utils";

export type CompareSnapshot = {
  id: string;
  slug: string;
  title: string;
  price: number | string | null;
  currency: string;
  price_period?: ListingListItem["price_period"];
  cover_url: string | null;
  bedrooms?: number | null;
  bathrooms?: number | string | null;
  area_m2?: number | null;
  purpose?: ListingListItem["purpose"];
};

export function listingListItemToCompareSnapshot(listing: ListingListItem): CompareSnapshot {
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    price: listing.price ?? null,
    currency: listing.currency,
    price_period: listing.price_period ?? undefined,
    cover_url: getListingCoverImage(listing),
    bedrooms: listing.bedrooms ?? undefined,
    bathrooms: listing.bathrooms ?? undefined,
    area_m2: listing.area_m2 ?? undefined,
    purpose: listing.purpose ?? undefined,
  };
}

export function listingDetailToCompareSnapshot(listing: Listing): CompareSnapshot {
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    price: listing.price ?? null,
    currency: listing.currency,
    price_period: listing.price_period ?? undefined,
    cover_url: getListingCoverImage(listing),
    bedrooms: listing.bedrooms ?? undefined,
    bathrooms: listing.bathrooms ?? undefined,
    area_m2: listing.area_m2 ?? undefined,
    purpose: listing.purpose ?? undefined,
  };
}
