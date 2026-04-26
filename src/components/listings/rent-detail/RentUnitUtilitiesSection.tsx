import type { Listing } from "@/lib/api/types";

import { toUnitUtilityRows } from "./rentDetailMappers";
import { RentDetailsTable } from "./RentDetailsTable";
import { RentStatusChips } from "./RentStatusChips";
import { RentSectionCard } from "./RentSectionCard";
import type { RentStatusRow } from "./types";

interface RentUnitUtilitiesSectionProps {
  listing: Listing;
}

export function RentUnitUtilitiesSection({ listing }: RentUnitUtilitiesSectionProps) {
  const statusRows: RentStatusRow[] = toUnitUtilityRows(listing);
  const tableRows = statusRows.map((row) => ({ key: row.label, value: row.status }));

  return (
    <RentSectionCard title="Unit Utilities">
      <RentStatusChips rows={statusRows} />
      <RentDetailsTable rows={tableRows} className="mt-2" />
    </RentSectionCard>
  );
}
