import type { Listing } from "@/lib/api/types";

import { RentSectionCard } from "./RentSectionCard";
import { MISSING_DETAIL_TEXT } from "./types";

interface RentShortDescriptionSectionProps {
  listing: Listing;
}

export function RentShortDescriptionSection({ listing }: RentShortDescriptionSectionProps) {
  return (
    <RentSectionCard title="Description">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
        {listing.description?.trim() || MISSING_DETAIL_TEXT}
      </p>
    </RentSectionCard>
  );
}
