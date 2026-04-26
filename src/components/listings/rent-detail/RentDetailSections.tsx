import type { Listing } from "@/lib/api/types";

import { RentBuildingAmenitiesSection } from "./RentBuildingAmenitiesSection";
import { RentDetailsTableSection } from "./RentDetailsTableSection";
import { RentFloorPlanSection } from "./RentFloorPlanSection";
import { RentMapSection } from "./RentMapSection";
import { RentShortDescriptionSection } from "./RentShortDescriptionSection";
import { RentUnitUtilitiesSection } from "./RentUnitUtilitiesSection";
import { RentUtilitiesSection } from "./RentUtilitiesSection";

interface RentDetailSectionsProps {
  listing: Listing;
}

export function RentDetailSections({ listing }: RentDetailSectionsProps) {
  return (
    <div className="mt-8 space-y-5">
      <RentShortDescriptionSection listing={listing} />
      <RentUtilitiesSection listing={listing} />
      <RentBuildingAmenitiesSection listing={listing} />
      <RentUnitUtilitiesSection listing={listing} />
      <RentFloorPlanSection listing={listing} />
      <RentDetailsTableSection listing={listing} />
      <RentMapSection listing={listing} />
    </div>
  );
}
