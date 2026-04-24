import { useQuery } from "@tanstack/react-query";
import { getNews, getNewsDetail } from "@/lib/api/client";
import type { NewsFilters } from "@/lib/api/types";

export const newsKeys = {
  all: ["news"] as const,
  lists: () => [...newsKeys.all, "list"] as const,
  list: (filters: NewsFilters) => [...newsKeys.all, "list", filters] as const,
  details: () => [...newsKeys.all, "detail"] as const,
  detail: (slug: string) => [...newsKeys.all, "detail", slug] as const,
};

export function useNews(filters: NewsFilters = {}) {
  return useQuery({
    queryKey: newsKeys.list(filters),
    queryFn: async () => {
      const res = await getNews(filters);
      if (res.error) throw new Error(res.error.message);
      if (!res.data) throw new Error("News list response is empty");
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useNewsDetail(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: newsKeys.detail(slug),
    queryFn: async () => {
      const res = await getNewsDetail(slug);
      if (res.error) throw new Error(res.error.message);
      if (!res.data) throw new Error("News detail response is empty");
      return res.data;
    },
    enabled: options?.enabled ?? !!slug,
    staleTime: 60 * 1000,
  });
}
