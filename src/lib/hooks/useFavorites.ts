import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFavorites, addFavorite, removeFavorite } from "@/lib/api/client";
import { toast } from "sonner";

export const favoriteKeys = {
  all: ["favorites"] as const,
  list: () => [...favoriteKeys.all, "list"] as const,
};

export function useFavorites() {
  return useQuery({
    queryKey: favoriteKeys.list(),
    queryFn: async () => {
      const res = await getFavorites();
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useIsFavorite(listingId: string) {
  const { data: favorites } = useFavorites();
  return favorites?.some((f) => f.listing_id === listingId) ?? false;
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  const { data: favorites } = useFavorites();

  return useMutation({
    mutationFn: async (listingId: string) => {
      const isFav = favorites?.some((f) => f.listing_id === listingId);
      if (isFav) {
        const res = await removeFavorite(listingId);
        if (res.error) throw new Error(res.error.message);
        return { action: "removed" as const, listingId };
      } else {
        const res = await addFavorite(listingId);
        if (res.error) throw new Error(res.error.message);
        return { action: "added" as const, listingId };
      }
    },
    onSuccess: ({ action }) => {
      qc.invalidateQueries({ queryKey: favoriteKeys.list() });
      toast.success(action === "added" ? "Saved to favorites" : "Removed from favorites");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
