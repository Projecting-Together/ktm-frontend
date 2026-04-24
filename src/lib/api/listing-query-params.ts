import type { ListingFilters } from "./types";

/** URLSearchParams for GET /listings/ — safe to import from server and client. */
export function buildListingQueryParams(filters: ListingFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(filters)) {
    if (val === undefined || val === null || val === "") continue;
    if (Array.isArray(val)) val.forEach((v) => params.append(key, String(v)));
    else params.set(key, String(val));
  }
  return params;
}
