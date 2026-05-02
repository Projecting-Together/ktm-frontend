"use client";

import { useState } from "react";
import { SlidersHorizontal, RotateCcw, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useFilterStore,
  BED_MIN,
  BED_MAX,
  BATH_MIN,
  BATH_MAX,
  BATH_STEP,
} from "@/lib/stores/filterStore";
import type { ListingType } from "@/lib/api/types";

const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "room", label: "Room" },
  { value: "house", label: "House" },
  { value: "studio", label: "Studio" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
  { value: "video_shooting", label: "Video Shooting" },
];

const FURNISHING_OPTIONS = [
  { value: "fully", label: "Fully Furnished" },
  { value: "semi", label: "Semi Furnished" },
  { value: "unfurnished", label: "Unfurnished" },
];

const PRICE_MIN = 0;
const PRICE_MAX = 200000;
const PRICE_STEP = 1000;

interface FilterPanelProps {
  mode?: "sidebar" | "drawer";
}

function formatAreaRangeLabel(min?: number, max?: number): string | null {
  if (min == null && max == null) return null;
  const left = min != null ? `${min} m²` : "—";
  const right = max != null ? `${max} m²` : "—";
  return `${left}  –  ${right}`;
}

export function FilterPanel({ mode = "sidebar" }: FilterPanelProps) {
  const store = useFilterStore();
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const parseAreaValue = (raw: string): number | undefined => {
    if (!raw) return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const parseBedValue = (raw: string): number | undefined => {
    if (!raw) return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? Math.round(parsed) : undefined;
  };

  const parseBathValue = (raw: string): number | undefined => {
    if (!raw) return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? Math.round(parsed * 2) / 2 : undefined;
  };

  const activeTypes = (store.listing_type ?? "").split(",").filter(Boolean);
  const activeAmenities = store.amenities ?? [];

  const activeFilterCount = [
    activeTypes.length > 0,
    store.city_slug != null && store.city_slug !== "",
    store.min_price != null,
    store.max_price != null,
    store.min_area_m2 != null,
    store.max_area_m2 != null,
    store.min_bedrooms != null,
    store.max_bedrooms != null,
    store.min_bathrooms != null,
    store.max_bathrooms != null,
    store.furnishing != null,
    store.parking,
    store.pets_allowed,
    store.verified,
    activeAmenities.length > 0,
  ].filter(Boolean).length;

  const minPrice = store.min_price ?? PRICE_MIN;
  const maxPrice = store.max_price ?? PRICE_MAX;
  const minPercent = ((minPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPercent = ((maxPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const minBed = store.min_bedrooms ?? BED_MIN;
  const maxBed = store.max_bedrooms ?? BED_MAX;
  const minBedPercent = ((minBed - BED_MIN) / (BED_MAX - BED_MIN)) * 100;
  const maxBedPercent = ((maxBed - BED_MIN) / (BED_MAX - BED_MIN)) * 100;

  const minBath = store.min_bathrooms ?? BATH_MIN;
  const maxBath = store.max_bathrooms ?? BATH_MAX;
  const minBathPercent = ((minBath - BATH_MIN) / (BATH_MAX - BATH_MIN)) * 100;
  const maxBathPercent = ((maxBath - BATH_MIN) / (BATH_MAX - BATH_MIN)) * 100;

  const areaRangeLabel = formatAreaRangeLabel(store.min_area_m2, store.max_area_m2);

  return (
    <aside
      className={cn(
        "flex flex-col gap-5 bg-card",
        mode === "sidebar" && "rounded-xl border border-border p-5",
        mode === "drawer" && "h-full overflow-y-auto p-5"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={store.resetFilters}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      {/* Home Type */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Home Type
        </p>
        <div className="grid grid-cols-2 gap-2">
          {LISTING_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => store.toggleListingType(type.value)}
              className={cn(
                "rounded-lg border border-border bg-background px-3 py-2 text-left text-sm font-medium transition-colors hover:border-accent hover:bg-accent/5",
                activeTypes.includes(type.value) && "border-accent bg-accent/10 text-accent"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Price Range (NPR/month)
        </p>
        <div className="relative mb-3 h-6">
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
            style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
          />
          <input
            type="range"
            aria-label="Minimum price slider"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={minPrice}
            onChange={(e) => {
              const next = Math.min(Number(e.target.value), maxPrice - PRICE_STEP);
              store.setPriceRange(next, maxPrice);
            }}
            className={cn(
              "pointer-events-none absolute left-0 top-1/2 h-6 w-full -translate-y-1/2 appearance-none bg-transparent",
              "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow",
              "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow"
            )}
          />
          <input
            type="range"
            aria-label="Maximum price slider"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={maxPrice}
            onChange={(e) => {
              const next = Math.max(Number(e.target.value), minPrice + PRICE_STEP);
              store.setPriceRange(minPrice, next);
            }}
            className={cn(
              "pointer-events-none absolute left-0 top-1/2 h-6 w-full -translate-y-1/2 appearance-none bg-transparent",
              "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow",
              "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow"
            )}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            aria-label="Minimum price"
            placeholder="Min"
            value={store.min_price ?? ""}
            onChange={(e) => store.setPriceRange(e.target.value ? Number(e.target.value) : undefined, store.max_price)}
            className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <span className="text-muted-foreground">—</span>
          <input
            type="number"
            aria-label="Maximum price"
            placeholder="Max"
            value={store.max_price ?? ""}
            onChange={(e) => store.setPriceRange(store.min_price, e.target.value ? Number(e.target.value) : undefined)}
            className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* City — store/URL: city_slug; API: mapped to `city` query param */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          City
        </p>
        <input
          type="text"
          aria-label="City filter"
          placeholder="e.g. Kathmandu"
          value={store.city_slug ?? ""}
          onChange={(e) => {
            const value = e.target.value.trim().toLowerCase();
            store.setFilter("city_slug", value || undefined);
          }}
          className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Area (m²) */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Area (m²)
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            aria-label="Minimum area in m2"
            placeholder="Min"
            step="0.1"
            value={store.min_area_m2 ?? ""}
            onChange={(e) => store.setAreaRange(parseAreaValue(e.target.value), store.max_area_m2)}
            className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <span className="text-muted-foreground">—</span>
          <input
            type="number"
            aria-label="Maximum area in m2"
            placeholder="Max"
            step="0.1"
            value={store.max_area_m2 ?? ""}
            onChange={(e) => store.setAreaRange(store.min_area_m2, parseAreaValue(e.target.value))}
            className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        {areaRangeLabel != null && (
          <p
            className="mt-2 text-xs tabular-nums text-muted-foreground"
            data-testid="area-range-summary"
            aria-label={`Area range ${areaRangeLabel}`}
          >
            {areaRangeLabel}
          </p>
        )}
      </div>

      {/* Bedrooms */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Bedrooms
        </p>
        <div className="relative mb-3 h-6">
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
            style={{ left: `${minBedPercent}%`, right: `${100 - maxBedPercent}%` }}
          />
          <input
            type="range"
            aria-label="Minimum bedrooms slider"
            min={BED_MIN}
            max={BED_MAX}
            step={1}
            value={minBed}
            onChange={(e) => {
              const next = Math.min(Number(e.target.value), maxBed);
              store.setBedroomRange(next, maxBed);
            }}
            className={cn(
              "pointer-events-none absolute left-0 top-1/2 h-6 w-full -translate-y-1/2 appearance-none bg-transparent",
              "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow",
              "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow"
            )}
          />
          <input
            type="range"
            aria-label="Maximum bedrooms slider"
            min={BED_MIN}
            max={BED_MAX}
            step={1}
            value={maxBed}
            onChange={(e) => {
              const next = Math.max(Number(e.target.value), minBed);
              store.setBedroomRange(minBed, next);
            }}
            className={cn(
              "pointer-events-none absolute left-0 top-1/2 h-6 w-full -translate-y-1/2 appearance-none bg-transparent",
              "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow",
              "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow"
            )}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            aria-label="Minimum bedrooms"
            placeholder="Min"
            min={BED_MIN}
            max={BED_MAX}
            step={1}
            value={store.min_bedrooms ?? ""}
            onChange={(e) =>
              store.setBedroomRange(parseBedValue(e.target.value), store.max_bedrooms ?? maxBed)
            }
            className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <span className="text-muted-foreground">—</span>
          <input
            type="number"
            aria-label="Maximum bedrooms"
            placeholder="Max"
            min={BED_MIN}
            max={BED_MAX}
            step={1}
            value={store.max_bedrooms ?? ""}
            onChange={(e) =>
              store.setBedroomRange(store.min_bedrooms ?? minBed, parseBedValue(e.target.value))
            }
            className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Bathrooms
        </p>
        <div className="relative mb-3 h-6">
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
            style={{ left: `${minBathPercent}%`, right: `${100 - maxBathPercent}%` }}
          />
          <input
            type="range"
            aria-label="Minimum bathrooms slider"
            min={BATH_MIN}
            max={BATH_MAX}
            step={BATH_STEP}
            value={minBath}
            onChange={(e) => {
              const raw = Number(e.target.value);
              const next = Math.min(raw, maxBath);
              store.setBathroomRange(next, maxBath);
            }}
            className={cn(
              "pointer-events-none absolute left-0 top-1/2 h-6 w-full -translate-y-1/2 appearance-none bg-transparent",
              "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow",
              "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow"
            )}
          />
          <input
            type="range"
            aria-label="Maximum bathrooms slider"
            min={BATH_MIN}
            max={BATH_MAX}
            step={BATH_STEP}
            value={maxBath}
            onChange={(e) => {
              const raw = Number(e.target.value);
              const next = Math.max(raw, minBath);
              store.setBathroomRange(minBath, next);
            }}
            className={cn(
              "pointer-events-none absolute left-0 top-1/2 h-6 w-full -translate-y-1/2 appearance-none bg-transparent",
              "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow",
              "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow"
            )}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            aria-label="Minimum bathrooms"
            placeholder="Min"
            min={BATH_MIN}
            max={BATH_MAX}
            step={BATH_STEP}
            value={store.min_bathrooms ?? ""}
            onChange={(e) =>
              store.setBathroomRange(parseBathValue(e.target.value), store.max_bathrooms ?? maxBath)
            }
            className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <span className="text-muted-foreground">—</span>
          <input
            type="number"
            aria-label="Maximum bathrooms"
            placeholder="Max"
            min={BATH_MIN}
            max={BATH_MAX}
            step={BATH_STEP}
            value={store.max_bathrooms ?? ""}
            onChange={(e) =>
              store.setBathroomRange(store.min_bathrooms ?? minBath, parseBathValue(e.target.value))
            }
            className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Furnishing */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Furnishing
        </p>
        <div className="flex flex-col gap-1.5">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="radio"
              name="furnishing"
              value=""
              checked={store.furnishing == null}
              onChange={() => store.setFilter("furnishing", undefined)}
              className="h-3.5 w-3.5 accent-accent"
            />
            <span className="text-sm">Any Furnishing</span>
          </label>
          {FURNISHING_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2.5">
              <input
                type="radio"
                name="furnishing"
                value={opt.value}
                checked={store.furnishing === opt.value}
                onChange={() => store.setFilter("furnishing", opt.value)}
                className="h-3.5 w-3.5 accent-accent"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Features
        </p>
        <div className="flex flex-col gap-2.5">
          <label className="flex cursor-pointer items-center justify-between">
            <span className="text-sm">Verified listings only</span>
            <button
              type="button"
              role="switch"
              data-testid="toggle-verified"
              aria-label="Verified listings only"
              aria-checked={!!store.verified}
              onClick={() => store.setFilter("verified", !store.verified || undefined)}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                store.verified ? "bg-accent" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                  store.verified ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </button>
          </label>

          <button
            type="button"
            onClick={() => setMoreFiltersOpen((o) => !o)}
            className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-muted/60"
            aria-expanded={moreFiltersOpen}
          >
            More filters
            <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", moreFiltersOpen && "rotate-180")} />
          </button>

          {moreFiltersOpen && (
            <div className="flex flex-col gap-2.5 border-l-2 border-accent/40 pl-3">
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm">Parking available</span>
                <button
                  type="button"
                  role="switch"
                  data-testid="toggle-parking"
                  aria-label="Parking available"
                  aria-checked={!!store.parking}
                  onClick={() => store.setFilter("parking", !store.parking || undefined)}
                  className={cn(
                    "relative h-5 w-9 rounded-full transition-colors",
                    store.parking ? "bg-accent" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                      store.parking ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </button>
              </label>
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm">Pet-friendly</span>
                <button
                  type="button"
                  role="switch"
                  data-testid="toggle-pets_allowed"
                  aria-label="Pet-friendly"
                  aria-checked={!!store.pets_allowed}
                  onClick={() => store.setFilter("pets_allowed", !store.pets_allowed || undefined)}
                  className={cn(
                    "relative h-5 w-9 rounded-full transition-colors",
                    store.pets_allowed ? "bg-accent" : "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                      store.pets_allowed ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </button>
              </label>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
}
