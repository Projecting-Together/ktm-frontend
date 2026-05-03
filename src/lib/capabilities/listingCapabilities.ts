/**
 * Active listing limits for the **member** account (`user` role).
 * `admin` bypasses caps for moderation workflows.
 *
 * Upgrade-to-agent / owner-vs-renter personas are **not** modeled here — listing limits are
 * expressed by caps (and future tier/subscription fields). `requiresAgentUpgrade` stays on the
 * result shape for backward compatibility but is always `false`.
 */

import type { UserRole } from "@/lib/api/types";

const FREE_LISTING_CAP = 2;

export interface ListingCapabilitiesInput {
  role: UserRole;
  activeListingCount: number;
}

export interface ListingCapabilities {
  activeListingCount: number;
  canCreateWithoutUpgrade: boolean;
  /** Deprecated: always `false`; retained for older call sites. */
  requiresAgentUpgrade: boolean;
}

export function resolveListingCapabilities(input: ListingCapabilitiesInput): ListingCapabilities {
  const activeListingCount =
    Number.isFinite(input.activeListingCount) && input.activeListingCount >= 0
      ? input.activeListingCount
      : 0;

  const belowFreeCap = activeListingCount < FREE_LISTING_CAP;
  const isAdmin = input.role === "admin";
  const isMember = input.role === "user";

  const canCreateWithoutUpgrade = isAdmin || (isMember && belowFreeCap);

  return {
    activeListingCount,
    canCreateWithoutUpgrade,
    requiresAgentUpgrade: false,
  };
}
