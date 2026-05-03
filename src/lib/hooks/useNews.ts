import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNews,
  getNewsDetail,
  getNewsModerationQueue,
  getNewsWorkspaceArticle,
  patchNewsModeration,
  postNewsWorkspacePublish,
  postNewsWorkspaceSubmit,
} from "@/lib/api/client";
import type { NewsFilters, NewsModerationQueueItem, UserRole } from "@/lib/api/types";
import {
  canPublishNews,
  nextNewsStatusForSubmit,
  type ContentStatus,
} from "@/lib/contracts/news";

export const newsKeys = {
  all: ["news"] as const,
  lists: () => [...newsKeys.all, "list"] as const,
  list: (filters: NewsFilters) => [...newsKeys.all, "list", filters] as const,
  details: () => [...newsKeys.all, "detail"] as const,
  detail: (slug: string) => [...newsKeys.all, "detail", slug] as const,
  workspace: () => [...newsKeys.all, "workspace"] as const,
  moderationQueue: () => [...newsKeys.all, "moderation", "queue"] as const,
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

/** Authenticated dashboard news workspace (`/dashboard/news`; MSW or FastAPI). */
export function useNewsWorkspace(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: newsKeys.workspace(),
    queryFn: async () => {
      const res = await getNewsWorkspaceArticle();
      if (res.error) throw new Error(res.error.message);
      if (!res.data) throw new Error("News workspace response is empty");
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000,
    retry: false,
  });
}

export function useNewsModerationQueue(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: newsKeys.moderationQueue(),
    queryFn: async () => {
      const res = await getNewsModerationQueue();
      if (res.error) throw new Error(res.error.message);
      if (!res.data) throw new Error("Moderation queue response is empty");
      return res.data;
    },
    enabled: options?.enabled ?? true,
    staleTime: 15 * 1000,
    retry: false,
  });
}

export function useNewsWorkspaceSubmit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await postNewsWorkspaceSubmit();
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: newsKeys.workspace() });
      qc.invalidateQueries({ queryKey: newsKeys.moderationQueue() });
      qc.invalidateQueries({ queryKey: newsKeys.all });
    },
  });
}

export function useNewsWorkspacePublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await postNewsWorkspacePublish();
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: newsKeys.workspace() });
      qc.invalidateQueries({ queryKey: newsKeys.moderationQueue() });
      qc.invalidateQueries({ queryKey: newsKeys.all });
    },
  });
}

export function useNewsModerationPatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { articleId: string; status: ContentStatus; rejection_reason?: string | null }) => {
      const res = await patchNewsModeration(payload.articleId, {
        status: payload.status,
        rejection_reason: payload.rejection_reason,
      });
      if (res.error) throw new Error(res.error.message);
      return res.data as NewsModerationQueueItem;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: newsKeys.moderationQueue() });
      qc.invalidateQueries({ queryKey: newsKeys.workspace() });
      qc.invalidateQueries({ queryKey: newsKeys.all });
    },
  });
}

export type ManageNewsStatus = ContentStatus;

type TransitionDecision<TStatus extends string> = {
  allowed: boolean;
  nextStatus: TStatus;
  message: string;
};

export function getNewsSubmitTransitionDecision(
  role: UserRole | null | undefined,
  currentStatus: ManageNewsStatus,
): TransitionDecision<ManageNewsStatus> {
  if (role !== "user") {
    return {
      allowed: false,
      nextStatus: currentStatus,
      message: "Only signed-in users can submit drafts for moderation review.",
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
    nextStatus: nextNewsStatusForSubmit("user"),
    message: "Draft submitted to moderation queue as pending review.",
  };
}

export function getNewsPublishTransitionDecision(
  role: UserRole | null | undefined,
  currentStatus: ManageNewsStatus,
): TransitionDecision<ManageNewsStatus> {
  if (!role || !canPublishNews(role)) {
    return {
      allowed: false,
      nextStatus: currentStatus,
      message: "Only an administrator can publish news.",
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
    message: "Article published to the public news feed.",
  };
}
