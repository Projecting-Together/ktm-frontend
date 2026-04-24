import { useQuery } from "@tanstack/react-query";
import { getAmenities } from "@/lib/api/client";

export const amenityKeys = {
  all: ["amenities"] as const,
  list: () => [...amenityKeys.all, "list"] as const,
};

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
