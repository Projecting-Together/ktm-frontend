/**
 * In-memory news CMS state for MSW only. Simulates backend ownership of transitions
 * (mirrors `lib/contracts/news` rules — real API must enforce the same when implemented).
 * Seed data lives in `frontend/src/test-utils/fixtures/catalog/news-msw.json`.
 */
import type { UserRole } from "@/lib/api/types";
import type { NewsMswArticleRow } from "@/test-utils/fixtures";
import { newsMswCatalog } from "@/test-utils/fixtures";
import {
  canModerateNewsTransition,
  canPublishNews,
  nextNewsStatusForSubmit,
  type ContentStatus,
} from "@/lib/contracts/news";

/** Row shape for handlers — identical to fixture catalog rows. */
export type NewsArticleRow = NewsMswArticleRow;

function cloneArticleRow(r: NewsMswArticleRow): NewsMswArticleRow {
  return JSON.parse(JSON.stringify(r)) as NewsMswArticleRow;
}

function publishedSeedRows(): NewsMswArticleRow[] {
  return newsMswCatalog.published.map(cloneArticleRow);
}

function stamp(): string {
  return new Date().toISOString();
}

let workspaceArticle: NewsMswArticleRow = cloneArticleRow(newsMswCatalog.workspace_initial);

export function resetNewsMockStoreForTests() {
  workspaceArticle = cloneArticleRow(newsMswCatalog.workspace_initial);
}

/** Rows visible on public `/news/published` (published status only). */
function publicPublishedRows(): NewsArticleRow[] {
  const base = publishedSeedRows().filter((r) => r.status === "published");
  if (workspaceArticle.status !== "published") return base;
  const idx = base.findIndex((r) => r.id === workspaceArticle.id);
  if (idx >= 0) {
    const copy = [...base];
    copy[idx] = workspaceArticle;
    return copy;
  }
  return [...base, workspaceArticle];
}

export function listPublishedForPublic(params: URLSearchParams): {
  items: NewsArticleRow[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
} {
  const rows = publicPublishedRows();
  const search = params.get("search")?.trim().toLowerCase();
  let filtered = rows;
  if (search) {
    filtered = rows.filter(
      (r) =>
        r.title.toLowerCase().includes(search) ||
        (r.summary ?? "").toLowerCase().includes(search),
    );
  }
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const page_size = Math.min(100, Math.max(1, Number(params.get("limit") ?? 20)));
  const skip = (page - 1) * page_size;
  const slice = filtered.slice(skip, skip + page_size);
  const total = filtered.length;
  const total_pages = Math.max(1, Math.ceil(total / page_size));
  return {
    items: slice,
    total,
    page,
    page_size,
    total_pages,
    has_next: skip + page_size < total,
    has_prev: page > 1,
  };
}

export function getPublishedBySlug(slug: string): NewsArticleRow | null {
  const row = publicPublishedRows().find((r) => r.slug === slug);
  return row ?? null;
}

/** Workspace article for manage UI (owner sees own draft; publisher roles see pending_review queue item). */
export function getWorkspaceArticle(userId: string, role: UserRole): { ok: true; article: NewsArticleRow } | { ok: false; status: number; detail: string } {
  if (role === "renter") {
    return { ok: false, status: 403, detail: "News workspace is not available for this role." };
  }

  if (role === "owner") {
    if (workspaceArticle.author_user_id !== userId) {
      return { ok: false, status: 404, detail: "No news workspace article for this account." };
    }
    return { ok: true, article: workspaceArticle };
  }

  if (canPublishNews(role)) {
    if (workspaceArticle.status === "pending_review") {
      return { ok: true, article: workspaceArticle };
    }
    return { ok: false, status: 404, detail: "No article is awaiting publication in the queue." };
  }

  return { ok: false, status: 403, detail: "News workspace is not available for this role." };
}

export function submitWorkspaceArticle(userId: string, role: UserRole): { ok: true; article: NewsArticleRow } | { ok: false; status: number; detail: string } {
  if (role !== "owner" || workspaceArticle.author_user_id !== userId) {
    return { ok: false, status: 403, detail: "Only the article owner can submit for review." };
  }
  if (workspaceArticle.status !== "draft" && workspaceArticle.status !== "rejected") {
    return { ok: false, status: 400, detail: "Only draft or rejected articles can be submitted for review." };
  }
  const next = nextNewsStatusForSubmit("owner");
  workspaceArticle = {
    ...workspaceArticle,
    status: next,
    updated_at: stamp(),
    rejection_reason: null,
  };
  return { ok: true, article: workspaceArticle };
}

export function publishWorkspaceArticle(userId: string, role: UserRole): { ok: true; article: NewsArticleRow } | { ok: false; status: number; detail: string } {
  if (!canPublishNews(role)) {
    return { ok: false, status: 403, detail: "Only trusted agents or admins can publish news." };
  }
  if (workspaceArticle.status !== "pending_review") {
    return { ok: false, status: 400, detail: "News can only be published after it enters pending review." };
  }
  const initialSlug = newsMswCatalog.workspace_initial.slug;
  workspaceArticle = {
    ...workspaceArticle,
    status: "published",
    published_at: stamp(),
    updated_at: stamp(),
    slug: workspaceArticle.slug === initialSlug ? newsMswCatalog.workspace_publish_slug : workspaceArticle.slug,
  };
  return { ok: true, article: workspaceArticle };
}

export function listModerationQueue(): NewsArticleRow[] {
  return [workspaceArticle].filter((r) => r.status === "pending_review");
}

export function patchModeration(
  articleId: string,
  body: { status: ContentStatus; rejection_reason?: string | null },
): { ok: true; article: NewsArticleRow } | { ok: false; status: number; detail: string } {
  if (articleId !== workspaceArticle.id) {
    return { ok: false, status: 404, detail: "Article not found." };
  }
  const from = workspaceArticle.status;
  const to = body.status;
  if (!canModerateNewsTransition(from, to)) {
    return {
      ok: false,
      status: 400,
      detail: `Invalid moderation transition from ${from} to ${to}.`,
    };
  }
  if (to === "rejected") {
    const reason = body.rejection_reason?.trim() ?? "";
    if (!reason) {
      return { ok: false, status: 400, detail: "Rejection reason is required." };
    }
    workspaceArticle = {
      ...workspaceArticle,
      status: "rejected",
      rejection_reason: reason,
      updated_at: stamp(),
    };
    return { ok: true, article: workspaceArticle };
  }
  workspaceArticle = {
    ...workspaceArticle,
    status: to,
    published_at: to === "published" ? stamp() : workspaceArticle.published_at,
    rejection_reason: null,
    updated_at: stamp(),
  };
  return { ok: true, article: workspaceArticle };
}
