import type { ListingFilters } from "./types";

/** URLSearchParams for GET /listings/ — safe to import from server and client. */
export function buildListingQueryParams(filters: ListingFilters): URLSearchParams {
  const params = new URLSearchParams();
  const {
    min_bedrooms,
    max_bedrooms,
    min_bathrooms,
    max_bathrooms,
    city_slug,
    ...rest
  } = filters;

  for (const [key, val] of Object.entries(rest)) {
    if (val === undefined || val === null || val === "") continue;
    if (Array.isArray(val)) val.forEach((v) => params.append(key, String(v)));
    else params.set(key, String(val));
  }

  if (min_bedrooms != null) params.set("bedrooms", String(min_bedrooms));
  if (max_bedrooms != null) params.set("max_bedrooms", String(max_bedrooms));
  if (min_bathrooms != null) params.set("bathrooms", String(min_bathrooms));
  if (max_bathrooms != null) params.set("max_bathrooms", String(max_bathrooms));
  if (city_slug != null && city_slug !== "") params.set("city", String(city_slug));

  return params;
}
