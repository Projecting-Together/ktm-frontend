import { useQuery } from "@tanstack/react-query";
import { getMarketListingDetail, getMarketListings } from "@/lib/api/client";
import type { MarketListingFilters } from "@/lib/api/types";

function normalizeMarketListingFilters(filters: MarketListingFilters = {}): MarketListingFilters {
  const normalizedEntries = Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));

  return Object.fromEntries(normalizedEntries) as MarketListingFilters;
}

export const marketListingKeys = {
  all: ["market-listings"] as const,
  lists: () => [...marketListingKeys.all, "list"] as const,
  list: (filters: MarketListingFilters = {}) =>
    [...marketListingKeys.lists(), normalizeMarketListingFilters(filters)] as const,
  details: () => [...marketListingKeys.all, "detail"] as const,
  detail: (slug: string) => [...marketListingKeys.details(), slug] as const,
};

export function useMarketListings(filters: MarketListingFilters = {}) {
  const normalizedFilters = normalizeMarketListingFilters(filters);
  return useQuery({
    queryKey: marketListingKeys.list(normalizedFilters),
    queryFn: async () => {
      const res = await getMarketListings(normalizedFilters);
      if (res.error) throw new Error(res.error.message);
      if (!res.data) throw new Error("Market listing response is empty");
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useMarketListingDetail(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: marketListingKeys.detail(slug),
    queryFn: async () => {
      const res = await getMarketListingDetail(slug);
      if (res.error) throw new Error(res.error.message);
      if (!res.data) throw new Error("Market listing detail response is empty");
      return res.data;
    },
    enabled: options?.enabled ?? !!slug,
    staleTime: 60 * 1000,
  });
}
