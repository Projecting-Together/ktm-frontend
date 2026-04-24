import { useQuery } from "@tanstack/react-query";
import { getNewsBySlug, getPublishedNews } from "@/lib/api/client";
import type { NewsFilters } from "@/lib/api/types";

export const newsKeys = {
  all: ["news"] as const,
  list: (filters: NewsFilters) => [...newsKeys.all, "list", filters] as const,
  detail: (slug: string) => [...newsKeys.all, "detail", slug] as const,
};

export function useNews(filters: NewsFilters = {}) {
  return useQuery({
    queryKey: newsKeys.list(filters),
    queryFn: async () => {
      const res = await getPublishedNews(filters);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
    staleTime: 60 * 1000,
  });
}

export function useNewsDetail(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: newsKeys.detail(slug),
    queryFn: async () => {
      const res = await getNewsBySlug(slug);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
    enabled: options?.enabled ?? !!slug,
    staleTime: 60 * 1000,
  });
}
