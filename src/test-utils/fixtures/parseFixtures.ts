import { z } from "zod";
import type { AdminListing } from "@/lib/admin/types";
import type {
  AdminAnalyticsOverview,
  Amenity,
  AuditLog,
  Favorite,
  Inquiry,
  Listing,
  ListingImage,
  Locality,
  Report,
  TokenPair,
  User,
  VisitRequest,
} from "@/lib/api/types";

const localitySchema = z.object({
  id: z.string(),
  name: z.string(),
  name_ne: z.string().nullable().optional(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  description_ne: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  meta_data: z.record(z.string(), z.unknown()).nullable().optional(),
  listing_count: z.number().optional(),
  avg_price: z.number().nullable().optional(),
  image_url: z.string().nullable().optional(),
});

const amenitySchema = z.object({
  id: z.string(),
  name: z.string(),
  amenity_type: z.enum(["building", "unit", "nearby"]).nullable().optional(),
  code: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
});

const listingsBundleSchema = z.object({
  primary: z.array(z.any()),
  rentVariants: z.array(z.any()),
});

export function parseLocalitiesCatalog(data: unknown): Locality[] {
  return z.array(localitySchema).parse(data) as Locality[];
}

export function parseAmenitiesCatalog(data: unknown): Amenity[] {
  return z.array(amenitySchema).parse(data) as Amenity[];
}

export function parseListingsBundle(data: unknown): { primary: Listing[]; rentVariants: Listing[] } {
  const o = listingsBundleSchema.parse(data);
  return {
    primary: o.primary as Listing[],
    rentVariants: o.rentVariants as Listing[],
  };
}

export function parseUsersCatalog(data: unknown): User[] {
  return z.array(z.any()).parse(data) as User[];
}

export function parseInquiriesSeed(data: unknown): Inquiry[] {
  return z.array(z.any()).parse(data) as Inquiry[];
}

export function parseVisitRequestsSeed(data: unknown): VisitRequest[] {
  return z.array(z.any()).parse(data) as VisitRequest[];
}

export function parseFavoritesSeed(data: unknown): Favorite[] {
  return z.array(z.any()).parse(data) as Favorite[];
}

export function parseAuthTokensPair(data: unknown): { renter: TokenPair; owner: TokenPair } {
  const o = z.object({ renter: z.any(), owner: z.any() }).parse(data);
  return { renter: o.renter as TokenPair, owner: o.owner as TokenPair };
}

export function parseAdminAnalyticsSnapshot(data: unknown): AdminAnalyticsOverview {
  return z.any().parse(data) as AdminAnalyticsOverview;
}

export function parseAuditLogsSnapshot(data: unknown): AuditLog[] {
  return z.array(z.any()).parse(data) as AuditLog[];
}

export function parseReportsSnapshot(data: unknown): Report[] {
  return z.array(z.any()).parse(data) as Report[];
}

export function parseListingImagesFlat(data: unknown): Array<ListingImage & { listing_id: string }> {
  return z.array(z.any()).parse(data) as Array<ListingImage & { listing_id: string }>;
}

const adminListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(["apartment", "room", "house", "studio", "commercial"]),
  status: z.enum(["pending", "active", "sold", "rejected"]),
  city: z.string(),
  priceNpr: z.number(),
  createdAt: z.string(),
});

export function parseAdminListingsCatalog(data: unknown): AdminListing[] {
  return z.array(adminListingSchema).parse(data) as AdminListing[];
}
