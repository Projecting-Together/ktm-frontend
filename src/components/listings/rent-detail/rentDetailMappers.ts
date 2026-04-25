import type { Listing } from "@/lib/api/types";

import { MISSING_DETAIL_TEXT, type RentDetailRow, type RentStatusRow } from "./types";

const SQFT_TO_SQM_FACTOR = 0.092903;

function toPositiveFiniteNumber(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

function getAmenityCodes(listing: Listing): Set<string> {
  return new Set(
    (listing.amenities ?? [])
      .map((amenity) => amenity.code?.trim().toLowerCase())
      .filter((code): code is string => Boolean(code)),
  );
}

function toBinaryStatus(
  provided: boolean | null | undefined,
  providedLabel: string,
  missingLabel = MISSING_DETAIL_TEXT,
): string {
  if (provided == null) {
    return missingLabel;
  }

  return provided ? providedLabel : "Not available";
}

export function toSqmLabel(areaSqft?: number | null): string {
  if (areaSqft == null || !Number.isFinite(areaSqft) || areaSqft <= 0) {
    return MISSING_DETAIL_TEXT;
  }

  const sqm = Math.round(areaSqft * SQFT_TO_SQM_FACTOR * 10) / 10;
  return `${sqm.toFixed(1)} m²`;
}

export function toUtilityRows(listing: Listing): RentStatusRow[] {
  const amenityCodes = getAmenityCodes(listing);

  const rows: Array<Omit<RentStatusRow, "tone">> = [
    {
      label: "Water",
      status: amenityCodes.has("water_tank") ? "Available" : MISSING_DETAIL_TEXT,
    },
    {
      label: "Gas",
      status: amenityCodes.has("gas_pipeline") ? "Available" : MISSING_DETAIL_TEXT,
    },
    {
      label: "Electricity",
      status: amenityCodes.has("backup_power") ? "Backup power" : MISSING_DETAIL_TEXT,
    },
    {
      label: "Garbage",
      status: amenityCodes.has("garbage_collection") ? "Collection available" : MISSING_DETAIL_TEXT,
    },
  ];

  return rows.map((row) => ({
    ...row,
    tone: row.status === MISSING_DETAIL_TEXT ? "warning" : "positive",
  }));
}

export function toRentDetailRows(listing: Listing): RentDetailRow[] {
  const areaSqftLabel =
    listing.area_sqft != null && Number.isFinite(listing.area_sqft) && listing.area_sqft > 0
      ? `${listing.area_sqft} sqft (${toSqmLabel(listing.area_sqft)})`
      : MISSING_DETAIL_TEXT;

  const floor = toPositiveFiniteNumber(listing.floor);
  const totalFloors = toPositiveFiniteNumber(listing.total_floors);
  const floorLabel =
    floor != null
      ? totalFloors != null && totalFloors >= floor
        ? `${floor} of ${totalFloors}`
        : String(floor)
      : MISSING_DETAIL_TEXT;

  return [
    { key: "Bedrooms", value: listing.bedrooms != null ? String(listing.bedrooms) : MISSING_DETAIL_TEXT },
    { key: "Bathrooms", value: listing.bathrooms != null ? String(listing.bathrooms) : MISSING_DETAIL_TEXT },
    { key: "Area", value: areaSqftLabel },
    { key: "Furnishing", value: listing.furnishing ?? MISSING_DETAIL_TEXT },
    { key: "Floor", value: floorLabel },
    { key: "Parking", value: toBinaryStatus(listing.parking, "Available") },
    { key: "Pets", value: toBinaryStatus(listing.pets_allowed, "Allowed") },
    { key: "Smoking", value: toBinaryStatus(listing.smoking_allowed, "Allowed") },
    { key: "Available From", value: listing.available_from ?? MISSING_DETAIL_TEXT },
  ];
}
