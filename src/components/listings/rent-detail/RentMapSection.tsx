import type { Listing } from "@/lib/api/types";

import { RentSectionCard } from "./RentSectionCard";
import { MISSING_DETAIL_TEXT } from "./types";

interface RentMapSectionProps {
  listing: Listing;
}

function toCoordinate(value: string | number | null | undefined): number | null {
  if (value == null) {
    return null;
  }

  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function RentMapSection({ listing }: RentMapSectionProps) {
  const latitude = toCoordinate(listing.location?.latitude);
  const longitude = toCoordinate(listing.location?.longitude);
  const hasCoordinates = latitude != null && longitude != null;

  return (
    <RentSectionCard title="Location">
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        {hasCoordinates ? (
          <p>
            Map location available at {latitude.toFixed(5)}, {longitude.toFixed(5)}.
          </p>
        ) : (
          <p>{MISSING_DETAIL_TEXT}</p>
        )}
      </div>
    </RentSectionCard>
  );
}
