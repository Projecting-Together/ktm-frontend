import type { Listing } from "@/lib/api/types";

import { RentStatusChips } from "./RentStatusChips";
import { RentSectionCard } from "./RentSectionCard";
import { toUtilityRows } from "./rentDetailMappers";

interface RentUtilitiesSectionProps {
  listing: Listing;
}

export function RentUtilitiesSection({ listing }: RentUtilitiesSectionProps) {
  const rows = toUtilityRows(listing);

  return (
    <RentSectionCard title="Utilities">
      <RentStatusChips rows={rows} />
    </RentSectionCard>
  );
}
