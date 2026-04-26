import type { Listing } from "@/lib/api/types";

import { RentSectionCard } from "./RentSectionCard";
import { MISSING_DETAIL_TEXT } from "./types";

interface RentFloorPlanSectionProps {
  listing: Listing;
}

export function RentFloorPlanSection({ listing }: RentFloorPlanSectionProps) {
  const hasImages = (listing.images ?? []).length > 0;

  return (
    <RentSectionCard title="Floor Plan">
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        {hasImages ? (
          <p>Floor plan image is not provided separately for this listing.</p>
        ) : (
          <p>{MISSING_DETAIL_TEXT}</p>
        )}
      </div>
    </RentSectionCard>
  );
}
