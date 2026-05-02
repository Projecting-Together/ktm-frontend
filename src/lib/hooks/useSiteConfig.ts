import { useQuery } from "@tanstack/react-query";
import { fetchSiteConfig } from "@/lib/api/siteConfig";
import type { SiteConfig } from "@/lib/api/types";

export function useSiteConfig() {
  return useQuery({
    queryKey: ["site-config"],
    queryFn: async ({ signal }) => (await fetchSiteConfig(signal)) ?? ({} as SiteConfig),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}
