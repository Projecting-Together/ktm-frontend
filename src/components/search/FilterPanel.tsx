"use client";

import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilterStore } from "@/lib/stores/filterStore";

const LISTING_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "room", label: "Room" },
  { value: "house", label: "House" },
  { value: "studio", label: "Studio" },
  { value: "commercial", label: "Commercial" },
];

const BEDROOM_OPTIONS = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4+" },
];
const BATHROOM_OPTIONS = BEDROOM_OPTIONS;

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

export function FilterPanel({ mode = "sidebar" }: FilterPanelProps) {
  const store = useFilterStore();
  const parseAreaValue = (raw: string): number | undefined => {
    if (!raw) return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const activeTypes = (store.listing_type ?? "").split(",").filter(Boolean);
  const activeAmenities = store.amenities ?? [];

  const activeFilterCount = [
    activeTypes.length > 0,
    store.neighborhood_slug != null && store.neighborhood_slug !== "",
    store.min_price != null,
    store.max_price != null,
    store.min_area_m2 != null,
    store.max_area_m2 != null,
    store.bedrooms != null,
    store.bathrooms != null,
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

  return (
    <aside
      className={cn(
        "flex flex-col gap-5 bg-card",
        mode === "sidebar" && "sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl border border-border p-5",
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
              onClick={() => store.toggleListingType(type.value as never)}
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

      {/* Neighborhood */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Neighborhood
        </p>
        <input
          type="text"
          aria-label="Neighborhood slug"
          placeholder="e.g. baneshwor"
          value={store.neighborhood_slug ?? ""}
          onChange={(e) => {
            const value = e.target.value.trim().toLowerCase();
            store.setFilter("neighborhood_slug", value || undefined);
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
            placeholder="Min m²"
            step="0.1"
            value={store.min_area_m2 ?? ""}
            onChange={(e) => store.setAreaRange(parseAreaValue(e.target.value), store.max_area_m2)}
            className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <span className="text-muted-foreground">—</span>
          <input
            type="number"
            aria-label="Maximum area in m2"
            placeholder="Max m²"
            step="0.1"
            value={store.max_area_m2 ?? ""}
            onChange={(e) => store.setAreaRange(store.min_area_m2, parseAreaValue(e.target.value))}
            className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Bedrooms
        </p>
        <div className="flex gap-2">
          {BEDROOM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => store.setFilter("bedrooms", store.bedrooms === opt.value ? undefined : opt.value)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border border-border text-sm font-medium transition-colors hover:border-accent hover:text-accent",
                store.bedrooms === opt.value && "border-accent bg-accent/10 text-accent"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Bathrooms
        </p>
        <div className="flex gap-2">
          {BATHROOM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => store.setFilter("bathrooms", store.bathrooms === opt.value ? undefined : opt.value)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border border-border text-sm font-medium transition-colors hover:border-accent hover:text-accent",
                store.bathrooms === opt.value && "border-accent bg-accent/10 text-accent"
              )}
            >
              {opt.label}
            </button>
          ))}
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
          {[
            { key: "parking" as const, label: "Parking available" },
            { key: "pets_allowed" as const, label: "Pet-friendly" },
            { key: "verified" as const, label: "Verified listings only" },
          ].map(({ key, label }) => (
            <label key={key} className="flex cursor-pointer items-center justify-between">
              <span className="text-sm">{label}</span>
              <button
                role="switch"
                data-testid={`toggle-${key}`}
                aria-label={label}
                aria-checked={!!store[key]}
                onClick={() => store.setFilter(key, !store[key] || undefined)}
                className={cn(
                  "relative h-5 w-9 rounded-full transition-colors",
                  store[key] ? "bg-accent" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                    store[key] ? "translate-x-4" : "translate-x-0.5"
                  )}
                />
              </button>
            </label>
          ))}
        </div>
      </div>

    </aside>
  );
}
