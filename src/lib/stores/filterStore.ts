"use client";

import { create } from "zustand";
import { LISTING_FILTER_PARAM_KEYS, type ListingFilters, type ListingType } from "@/lib/api/types";

type SearchFilters = ListingFilters;

export interface FilterState extends SearchFilters {
  // UI-only state (not serialized to URL)
  isFilterPanelOpen: boolean;
  view: "grid" | "list" | "map";
}

interface FilterActions {
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setPriceRange: (min?: number, max?: number) => void;
  setAreaRange: (min?: number, max?: number) => void;
  setBedroomRange: (min?: number, max?: number) => void;
  setBathroomRange: (min?: number, max?: number) => void;
  resetFilters: () => void;
  toggleFilterPanel: () => void;
  setView: (view: FilterState["view"]) => void;
  // Helpers
  toggleListingType: (type: ListingType) => void;
  toggleAmenity: (code: string) => void;
}

const DEFAULT_FILTERS: SearchFilters = {
  page: 1,
  limit: 20,
  sort_by: "created_at",
  sort_order: "desc",
  purpose: "rent",
};

function normalizePriceRange(min?: number, max?: number): Pick<SearchFilters, "min_price" | "max_price"> {
  const minPrice = Number.isFinite(min) ? min : undefined;
  const maxPrice = Number.isFinite(max) ? max : undefined;

  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    return { min_price: maxPrice, max_price: minPrice };
  }

  return { min_price: minPrice, max_price: maxPrice };
}

function normalizeAreaRange(min?: number, max?: number): Pick<SearchFilters, "min_area_m2" | "max_area_m2"> {
  const minArea = Number.isFinite(min) ? min : undefined;
  const maxArea = Number.isFinite(max) ? max : undefined;

  if (minArea != null && maxArea != null && minArea > maxArea) {
    return { min_area_m2: maxArea, max_area_m2: minArea };
  }

  return { min_area_m2: minArea, max_area_m2: maxArea };
}

export const BED_MIN = 0;
export const BED_MAX = 8;

function normalizeBedroomRange(min?: number, max?: number): Pick<SearchFilters, "min_bedrooms" | "max_bedrooms"> {
  const lo = Number.isFinite(min) ? Math.max(BED_MIN, Math.min(BED_MAX, Math.round(min!))) : BED_MIN;
  const hi = Number.isFinite(max) ? Math.max(BED_MIN, Math.min(BED_MAX, Math.round(max!))) : BED_MAX;
  const [a, b] = lo <= hi ? [lo, hi] : [hi, lo];
  return {
    min_bedrooms: a <= BED_MIN ? undefined : a,
    max_bedrooms: b >= BED_MAX ? undefined : b,
  };
}

export const BATH_MIN = 0;
export const BATH_MAX = 6;
export const BATH_STEP = 0.5;

function roundHalf(x: number): number {
  return Math.round(x * 2) / 2;
}

function normalizeBathroomRange(min?: number, max?: number): Pick<SearchFilters, "min_bathrooms" | "max_bathrooms"> {
  const lo = Number.isFinite(min)
    ? Math.max(BATH_MIN, Math.min(BATH_MAX, roundHalf(min!)))
    : BATH_MIN;
  const hi = Number.isFinite(max)
    ? Math.max(BATH_MIN, Math.min(BATH_MAX, roundHalf(max!)))
    : BATH_MAX;
  const [a, b] = lo <= hi ? [lo, hi] : [hi, lo];
  return {
    min_bathrooms: a <= BATH_MIN ? undefined : a,
    max_bathrooms: b >= BATH_MAX ? undefined : b,
  };
}

export const useFilterStore = create<FilterState & FilterActions>((set, get) => ({
  ...DEFAULT_FILTERS,
  isFilterPanelOpen: false,
  view: "grid",

  setFilter: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
      page: key === "page" ? (value as SearchFilters["page"]) : 1,
    })),

  setFilters: (filters) =>
    set((state) => {
      const hasExplicitPage = Object.prototype.hasOwnProperty.call(filters, "page");
      const hasMinArea = Object.prototype.hasOwnProperty.call(filters, "min_area_m2");
      const hasMaxArea = Object.prototype.hasOwnProperty.call(filters, "max_area_m2");
      const normalizedAreasWithStateFallback =
        hasMinArea || hasMaxArea
          ? normalizeAreaRange(
              hasMinArea ? filters.min_area_m2 : state.min_area_m2,
              hasMaxArea ? filters.max_area_m2 : state.max_area_m2
            )
          : {};
      const hasMinBed = Object.prototype.hasOwnProperty.call(filters, "min_bedrooms");
      const hasMaxBed = Object.prototype.hasOwnProperty.call(filters, "max_bedrooms");
      const normalizedBeds =
        hasMinBed || hasMaxBed
          ? normalizeBedroomRange(
              hasMinBed ? filters.min_bedrooms : state.min_bedrooms,
              hasMaxBed ? filters.max_bedrooms : state.max_bedrooms
            )
          : {};
      const hasMinBath = Object.prototype.hasOwnProperty.call(filters, "min_bathrooms");
      const hasMaxBath = Object.prototype.hasOwnProperty.call(filters, "max_bathrooms");
      const normalizedBaths =
        hasMinBath || hasMaxBath
          ? normalizeBathroomRange(
              hasMinBath ? filters.min_bathrooms : state.min_bathrooms,
              hasMaxBath ? filters.max_bathrooms : state.max_bathrooms
            )
          : {};
      return {
        ...state,
        ...filters,
        ...normalizedAreasWithStateFallback,
        ...normalizedBeds,
        ...normalizedBaths,
        page: hasExplicitPage ? filters.page : 1,
      };
    }),

  setPriceRange: (min, max) =>
    set((state) => ({
      ...state,
      ...normalizePriceRange(min, max),
      page: 1,
    })),

  setAreaRange: (min, max) =>
    set((state) => ({
      ...state,
      ...normalizeAreaRange(min, max),
      page: 1,
    })),

  setBedroomRange: (min, max) =>
    set((state) => ({
      ...state,
      ...normalizeBedroomRange(min, max),
      page: 1,
    })),

  setBathroomRange: (min, max) =>
    set((state) => ({
      ...state,
      ...normalizeBathroomRange(min, max),
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
      min_price: undefined,
      max_price: undefined,
      city_slug: undefined,
      min_area_m2: undefined,
      max_area_m2: undefined,
      min_bedrooms: undefined,
      max_bedrooms: undefined,
      min_bathrooms: undefined,
      max_bathrooms: undefined,
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
  for (const key of LISTING_FILTER_PARAM_KEYS) {
    const value = state[key];
    if (value !== undefined) {
      (filters as Record<string, unknown>)[key] = value;
    }
  }
  return filters;
}
