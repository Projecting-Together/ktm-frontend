/** Search results ordering; `value` is API-shaped (`sort_by:sort_order`). */
export const SORT_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "created_at:desc", label: "Newest first" },
  { value: "price:asc", label: "Price: low to high" },
  { value: "price:desc", label: "Price: high to low" },
  { value: "area_m2:desc", label: "Largest first" },
];

/** Shown while the dynamic map chunk loads in search. */
export const SEARCH_MAP_LOADING_MESSAGE = "Loading map…";
