import {
  toRentDetailRows,
  toSqmLabel,
  toUtilityRows,
} from "@/components/listings/rent-detail/rentDetailMappers";
import { MISSING_DETAIL_TEXT } from "@/components/listings/rent-detail/types";
import type { Listing } from "@/lib/api/types";
import { mockListings } from "@/test-utils/mockData";

function buildRentListingFull(): Listing {
  const listing = mockListings.find((item) => item.purpose === "rent");
  if (!listing) {
    throw new Error("Expected at least one rent listing in mockListings");
  }

  return listing;
}

function buildRentListingSparse(): Listing {
  const base = buildRentListingFull();
  return {
    ...base,
    amenities: [],
    bedrooms: null,
    bathrooms: null,
    area_sqft: null,
    furnishing: null,
    floor: null,
    total_floors: null,
    parking: null,
    pets_allowed: null,
    smoking_allowed: null,
    available_from: null,
  };
}

describe("rent detail mappers", () => {
  it("maps known utility values and keeps unresolved rows", () => {
    const full = buildRentListingFull();
    const sparse = buildRentListingSparse();

    const fullRows = toUtilityRows(full);
    const sparseRows = toUtilityRows(sparse);

    expect(fullRows.find((row) => row.label === "Water")?.status).toBeTruthy();
    expect(sparseRows.every((row) => row.status.length > 0)).toBe(true);
    expect(sparseRows.every((row) => row.status === MISSING_DETAIL_TEXT)).toBe(true);
  });

  it("formats sqft and sqm helper", () => {
    expect(toSqmLabel(1000)).toBe("92.9 m²");
    expect(toSqmLabel(undefined)).toBe(MISSING_DETAIL_TEXT);
    expect(toRentDetailRows(buildRentListingSparse()).length).toBeGreaterThan(0);
  });

  it("maps full and sparse rent detail rows deterministically", () => {
    const fullRows = toRentDetailRows(buildRentListingFull());
    const sparseRows = toRentDetailRows(buildRentListingSparse());

    expect(fullRows.find((row) => row.key === "Bedrooms")?.value).not.toBe(MISSING_DETAIL_TEXT);
    expect(fullRows.find((row) => row.key === "Area")?.value).toContain("sqft");
    expect(sparseRows.every((row) => row.value.length > 0)).toBe(true);
    expect(sparseRows.find((row) => row.key === "Area")?.value).toBe(MISSING_DETAIL_TEXT);
  });
});
