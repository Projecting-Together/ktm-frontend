import type { Listing } from "@/lib/api/types";

import { RentSectionCard } from "./RentSectionCard";
import { MISSING_DETAIL_TEXT } from "./types";

interface RentFloorPlanSectionProps {
  listing: Listing;
}

export function RentFloorPlanSection({ listing: _listing }: RentFloorPlanSectionProps) {
  return (
    <RentSectionCard title="Floor Plan">
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        <p>{MISSING_DETAIL_TEXT}</p>
      </div>
    </RentSectionCard>
  );
}
