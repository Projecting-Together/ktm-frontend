import type { AdminListing } from "@/lib/admin/types";
import {
  buildRentListingFull,
  buildRentListingSparse,
  buildRentListingMixed,
  buildRentListingPremium,
  buildRentListingMinimal,
} from "@/test-utils/mockData";

export const adminListings: AdminListing[] = [
  buildRentListingFull(),
  buildRentListingSparse(),
  buildRentListingMixed(),
  buildRentListingPremium(),
  buildRentListingMinimal(),
].map((listing, index) => ({
  id: listing.id,
  title: listing.title,
  type:
    listing.listing_type === "room" ||
    listing.listing_type === "house" ||
    listing.listing_type === "studio" ||
    listing.listing_type === "commercial"
      ? listing.listing_type
      : "apartment",
  status: index === 0 ? "pending" : index === 1 ? "active" : index === 2 ? "rejected" : "active",
  city: listing.location?.city ?? "Kathmandu",
  priceNpr: Number(listing.price ?? 0),
  createdAt: listing.created_at,
}));
