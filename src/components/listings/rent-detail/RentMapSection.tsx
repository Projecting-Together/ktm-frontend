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
  const mapStateText = hasCoordinates ? "Map preview ready" : "Map unavailable";
  const mapDescription = hasCoordinates
    ? `${mapStateText}: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
    : `${mapStateText}: ${MISSING_DETAIL_TEXT}.`;

  return (
    <RentSectionCard title="Location">
      <div
        data-testid="rent-map-panel"
        className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground"
      >
        <p data-testid="rent-map-panel-state" className="font-medium text-foreground">
          {mapStateText}
        </p>
        {hasCoordinates ? (
          <p>
            {mapDescription}
          </p>
        ) : (
          <p>{mapDescription}</p>
        )}
        <p className="mt-1 text-xs">Coordinates source: listing location</p>
      </div>
    </RentSectionCard>
  );
}
