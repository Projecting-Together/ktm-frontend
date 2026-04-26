import {
  toRentDetailRows,
  toSqmLabel,
  toUnitUtilityRows,
  toUtilityRows,
} from "@/components/listings/rent-detail/rentDetailMappers";
import { MISSING_DETAIL_TEXT } from "@/components/listings/rent-detail/types";
import type { Listing } from "@/lib/api/types";
import {
  buildRentListingFull,
  buildRentListingSparse,
  buildRentListingMixed,
  buildRentListingPremium,
  buildRentListingMinimal,
} from "@/test-utils/mockData";

describe("rent detail mappers", () => {
  it("supports all required mock listing variants", () => {
    const variants = [
      buildRentListingFull(),
      buildRentListingSparse(),
      buildRentListingMixed(),
      buildRentListingPremium(),
      buildRentListingMinimal(),
    ];

    expect(variants).toHaveLength(5);
    expect(new Set(variants.map((variant) => variant.id)).size).toBe(5);
    expect(variants.every((variant) => variant.purpose === "rent")).toBe(true);
  });

  it("maps known utility values and keeps unresolved rows", () => {
    const full = {
      ...buildRentListingMixed(),
      amenities: [
        { code: " WATER_TANK " },
        { code: "gas_pipeline" },
      ],
    } as Listing;
    const sparse = buildRentListingSparse();

    const fullRows = toUtilityRows(full);
    const sparseRows = toUtilityRows(sparse);

    expect(fullRows).toEqual([
      { label: "Water", status: "Available", tone: "positive" },
      { label: "Gas", status: "Available", tone: "positive" },
      { label: "Electricity", status: MISSING_DETAIL_TEXT, tone: "warning" },
      { label: "Garbage", status: MISSING_DETAIL_TEXT, tone: "warning" },
    ]);

    expect(sparseRows).toEqual([
      { label: "Water", status: MISSING_DETAIL_TEXT, tone: "warning" },
      { label: "Gas", status: MISSING_DETAIL_TEXT, tone: "warning" },
      { label: "Electricity", status: MISSING_DETAIL_TEXT, tone: "warning" },
      { label: "Garbage", status: MISSING_DETAIL_TEXT, tone: "warning" },
    ]);
  });

  it("formats m2 helper", () => {
    expect(toSqmLabel(1000)).toBe("1000.0 m²");
    expect(toSqmLabel(undefined)).toBe(MISSING_DETAIL_TEXT);
    expect(toRentDetailRows(buildRentListingSparse()).length).toBeGreaterThan(0);
  });

  it("infers unit utilities from amenity code or name with fallback", () => {
    const inferredListing = {
      ...buildRentListingSparse(),
      furnishing: "fully",
      amenities: [
        { id: "am-unit-1", name: "Wi Fi", code: null },
        { id: "am-unit-2", name: "Balcony", code: "balcony" },
        { id: "am-unit-3", name: "Air Conditioning", code: null },
        { id: "am-unit-4", name: "Room Heater", code: null },
      ],
    } as Listing;
    const fallbackListing = buildRentListingSparse();

    expect(toUnitUtilityRows(inferredListing)).toEqual([
      { label: "Wi-Fi", status: "Included", tone: "positive" },
      { label: "Furnishing", status: "fully", tone: "neutral" },
      { label: "Balcony", status: "Included", tone: "positive" },
      { label: "Air Conditioning", status: "Included", tone: "positive" },
      { label: "Heating", status: "Included", tone: "positive" },
    ]);

    expect(toUnitUtilityRows(fallbackListing)).toEqual([
      { label: "Wi-Fi", status: MISSING_DETAIL_TEXT, tone: "warning" },
      { label: "Furnishing", status: MISSING_DETAIL_TEXT, tone: "warning" },
      { label: "Balcony", status: MISSING_DETAIL_TEXT, tone: "warning" },
      { label: "Air Conditioning", status: MISSING_DETAIL_TEXT, tone: "warning" },
      { label: "Heating", status: MISSING_DETAIL_TEXT, tone: "warning" },
    ]);
  });

  it("maps full and sparse rent detail rows deterministically", () => {
    const fullRows = toRentDetailRows({
      ...buildRentListingPremium(),
      bedrooms: 2,
      bathrooms: 1,
      area_m2: 1200,
      furnishing: "Semi Furnished",
      floor: 3,
      total_floors: 5,
      parking: false,
      pets_allowed: false,
      smoking_allowed: null,
      available_from: null,
    });
    const sparseRows = toRentDetailRows(buildRentListingSparse());

    expect(fullRows).toEqual([
      { key: "Bedrooms", value: "2" },
      { key: "Bathrooms", value: "1" },
      { key: "Area", value: "1200.0 m²" },
      { key: "Furnishing", value: "Semi Furnished" },
      { key: "Floor", value: "3 of 5" },
      { key: "Parking", value: "Not available" },
      { key: "Pets", value: "Not available" },
      { key: "Smoking", value: MISSING_DETAIL_TEXT },
      { key: "Available From", value: MISSING_DETAIL_TEXT },
    ]);

    expect(sparseRows).toEqual([
      { key: "Bedrooms", value: MISSING_DETAIL_TEXT },
      { key: "Bathrooms", value: MISSING_DETAIL_TEXT },
      { key: "Area", value: MISSING_DETAIL_TEXT },
      { key: "Furnishing", value: MISSING_DETAIL_TEXT },
      { key: "Floor", value: MISSING_DETAIL_TEXT },
      { key: "Parking", value: MISSING_DETAIL_TEXT },
      { key: "Pets", value: MISSING_DETAIL_TEXT },
      { key: "Smoking", value: MISSING_DETAIL_TEXT },
      { key: "Available From", value: MISSING_DETAIL_TEXT },
    ]);
  });

  it("handles floor edge cases with explicit fallback behavior", () => {
    const base = buildRentListingFull();

    expect(toRentDetailRows({ ...base, floor: 5, total_floors: 2 }).find((row) => row.key === "Floor")?.value).toBe("5");
    expect(toRentDetailRows({ ...base, floor: 3, total_floors: 7 }).find((row) => row.key === "Floor")?.value).toBe(
      "3 of 7",
    );
    expect(toRentDetailRows({ ...base, floor: 4, total_floors: 0 }).find((row) => row.key === "Floor")?.value).toBe("4");
    expect(toRentDetailRows({ ...base, floor: 0, total_floors: 9 }).find((row) => row.key === "Floor")?.value).toBe(
      MISSING_DETAIL_TEXT,
    );
    expect(toRentDetailRows({ ...base, floor: null, total_floors: 10 }).find((row) => row.key === "Floor")?.value).toBe(
      MISSING_DETAIL_TEXT,
    );
  });
});
