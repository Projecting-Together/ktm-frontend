import type { ListingListItem } from "@/lib/api/types";
import { mapAuthUserDto, type AuthUserDto } from "@/lib/contracts/auth";
import { getMarketListingSubmitStatus } from "@/lib/contracts/marketListing";
import { canPublishNews, type PublisherRole } from "@/lib/contracts/news";
import { mapProfileDto, type ProfileDto } from "@/lib/contracts/profile";
import { mapListingDtos, mapListingsToMapMarkers, type ListingDto, type ListingMapMarker } from "@/lib/contracts/listing";
import type { ProfileModel } from "@/lib/contracts/profile";
import type { AuthUserModel } from "@/lib/contracts/auth";

export function adaptListingsForSearch(dtos: ListingDto[] | null | undefined): ListingListItem[] {
  return mapListingDtos(dtos);
}

export function adaptListingsForMap(dtos: ListingDto[] | null | undefined): ListingMapMarker[] {
  const listings = mapListingDtos(dtos);
  return mapListingsToMapMarkers(listings);
}

export function adaptAuthUser(dto: AuthUserDto | null | undefined): AuthUserModel | null {
  return mapAuthUserDto(dto);
}

export function adaptProfile(dto: ProfileDto): ProfileModel {
  return mapProfileDto(dto);
}

export function adaptNewsPublishPermission(role: PublisherRole): boolean {
  return canPublishNews(role);
}

export function adaptMarketListingSubmitStatus(role: PublisherRole) {
  return getMarketListingSubmitStatus(role);
}
