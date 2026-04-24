import type { UserRole } from "@/lib/api/types";

const FREE_LISTING_CAP = 2;

export interface ListingCapabilitiesInput {
  role: UserRole;
  activeListingCount: number;
}

export interface ListingCapabilities {
  activeListingCount: number;
  canCreateWithoutUpgrade: boolean;
  requiresAgentUpgrade: boolean;
}

export function resolveListingCapabilities(input: ListingCapabilitiesInput): ListingCapabilities {
  const activeListingCount =
    Number.isFinite(input.activeListingCount) && input.activeListingCount >= 0
      ? input.activeListingCount
      : 0;
  const hasFreeCap = activeListingCount < FREE_LISTING_CAP;
  const isLimitedRole = input.role === "renter" || input.role === "owner";
  const canCreateWithoutUpgrade = isLimitedRole ? hasFreeCap : true;

  return {
    activeListingCount,
    canCreateWithoutUpgrade,
    requiresAgentUpgrade: isLimitedRole && !hasFreeCap,
  };
}
