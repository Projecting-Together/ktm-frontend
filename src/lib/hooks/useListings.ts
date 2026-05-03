import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  getListings, getListing, createListing, updateListing, deleteListing,
  publishListing, markListingRented, getListingStats,
  adminGetPendingListings, adminApproveListing, adminRejectListing,
} from "@/lib/api/client";
import type { ListingFilters, Listing } from "@/lib/api/types";
import { revalidatePublicListingCache } from "@/lib/cache/revalidate-public-listings";
import { toast } from "sonner";

// Query keys factory
export const listingKeys = {
  all: ["listings"] as const,
  lists: () => [...listingKeys.all, "list"] as const,
  list: (filters: ListingFilters) => [...listingKeys.lists(), filters] as const,
  details: () => [...listingKeys.all, "detail"] as const,
  detail: (id: string) => [...listingKeys.details(), id] as const,
  stats: (id: string) => [...listingKeys.all, "stats", id] as const,
  admin: () => [...listingKeys.all, "admin"] as const,
  adminPending: (page: number) => [...listingKeys.admin(), "pending", page] as const,
};

export function useListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: listingKeys.list(filters),
    queryFn: async () => {
      const res = await getListings(filters);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    /** One failed request is enough: timeout + manual “Try again” avoids two long waits. */
    retry: 0,
  });
}

export function useListing(slugOrId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: listingKeys.detail(slugOrId),
    queryFn: async () => {
      const res = await getListing(slugOrId);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
    enabled: options?.enabled ?? !!slugOrId,
    staleTime: 60 * 1000,
  });
}

export function useListingStats(id: string) {
  return useQuery({
    queryKey: listingKeys.stats(id),
    queryFn: async () => {
      const res = await getListingStats(id);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
    enabled: !!id,
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Listing>) => createListing(payload).then((r) => {
      if (r.error) throw new Error(r.error.message);
      return r.data!;
    }),
    onSuccess: (data) => {
      void revalidatePublicListingCache(data.id);
      qc.invalidateQueries({ queryKey: listingKeys.lists() });
      qc.invalidateQueries({ queryKey: ["dashboard", "owner-listings"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "listings", "my-expired-total"] });
      toast.success("Listing created successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Listing> }) =>
      updateListing(id, payload).then((r) => {
        if (r.error) throw new Error(r.error.message);
        return r.data!;
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: listingKeys.detail(data.id) });
      qc.invalidateQueries({ queryKey: listingKeys.lists() });
      qc.invalidateQueries({ queryKey: ["dashboard", "owner-listings"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "listings", "my-expired-total"] });
      toast.success("Listing updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteListing(id).then((r) => {
      if (r.error) throw new Error(r.error.message);
    }),
    onSuccess: (_void, deletedId) => {
      void revalidatePublicListingCache(deletedId);
      qc.invalidateQueries({ queryKey: listingKeys.lists() });
      qc.invalidateQueries({ queryKey: ["dashboard", "owner-listings"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "listings", "my-expired-total"] });
      toast.success("Listing deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function usePublishListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishListing(id).then((r) => {
      if (r.error) throw new Error(r.error.message);
      return r.data!;
    }),
    onSuccess: (data) => {
      void revalidatePublicListingCache(data.id);
      qc.invalidateQueries({ queryKey: listingKeys.detail(data.id) });
      qc.invalidateQueries({ queryKey: listingKeys.lists() });
      qc.invalidateQueries({ queryKey: ["dashboard", "owner-listings"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "listings", "my-expired-total"] });
      toast.success("Listing submitted for review");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useMarkRented() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markListingRented(id).then((r) => {
      if (r.error) throw new Error(r.error.message);
      return r.data!;
    }),
    onSuccess: (data) => {
      void revalidatePublicListingCache(data.id);
      qc.invalidateQueries({ queryKey: listingKeys.detail(data.id) });
      qc.invalidateQueries({ queryKey: listingKeys.lists() });
      qc.invalidateQueries({ queryKey: ["dashboard", "owner-listings"] });
      qc.invalidateQueries({ queryKey: ["dashboard", "listings", "my-expired-total"] });
      toast.success("Listing marked as rented");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// Admin hooks
export function useAdminPendingListings(page = 1) {
  return useQuery({
    queryKey: listingKeys.adminPending(page),
    queryFn: async () => {
      const res = await adminGetPendingListings(page);
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
    placeholderData: keepPreviousData,
  });
}

export function useAdminApproveListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApproveListing(id).then((r) => {
      if (r.error) throw new Error(r.error.message);
      return r.data!;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: listingKeys.admin() });
      toast.success("Listing approved");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAdminRejectListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminRejectListing(id, reason).then((r) => {
        if (r.error) throw new Error(r.error.message);
        return r.data!;
      }),
    onSuccess: (data) => {
      void revalidatePublicListingCache(data.id);
      qc.invalidateQueries({ queryKey: listingKeys.admin() });
      toast.success("Listing rejected");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
