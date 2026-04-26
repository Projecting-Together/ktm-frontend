import type { Listing } from "@/lib/api/types";

import { MISSING_DETAIL_TEXT, type RentDetailRow, type RentStatusRow } from "./types";

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

function normalizeAmenityToken(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || null;
}

function getAmenitySignals(listing: Listing): Set<string> {
  const signals = new Set<string>();

  for (const amenity of listing.amenities ?? []) {
    const code = normalizeAmenityToken(amenity.code);
    if (code) {
      signals.add(code);
    }

    const name = normalizeAmenityToken(amenity.name);
    if (name) {
      signals.add(name);
    }
  }

  return signals;
}

function hasAnyAmenityCode(amenityCodes: Set<string>, codes: string[]): boolean {
  return codes.some((code) => amenityCodes.has(code));
}

function hasAnyAmenitySignal(amenitySignals: Set<string>, values: string[]): boolean {
  return values.some((value) => {
    const normalizedValue = normalizeAmenityToken(value);
    return normalizedValue ? amenitySignals.has(normalizedValue) : false;
  });
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

export function toSqmLabel(areaM2?: number | null): string {
  if (areaM2 == null || !Number.isFinite(areaM2) || areaM2 <= 0) {
    return MISSING_DETAIL_TEXT;
  }

  return `${areaM2.toFixed(1)} m²`;
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

export function toUnitUtilityRows(listing: Listing): RentStatusRow[] {
  const amenitySignals = getAmenitySignals(listing);
  const hasWifi = hasAnyAmenitySignal(amenitySignals, ["wifi", "wi fi", "wi-fi"]);
  const hasBalcony = hasAnyAmenitySignal(amenitySignals, ["balcony", "terrace", "balcony terrace"]);
  const hasAirConditioning = hasAnyAmenitySignal(amenitySignals, ["ac", "a c", "air conditioning"]);
  const hasHeating = hasAnyAmenitySignal(amenitySignals, ["heating", "heater", "room heater"]);
  const furnishingStatus = listing.furnishing ? String(listing.furnishing) : MISSING_DETAIL_TEXT;

  return [
    {
      label: "Wi-Fi",
      status: hasWifi ? "Included" : MISSING_DETAIL_TEXT,
      tone: hasWifi ? "positive" : "warning",
    },
    {
      label: "Furnishing",
      status: furnishingStatus,
      tone: furnishingStatus === MISSING_DETAIL_TEXT ? "warning" : "neutral",
    },
    {
      label: "Balcony",
      status: hasBalcony ? "Included" : MISSING_DETAIL_TEXT,
      tone: hasBalcony ? "positive" : "warning",
    },
    {
      label: "Air Conditioning",
      status: hasAirConditioning ? "Included" : MISSING_DETAIL_TEXT,
      tone: hasAirConditioning ? "positive" : "warning",
    },
    {
      label: "Heating",
      status: hasHeating ? "Included" : MISSING_DETAIL_TEXT,
      tone: hasHeating ? "positive" : "warning",
    },
  ];
}

export function toRentDetailRows(listing: Listing): RentDetailRow[] {
  const areaM2Label =
    listing.area_m2 != null && Number.isFinite(listing.area_m2) && listing.area_m2 > 0
      ? toSqmLabel(listing.area_m2)
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
    { key: "Area", value: areaM2Label },
    { key: "Furnishing", value: listing.furnishing ?? MISSING_DETAIL_TEXT },
    { key: "Floor", value: floorLabel },
    { key: "Parking", value: toBinaryStatus(listing.parking, "Available") },
    { key: "Pets", value: toBinaryStatus(listing.pets_allowed, "Allowed") },
    { key: "Smoking", value: toBinaryStatus(listing.smoking_allowed, "Allowed") },
    { key: "Available From", value: listing.available_from ?? MISSING_DETAIL_TEXT },
  ];
}
