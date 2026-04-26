import type { Listing } from "@/lib/api/types";

import { RentDetailsTable } from "./RentDetailsTable";
import { RentStatusChips } from "./RentStatusChips";
import { RentSectionCard } from "./RentSectionCard";
import { toUtilityRows } from "./rentDetailMappers";

interface RentUtilitiesSectionProps {
  listing: Listing;
}

export function RentUtilitiesSection({ listing }: RentUtilitiesSectionProps) {
  const statusRows = toUtilityRows(listing);
  const tableRows = statusRows.map((row) => ({ key: row.label, value: row.status }));

  return (
    <RentSectionCard title="Utilities">
      <RentStatusChips rows={statusRows} />
      <RentDetailsTable rows={tableRows} className="mt-2" />
    </RentSectionCard>
  );
}
