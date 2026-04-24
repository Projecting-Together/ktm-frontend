import { useQuery } from "@tanstack/react-query";
import { getMarketListingDetail, getMarketListings } from "@/lib/api/client";
import { nextStatusForSubmit } from "@/lib/contracts/marketListing";
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

export type ManageMarketListingStatus = "draft" | "pending_review" | "published" | "rejected";

type TransitionDecision<TStatus extends string> = {
  allowed: boolean;
  nextStatus: TStatus;
  message: string;
};

export function getMarketListingSubmitTransitionDecision(
  role: string | null | undefined,
  currentStatus: ManageMarketListingStatus,
): TransitionDecision<ManageMarketListingStatus> {
  if (!role) {
    return {
      allowed: false,
      nextStatus: currentStatus,
      message: "Sign in with an owner role to submit for moderation.",
    };
  }

  if (currentStatus !== "draft" && currentStatus !== "rejected") {
    return {
      allowed: false,
      nextStatus: currentStatus,
      message: "Only draft or rejected listings can be submitted again.",
    };
  }

  if (role !== "owner" && role !== "agent" && role !== "admin") {
    return {
      allowed: false,
      nextStatus: currentStatus,
      message: "Only owners, trusted agents, or admins can submit listing transitions.",
    };
  }

  const nextStatus = nextStatusForSubmit(role);
  if (nextStatus === "pending_review") {
    return {
      allowed: true,
      nextStatus,
      message: "Owner market listing submitted to moderation queue as pending review.",
    };
  }

  return {
    allowed: true,
    nextStatus,
    message: "Trusted agent published the approved market listing to public market surfaces.",
  };
}

export function getMarketListingPublishTransitionDecision(
  role: string | null | undefined,
  currentStatus: ManageMarketListingStatus,
): TransitionDecision<ManageMarketListingStatus> {
  if (role !== "agent" && role !== "admin") {
    return {
      allowed: false,
      nextStatus: currentStatus,
      message: "Only trusted agents or admins can publish market listings.",
    };
  }

  if (currentStatus !== "pending_review") {
    return {
      allowed: false,
      nextStatus: currentStatus,
      message: "Market listing must be in pending review before publish.",
    };
  }

  return {
    allowed: true,
    nextStatus: "published",
    message: "Trusted agent published the approved market listing to public market surfaces.",
  };
}
