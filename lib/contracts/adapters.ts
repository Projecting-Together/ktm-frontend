import type { ListingListItem } from "@/lib/api/types";
import { mapAuthUserDto, type AuthUserDto } from "@/lib/contracts/auth";
import { mapProfileDto, type ProfileDto } from "@/lib/contracts/profile";
import { mapListingDtos, mapListingsToMapMarkers, type ListingDto } from "@/lib/contracts/listing";

export function adaptListingsForSearch(dtos: ListingDto[] | null | undefined): ListingListItem[] {
  return mapListingDtos(dtos);
}

export function adaptListingsForMap(dtos: ListingDto[] | null | undefined) {
  const listings = mapListingDtos(dtos);
  return mapListingsToMapMarkers(listings);
}

export function adaptAuthUser(dto: AuthUserDto | null | undefined) {
  return mapAuthUserDto(dto);
}

export function adaptProfile(dto: ProfileDto) {
  return mapProfileDto(dto);
}
