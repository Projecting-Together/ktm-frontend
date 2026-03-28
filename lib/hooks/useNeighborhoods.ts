import { useQuery } from "@tanstack/react-query";
import { getNeighborhoods, getNeighborhood, getAmenities } from "@/lib/api/client";

export const neighborhoodKeys = {
  all: ["neighborhoods"] as const,
  list: () => [...neighborhoodKeys.all, "list"] as const,
  detail: (slug: string) => [...neighborhoodKeys.all, "detail", slug] as const,
};

export const amenityKeys = {
  all: ["amenities"] as const,
  list: () => [...amenityKeys.all, "list"] as const,
};

export function useNeighborhoods() {
  return useQuery({
    queryKey: neighborhoodKeys.list(),
    queryFn: async () => {
      const res = await getNeighborhoods();
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
    staleTime: 10 * 60 * 1000, // 10 min — mostly static
  });
}

export function useNeighborhood(slug: string) {
  return useQuery({
    queryKey: neighborhoodKeys.detail(slug),
    queryFn: async () => {
      const res = await getNeighborhood(slug);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAmenities() {
  return useQuery({
    queryKey: amenityKeys.list(),
    queryFn: async () => {
      const res = await getAmenities();
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
    staleTime: 30 * 60 * 1000, // 30 min — very static
  });
}
