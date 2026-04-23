"use client";

import { create } from "zustand";
import type { ListingFilters, FurnishingType, ListingType } from "@/lib/api/types";

export interface FilterState extends ListingFilters {
  // UI-only state (not serialized to URL)
  isFilterPanelOpen: boolean;
  view: "grid" | "list" | "map";
}

interface FilterActions {
  setFilter: <K extends keyof ListingFilters>(key: K, value: ListingFilters[K]) => void;
  setFilters: (filters: Partial<ListingFilters>) => void;
  setPriceRange: (min?: number, max?: number) => void;
  resetFilters: () => void;
  toggleFilterPanel: () => void;
  setView: (view: FilterState["view"]) => void;
  // Helpers
  toggleNeighborhood: (slug: string) => void;
  toggleListingType: (type: ListingType) => void;
  toggleAmenity: (code: string) => void;
}

const DEFAULT_FILTERS: ListingFilters = {
  page: 1,
  limit: 20,
  sort_by: "created_at",
  sort_order: "desc",
};

const API_FILTER_KEYS = [
  "skip",
  "limit",
  "page",
  "listing_type",
  "purpose",
  "city",
  "district",
  "min_price",
  "max_price",
  "bedrooms",
  "bathrooms",
  "furnishing",
  "parking",
  "pets_allowed",
  "verified",
  "available_from",
  "amenities",
  "search",
  "sort_by",
  "sort_order",
  "min_lat",
  "max_lat",
  "min_lng",
  "max_lng",
  "lat",
  "lng",
  "radius_km",
] as const satisfies ReadonlyArray<keyof ListingFilters>;

function normalizePriceRange(min?: number, max?: number): Pick<ListingFilters, "min_price" | "max_price"> {
  const minPrice = Number.isFinite(min) ? min : undefined;
  const maxPrice = Number.isFinite(max) ? max : undefined;

  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    return { min_price: maxPrice, max_price: minPrice };
  }

  return { min_price: minPrice, max_price: maxPrice };
}

export const useFilterStore = create<FilterState & FilterActions>((set, get) => ({
  ...DEFAULT_FILTERS,
  isFilterPanelOpen: false,
  view: "grid",

  setFilter: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
      page: key === "page" ? (value as ListingFilters["page"]) : 1,
    })),

  setFilters: (filters) =>
    set((state) => {
      const hasExplicitPage = Object.prototype.hasOwnProperty.call(filters, "page");
      return {
        ...state,
        ...filters,
        page: hasExplicitPage ? filters.page : 1,
      };
    }),

  setPriceRange: (min, max) =>
    set((state) => ({
      ...state,
      ...normalizePriceRange(min, max),
      page: 1,
    })),

  resetFilters: () =>
    set((state) => ({
      // Restore required defaults
      ...DEFAULT_FILTERS,
      // Preserve UI-only state
      isFilterPanelOpen: state.isFilterPanelOpen,
      view: state.view,
      // Explicitly clear all optional filters (Zustand merges, so we must set to undefined)
      listing_type: undefined,
      neighborhood: undefined,
      min_price: undefined,
      max_price: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      furnishing: undefined,
      parking: undefined,
      pets_allowed: undefined,
      verified: undefined,
      available_from: undefined,
      amenities: undefined,
      keyword: undefined,
      search: undefined,
      min_lat: undefined,
      max_lat: undefined,
      min_lng: undefined,
      max_lng: undefined,
      lat: undefined,
      lng: undefined,
      radius_km: undefined,
    })),

  toggleFilterPanel: () =>
    set((state) => ({ isFilterPanelOpen: !state.isFilterPanelOpen })),

  setView: (view) => set({ view }),

  toggleNeighborhood: (slug) => {
    const current = (get().neighborhood ?? "").split(",").filter(Boolean);
    const next = current.includes(slug)
      ? current.filter((n) => n !== slug)
      : [...current, slug];
    set({ neighborhood: next.join(",") || undefined, page: 1 });
  },

  toggleListingType: (type) => {
    const current = get().listing_type ?? "";
    const types = current.split(",").filter(Boolean);
    const next = types.includes(type)
      ? types.filter((t) => t !== type)
      : [...types, type];
    set({ listing_type: next.join(",") || undefined, page: 1 });
  },

  toggleAmenity: (code) => {
    const current = get().amenities ?? [];
    const next = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code];
    set({ amenities: next.length ? next : undefined, page: 1 });
  },
}));

// Selector: extract only the API-relevant filters (strip UI state)
export function selectApiFilters(state: FilterState): ListingFilters {
  const filters: ListingFilters = {};
  for (const key of API_FILTER_KEYS) {
    const value = state[key];
    if (value !== undefined) {
      (filters as Record<string, unknown>)[key] = value;
    }
  }
  return filters;
}
