import type { ListingListItem } from "@/lib/api/types";
import { mapAuthUserDto, type AuthUserDto } from "@/lib/contracts/auth";
import { nextStatusForSubmit, type MarketListingStatus } from "@/lib/contracts/marketListing";
import { canPublishNews } from "@/lib/contracts/news";
import type { PublishingRole } from "@/lib/contracts/publishing";
import { mapProfileDto, type ProfileDto } from "@/lib/contracts/profile";
import { mapListingDtos, mapListingsToMapMarkers, type ListingDto, type ListingMapMarker } from "@/lib/contracts/listing";
import type { ProfileModel } from "@/lib/contracts/profile";
import type { AuthUserModel } from "@/lib/contracts/auth";

const SPONSORED_LIMITS = {
  maxSponsoredShare: 0.25,
  windowSize: 4,
  maxPerWindow: 1,
} as const;

function sortSponsoredForDeterminism(items: ListingListItem[]): ListingListItem[] {
  return [...items].sort((a, b) => {
    const aWeight = typeof a.sponsored_weight === "number" ? a.sponsored_weight : 0;
    const bWeight = typeof b.sponsored_weight === "number" ? b.sponsored_weight : 0;
    if (aWeight !== bWeight) {
      return bWeight - aWeight;
    }
    return a.id.localeCompare(b.id);
  });
}

function mergeListingsWithSponsoredCaps(listings: ListingListItem[]): ListingListItem[] {
  const sponsored = sortSponsoredForDeterminism(listings.filter((listing) => listing.is_sponsored === true));
  const organic = listings.filter((listing) => listing.is_sponsored !== true);
  const cappedSponsoredCount = Math.min(
    sponsored.length,
    Math.floor(listings.length * SPONSORED_LIMITS.maxSponsoredShare),
  );
  const maxSponsoredCount = sponsored.length > 0 ? Math.max(1, cappedSponsoredCount) : 0;

  if (maxSponsoredCount <= 0 || sponsored.length === 0) {
    return organic;
  }

  const output: ListingListItem[] = [];
  let organicIndex = 0;
  let sponsoredIndex = 0;

  const canInsertSponsored = () => {
    if (sponsoredIndex >= maxSponsoredCount) return false;
    const recentWindow = output.slice(-(SPONSORED_LIMITS.windowSize - 1));
    const sponsoredInWindow = recentWindow.filter((item) => item.is_sponsored === true).length;
    return sponsoredInWindow < SPONSORED_LIMITS.maxPerWindow;
  };

  while (organicIndex < organic.length || sponsoredIndex < maxSponsoredCount) {
    const isWindowBoundary = (output.length + 1) % SPONSORED_LIMITS.windowSize === 0;
    if (isWindowBoundary && canInsertSponsored()) {
      output.push(sponsored[sponsoredIndex]);
      sponsoredIndex += 1;
      continue;
    }

    if (organicIndex < organic.length) {
      output.push(organic[organicIndex]);
      organicIndex += 1;
      continue;
    }

    if (canInsertSponsored()) {
      output.push(sponsored[sponsoredIndex]);
      sponsoredIndex += 1;
      continue;
    }

    break;
  }

  // Never return an empty list for non-empty inputs.
  if (output.length === 0 && sponsored.length > 0) {
    return sponsored.slice(0, 1);
  }

  return output;
}

export function adaptListingsForSearch(dtos: ListingDto[] | null | undefined): ListingListItem[] {
  if (!Array.isArray(dtos) || dtos.length === 0) {
    return [];
  }

  const mapped = mapListingDtos(dtos).map((listing, index) => ({
    ...listing,
    is_sponsored: dtos[index]?.is_sponsored === true,
    sponsored_weight:
      typeof dtos[index]?.sponsored_weight === "number" ? dtos[index]?.sponsored_weight : null,
  }));

  return mergeListingsWithSponsoredCaps(mapped);
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

export function adaptNewsPublishPermission(role: PublishingRole): boolean {
  return canPublishNews(role);
}

export function adaptMarketListingSubmitStatus(role: PublishingRole): MarketListingStatus {
  return nextStatusForSubmit(role);
}
