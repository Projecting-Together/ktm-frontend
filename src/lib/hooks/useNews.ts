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

export type ManageNewsStatus = "draft" | "pending_review" | "published" | "rejected";

type TransitionDecision<TStatus extends string> = {
  allowed: boolean;
  nextStatus: TStatus;
  message: string;
};

export function getNewsSubmitTransitionDecision(
  role: string | null | undefined,
  currentStatus: ManageNewsStatus,
): TransitionDecision<ManageNewsStatus> {
  if (role !== "owner") {
    return {
      allowed: false,
      nextStatus: currentStatus,
      message: "Only owners can submit drafts for moderation review.",
    };
  }

  if (currentStatus !== "draft" && currentStatus !== "rejected") {
    return {
      allowed: false,
      nextStatus: currentStatus,
      message: "Only draft or rejected articles can be submitted for review.",
    };
  }

  return {
    allowed: true,
    nextStatus: "pending_review",
    message: "Owner draft submitted to moderation queue as pending review.",
  };
}

export function getNewsPublishTransitionDecision(
  role: string | null | undefined,
  currentStatus: ManageNewsStatus,
): TransitionDecision<ManageNewsStatus> {
  if (role !== "agent" && role !== "admin") {
    return {
      allowed: false,
      nextStatus: currentStatus,
      message: "Only trusted agents or admins can publish news.",
    };
  }

  if (currentStatus !== "pending_review") {
    return {
      allowed: false,
      nextStatus: currentStatus,
      message: "News can only be published after it enters pending review.",
    };
  }

  return {
    allowed: true,
    nextStatus: "published",
    message: "Trusted agent published the approved article to the public news feed.",
  };
}
