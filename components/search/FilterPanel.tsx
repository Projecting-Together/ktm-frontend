"use client";

import { SlidersHorizontal, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilterStore } from "@/lib/stores/filterStore";
import { useAmenities } from "@/lib/hooks/useNeighborhoods";

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
  const { data: amenities = [] } = useAmenities();

  const buildingAmenities = amenities.filter((a) => a.amenity_type === "building");

  const activeTypes = (store.listing_type ?? "").split(",").filter(Boolean);
  const activeAmenities = store.amenities ?? [];

  const activeFilterCount = [
    activeTypes.length > 0,
    store.min_price != null,
    store.max_price != null,
    store.bedrooms != null,
    store.bathrooms != null,
    store.furnishing != null,
    store.parking,
    store.pets_allowed,
    store.verified,
    activeAmenities.length > 0,
  ].filter(Boolean).length;

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
        <input
          type="range"
          aria-label="Price range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={store.max_price ?? PRICE_MAX}
          onChange={(e) => store.setPriceRange(store.min_price, Number(e.target.value))}
          className="mb-3 w-full accent-accent"
        />
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
          {FURNISHING_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2.5">
              <input
                type="radio"
                name="furnishing"
                value={opt.value}
                checked={store.furnishing === opt.value}
                onChange={() => store.setFilter("furnishing", store.furnishing === opt.value ? undefined : opt.value)}
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

      {/* Building Amenities */}
      {buildingAmenities.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Building Amenities
          </p>
          <div className="flex flex-wrap gap-2">
            {buildingAmenities.map((a) => (
              <button
                key={a.id}
                onClick={() => store.toggleAmenity(a.code ?? a.id)}
                className={cn(
                  "filter-chip",
                  activeAmenities.includes(a.code ?? a.id) && "filter-chip-active"
                )}
              >
                {a.icon && <span>{a.icon}</span>}
                {a.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Available From */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Available From
        </p>
        <input
          type="date"
          value={store.available_from ?? ""}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => store.setFilter("available_from", e.target.value || undefined)}
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
    </aside>
  );
}
