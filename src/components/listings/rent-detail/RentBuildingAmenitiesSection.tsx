import type { Listing } from "@/lib/api/types";

import { RentStatusChips } from "./RentStatusChips";
import { RentSectionCard } from "./RentSectionCard";
import { MISSING_DETAIL_TEXT, type RentStatusRow } from "./types";

interface RentBuildingAmenitiesSectionProps {
  listing: Listing;
}

function toBuildingAmenityRows(listing: Listing): RentStatusRow[] {
  const amenityCodes = new Set(
    (listing.amenities ?? [])
      .map((amenity) => amenity.code?.trim().toLowerCase())
      .filter((code): code is string => Boolean(code)),
  );

  const items = [
    { label: "Parking", code: "parking", availableText: "Available" },
    { label: "Gym", code: "gym", availableText: "Available" },
    { label: "Lift", code: "lift", availableText: "Available" },
    { label: "Security", code: "security_guard", availableText: "Guarded" },
  ];

  return items.map((item) => {
    const status = amenityCodes.has(item.code) ? item.availableText : MISSING_DETAIL_TEXT;
    return {
      label: item.label,
      status,
      tone: status === MISSING_DETAIL_TEXT ? "warning" : "positive",
    };
  });
}

export function RentBuildingAmenitiesSection({ listing }: RentBuildingAmenitiesSectionProps) {
  const rows = toBuildingAmenityRows(listing);

  return (
    <RentSectionCard title="Building Amenities">
      <RentStatusChips rows={rows} />
    </RentSectionCard>
  );
}
