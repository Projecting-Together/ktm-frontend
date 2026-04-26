import type { Listing } from "@/lib/api/types";

import { RentDetailsTable } from "./RentDetailsTable";
import { RentSectionCard } from "./RentSectionCard";
import { toRentDetailRows } from "./rentDetailMappers";

interface RentDetailsTableSectionProps {
  listing: Listing;
}

export function RentDetailsTableSection({ listing }: RentDetailsTableSectionProps) {
  const rows = toRentDetailRows(listing);

  return (
    <RentSectionCard title="Property Details">
      <RentDetailsTable rows={rows} />
    </RentSectionCard>
  );
}
