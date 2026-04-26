import type { Listing } from "@/lib/api/types";

import { RentStatusChips } from "./RentStatusChips";
import { RentSectionCard } from "./RentSectionCard";
import { MISSING_DETAIL_TEXT, type RentStatusRow } from "./types";

interface RentUnitUtilitiesSectionProps {
  listing: Listing;
}

function toUnitUtilityRows(listing: Listing): RentStatusRow[] {
  const amenityCodes = new Set(
    (listing.amenities ?? [])
      .map((amenity) => amenity.code?.trim().toLowerCase())
      .filter((code): code is string => Boolean(code)),
  );

  const furnishedStatus = listing.furnishing ? String(listing.furnishing) : MISSING_DETAIL_TEXT;

  return [
    {
      label: "Wi-Fi",
      status: amenityCodes.has("wifi") ? "Included" : MISSING_DETAIL_TEXT,
      tone: amenityCodes.has("wifi") ? "positive" : "warning",
    },
    {
      label: "Furnishing",
      status: furnishedStatus,
      tone: furnishedStatus === MISSING_DETAIL_TEXT ? "warning" : "neutral",
    },
    {
      label: "Balcony",
      status: MISSING_DETAIL_TEXT,
      tone: "warning",
    },
    {
      label: "Air Conditioning",
      status: MISSING_DETAIL_TEXT,
      tone: "warning",
    },
  ];
}

export function RentUnitUtilitiesSection({ listing }: RentUnitUtilitiesSectionProps) {
  const rows = toUnitUtilityRows(listing);

  return (
    <RentSectionCard title="Unit Utilities">
      <RentStatusChips rows={rows} />
    </RentSectionCard>
  );
}
