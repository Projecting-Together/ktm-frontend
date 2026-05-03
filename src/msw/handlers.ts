/**
 * MSW handlers aligned with `lib/api/client.ts` paths.
 * Requests use `NEXT_PUBLIC_API_URL` as origin + `/listings/`, etc. — pathname is always `/api/v1/...`.
 */
import { http, HttpResponse, passthrough } from "msw";
import type { ListingStats, PaginatedResponse, ListingListItem, NewsArticle, NewsListItem, UserRole } from "@/lib/api/types";
import { scenarioCatalog } from "@/msw/mockScenarioData";
import { resolveScenarioState } from "@/msw/mockScenarioSelector";
import {
  mockListings,
  mockListingItems,
  mockLocalities,
  mockRenter,
  mockOwner,
  mockAdmin,
  mockAgent,
  mockAuthTokens,
  mockOwnerAuthTokens,
  mockAdminAuthTokens,
  mockAgentAuthTokens,
  mockInquiries,
  mockVisitRequests,
  mockFavorites,
  mockAdminAnalytics,
  mockAuditLogs,
  mockAmenities,
  mockRentListingVariants,
  mswAuthLogins,
  mswSyntheticIds,
  mswUploadTemplates,
} from "@/test-utils/mockData";
import {
  adminDashboardActivitiesCatalog,
  adminDashboardKpisCatalog,
  adminListingsCatalog as adminListings,
} from "@/test-utils/fixtures";
import { buildAdminAnalyticsTimeseries } from "@/msw/adminAnalyticsTimeseries";
import { buildFilteredListingPageFromSearchParams } from "@/test-utils/public-listings-fixtures";
import type { NewsArticleRow } from "@/msw/newsMockStore";
import * as newsMockStore from "@/msw/newsMockStore";

/** Next.js chunks & dev endpoints must not be mocked — prevents 404 / wrong MIME on `/_next/static/*`. */
const passthroughNextAssets = http.all(
  ({ request }) => {
    const p = new URL(request.url).pathname;
    return p.startsWith("/_next/") || p.startsWith("/__nextjs");
  },
  () => passthrough()
);

function pathname(request: Request) {
  return new URL(request.url).pathname;
}

const mockListingsWithRentVariants = [...mockListings, ...mockRentListingVariants];

function expandMswUploadTemplates(filename: string) {
  const t = mswUploadTemplates;
  return {
    upload_url: t.uploadUrlTemplate.replaceAll("{filename}", filename),
    storage_key: t.storageKeyTemplate.replaceAll("{filename}", filename),
    public_url: t.publicUrlTemplate.replaceAll("{filename}", filename),
  };
}

function resolveLoginTokens(email: string, password: string) {
  for (const row of mswAuthLogins.loginAccounts) {
    if (row.email !== email || row.password !== password) continue;
    if (row.tokens === "admin") return mockAdminAuthTokens;
    if (row.tokens === "user" || row.tokens === "renter" || row.tokens === "owner" || row.tokens === "agent") {
      if (email === "ram.sharma@gmail.com") return mockAuthTokens;
      if (email === "sita.thapa@gmail.com") return mockOwnerAuthTokens;
      if (email === "bikash.gurung@ktmrealty.com") return mockAgentAuthTokens;
      return mockAuthTokens;
    }
  }
  return null;
}

function getScenarioState() {
  return resolveScenarioState(process.env.NEXT_PUBLIC_MSW_SCENARIO_STATE);
}

function getPublicScenario() {
  return scenarioCatalog.public[getScenarioState()];
}

function getAuthScenario() {
  return scenarioCatalog.auth[getScenarioState()];
}

function getAdminScenario() {
  return scenarioCatalog.admin[getScenarioState()];
}

function resolveMockUserIdFromAccessToken(token: string): string | null {
  if (token === mockOwnerAuthTokens.access_token) return mockOwner.id;
  if (token === mockAdminAuthTokens.access_token) return mockAdmin.id;
  if (token === mockAgentAuthTokens.access_token) return mockAgent.id;
  if (token === mockAuthTokens.access_token) return mockRenter.id;
  return null;
}

function resolveMockRoleFromAccessToken(token: string): UserRole | null {
  if (token === mockOwnerAuthTokens.access_token) return mockOwner.role;
  if (token === mockAdminAuthTokens.access_token) return mockAdmin.role;
  if (token === mockAgentAuthTokens.access_token) return mockAgent.role;
  if (token === mockAuthTokens.access_token) return mockRenter.role;
  return null;
}

function newsRowToListItem(row: NewsArticleRow): NewsListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    cover_image_url: row.cover_image_url,
    published_at: row.published_at,
    is_published: row.status === "published",
  };
}

function newsRowToPublicArticle(row: NewsArticleRow): NewsArticle {
  return {
    ...newsRowToListItem(row),
    content: row.content,
  };
}

function requireAuth(request: Request): { ok: true; userId: string; role: UserRole } | { ok: false; response: Response } {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return { ok: false, response: HttpResponse.json({ detail: "Not authenticated" }, { status: 401 }) };
  }
  const token = auth.slice(7);
  const userId = resolveMockUserIdFromAccessToken(token);
  const role = resolveMockRoleFromAccessToken(token);
  if (!userId || !role) {
    return { ok: false, response: HttpResponse.json({ detail: "Not authenticated" }, { status: 401 }) };
  }
  return { ok: true, userId, role };
}

function filterListingItems(request: Request) {
  return buildFilteredListingPageFromSearchParams(new URL(request.url).searchParams);
}

export const handlers = [
  passthroughNextAssets,
  // ── AUTH ──────────────────────────────────────────────────────────────────
  http.post(
    ({ request }) => pathname(request) === "/api/v1/auth/login",
    async ({ request }) => {
      const body = (await request.json()) as { email: string; password: string };
      const tokens = resolveLoginTokens(body.email, body.password);
      if (tokens) return HttpResponse.json(tokens);
      return HttpResponse.json({ detail: "Invalid email or password" }, { status: 401 });
    }
  ),

  http.post(
    ({ request }) => pathname(request) === "/api/v1/auth/register",
    async ({ request }) => {
      const body = (await request.json()) as { email: string; password: string };
      if (body.email === mswAuthLogins.registerConflictEmail) {
        return HttpResponse.json({ detail: "Email already registered" }, { status: 409 });
      }
      return HttpResponse.json(mockAuthTokens, { status: 201 });
    }
  ),

  http.post(
    ({ request }) => pathname(request) === "/api/v1/auth/refresh",
    () => HttpResponse.json(mockAuthTokens)
  ),

  http.post(
    ({ request }) => pathname(request) === "/api/v1/auth/logout",
    () => HttpResponse.json({ message: "Logged out successfully" })
  ),

  http.post(
    ({ request }) => pathname(request) === "/api/v1/auth/verify-email",
    () => HttpResponse.json({ message: "Email verified" })
  ),

  http.get(
    ({ request }) => pathname(request) === "/api/v1/site-config",
    () =>
      HttpResponse.json({
        heroBannerUrl: null,
        ctaBannerUrl: null,
      })
  ),

  http.get(
    ({ request }) => pathname(request) === "/api/v1/auth/me",
    ({ request }) => {
      const authScenario = getAuthScenario();
      if (authScenario.meStatus !== 200) {
        return HttpResponse.json(authScenario.meBody ?? { detail: "Unexpected auth scenario error" }, { status: authScenario.meStatus });
      }

      const auth = request.headers.get("Authorization");
      if (!auth?.startsWith("Bearer ")) {
        return HttpResponse.json({ detail: "Not authenticated" }, { status: 401 });
      }
      const token = auth.slice(7);
      if (token === mockOwnerAuthTokens.access_token) return HttpResponse.json(mockOwner);
      if (token === mockAdminAuthTokens.access_token) return HttpResponse.json(mockAdmin);
      if (token === mockAgentAuthTokens.access_token) return HttpResponse.json(mockAgent);
      return HttpResponse.json(mockRenter);
    }
  ),

  // ── NEWS (in-memory MSW store — backend must enforce the same rules when implemented) ──
  http.get(
    ({ request }) => {
      const p = pathname(request);
      return p === "/api/v1/news/published" || p === "/api/v1/news/published/";
    },
    ({ request }) => {
      const url = new URL(request.url);
      const body = newsMockStore.listPublishedForPublic(url.searchParams);
      return HttpResponse.json({
        ...body,
        items: body.items.map(newsRowToListItem),
      });
    }
  ),

  http.get(
    ({ request }) => /^\/api\/v1\/news\/published\/[^/]+$/.test(pathname(request)),
    ({ request }) => {
      const segments = pathname(request).split("/");
      const slug = segments[segments.length - 1] ?? "";
      const row = newsMockStore.getPublishedBySlug(slug);
      if (!row) return HttpResponse.json({ detail: "News not found" }, { status: 404 });
      return HttpResponse.json(newsRowToPublicArticle(row));
    }
  ),

  http.get(
    ({ request }) => pathname(request) === "/api/v1/news/workspace",
    ({ request }) => {
      const auth = requireAuth(request);
      if (!auth.ok) return auth.response;
      const result = newsMockStore.getWorkspaceArticle(auth.userId, auth.role);
      if (!result.ok) return HttpResponse.json({ detail: result.detail }, { status: result.status });
      const row = result.article;
      return HttpResponse.json({
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        content: row.content,
        cover_image_url: row.cover_image_url,
        status: row.status,
        rejection_reason: row.rejection_reason,
        published_at: row.published_at,
        author_user_id: row.author_user_id,
      });
    }
  ),

  http.post(
    ({ request }) => pathname(request) === "/api/v1/news/workspace/submit",
    ({ request }) => {
      const auth = requireAuth(request);
      if (!auth.ok) return auth.response;
      const result = newsMockStore.submitWorkspaceArticle(auth.userId, auth.role);
      if (!result.ok) return HttpResponse.json({ detail: result.detail }, { status: result.status });
      const row = result.article;
      return HttpResponse.json({
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        content: row.content,
        cover_image_url: row.cover_image_url,
        status: row.status,
        rejection_reason: row.rejection_reason,
        published_at: row.published_at,
        author_user_id: row.author_user_id,
      });
    }
  ),

  http.post(
    ({ request }) => pathname(request) === "/api/v1/news/workspace/publish",
    ({ request }) => {
      const auth = requireAuth(request);
      if (!auth.ok) return auth.response;
      const result = newsMockStore.publishWorkspaceArticle(auth.userId, auth.role);
      if (!result.ok) return HttpResponse.json({ detail: result.detail }, { status: result.status });
      const row = result.article;
      return HttpResponse.json({
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        content: row.content,
        cover_image_url: row.cover_image_url,
        status: row.status,
        rejection_reason: row.rejection_reason,
        published_at: row.published_at,
        author_user_id: row.author_user_id,
      });
    }
  ),

  http.get(
    ({ request }) => pathname(request) === "/api/v1/news/moderation/queue",
    ({ request }) => {
      const auth = requireAuth(request);
      if (!auth.ok) return auth.response;
      if (auth.role !== "admin") {
        return HttpResponse.json({ detail: "Admin access required for moderation queue." }, { status: 403 });
      }
      const items = newsMockStore.listModerationQueue().map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        content: row.content,
        cover_image_url: row.cover_image_url,
        status: row.status,
        rejection_reason: row.rejection_reason,
        published_at: row.published_at,
        author_user_id: row.author_user_id,
      }));
      return HttpResponse.json({ items });
    }
  ),

  http.patch(
    ({ request }) => /^\/api\/v1\/news\/moderation\/[^/]+$/.test(pathname(request)),
    async ({ request }) => {
      const auth = requireAuth(request);
      if (!auth.ok) return auth.response;
      if (auth.role !== "admin") {
        return HttpResponse.json({ detail: "Admin access required for moderation actions." }, { status: 403 });
      }
      const id = pathname(request).split("/")[5];
      const body = (await request.json()) as { status: string; rejection_reason?: string | null };
      const result = newsMockStore.patchModeration(id, {
        status: body.status as NewsArticleRow["status"],
        rejection_reason: body.rejection_reason,
      });
      if (!result.ok) return HttpResponse.json({ detail: result.detail }, { status: result.status });
      const row = result.article;
      return HttpResponse.json({
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        content: row.content,
        cover_image_url: row.cover_image_url,
        status: row.status,
        rejection_reason: row.rejection_reason,
        published_at: row.published_at,
        author_user_id: row.author_user_id,
      });
    }
  ),

  // ── LISTINGS (specific paths before `/listings/:id`) ─────────────────────
  http.get(
    ({ request }) => pathname(request) === "/api/v1/listings/user/my-listings",
    ({ request }) => {
      const auth = request.headers.get("Authorization");
      if (!auth?.startsWith("Bearer ")) {
        return HttpResponse.json({ detail: "Not authenticated" }, { status: 401 });
      }
      const userId = resolveMockUserIdFromAccessToken(auth.slice(7));
      if (!userId) {
        return HttpResponse.json({ detail: "Not authenticated" }, { status: 401 });
      }

      const url = new URL(request.url);
      const rawStatus = url.searchParams.get("status")?.trim().toLowerCase();
      const dbStatus =
        rawStatus === "archived" ? "expired" : rawStatus ?? null;

      const skip = Math.max(0, Number(url.searchParams.get("skip") ?? 0));
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20)));

      let ownerItems: ListingListItem[] = mockListingItems.filter((item) => {
        const full = mockListingsWithRentVariants.find((l) => l.id === item.id);
        return full?.owner_user_id === userId;
      });

      if (dbStatus) {
        ownerItems = ownerItems.filter((item) => {
          if (dbStatus === "expired") {
            return item.status === "expired" || item.status === "archived";
          }
          return item.status === dbStatus;
        });
      }

      const total = ownerItems.length;
      const pageItems = ownerItems.slice(skip, skip + limit);
      const pageSize = limit;
      const page = pageSize > 0 ? Math.floor(skip / pageSize) + 1 : 1;
      const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;

      const body: PaginatedResponse<ListingListItem> = {
        items: pageItems,
        total,
        page,
        page_size: pageSize,
        total_pages: totalPages,
        has_next: skip + pageSize < total,
        has_prev: skip > 0,
      };
      return HttpResponse.json(body);
    }
  ),

  http.get(
    ({ request }) => /^\/api\/v1\/listings\/[^/]+\/stats$/.test(pathname(request)),
    ({ request }) => {
      const id = pathname(request).split("/")[4];
      const stats: ListingStats = {
        listing_id: id,
        views: 120,
        inquiries: 3,
        favorites: 8,
        visits_requested: 2,
      };
      return HttpResponse.json(stats);
    }
  ),

  http.post(
    ({ request }) => /^\/api\/v1\/listings\/[^/]+\/publish$/.test(pathname(request)),
    ({ request }) => {
      const id = pathname(request).split("/")[4];
      const listing = mockListings.find((l) => l.id === id);
      if (!listing) return HttpResponse.json({ detail: "Listing not found" }, { status: 404 });
      return HttpResponse.json({ ...listing, status: "active" as const });
    }
  ),

  http.post(
    ({ request }) => /^\/api\/v1\/listings\/[^/]+\/mark-rented$/.test(pathname(request)),
    ({ request }) => {
      const id = pathname(request).split("/")[4];
      const listing = mockListings.find((l) => l.id === id);
      if (!listing) return HttpResponse.json({ detail: "Listing not found" }, { status: 404 });
      return HttpResponse.json({ ...listing, status: "rented" as const });
    }
  ),

  http.patch(
    ({ request }) => /^\/api\/v1\/listings\/[^/]+\/media\/reorder$/.test(pathname(request)),
    () => HttpResponse.json(null, { status: 204 })
  ),

  http.get(
    ({ request }) => {
      const p = pathname(request);
      return (p === "/api/v1/listings" || p === "/api/v1/listings/") && request.method === "GET";
    },
    ({ request }) => {
      const publicScenario = getPublicScenario();
      if (publicScenario.listingsStatus) {
        return HttpResponse.json(publicScenario.listingsBody ?? { detail: "Unexpected public scenario error" }, { status: publicScenario.listingsStatus });
      }
      if (publicScenario.listings) {
        return HttpResponse.json(publicScenario.listings);
      }
      return HttpResponse.json(filterListingItems(request));
    }
  ),

  http.post(
    ({ request }) => {
      const p = pathname(request);
      return (p === "/api/v1/listings" || p === "/api/v1/listings/") && request.method === "POST";
    },
    async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      const newListing = {
        ...mockListingsWithRentVariants[0],
        id: mswSyntheticIds.newListingId,
        slug: `new-listing-${Date.now()}`,
        title: (body.title as string) ?? "New Listing",
        status: "pending" as const,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return HttpResponse.json(newListing, { status: 201 });
    }
  ),

  http.get(
    ({ request }) => {
      const p = pathname(request);
      if (p === "/api/v1/listings" || p === "/api/v1/listings/") return false;
      return /^\/api\/v1\/listings\/[^/]+$/.test(p);
    },
    ({ request }) => {
      const slug = pathname(request).split("/").pop()!;
      const listing = mockListingsWithRentVariants.find((l) => l.slug === slug || l.id === slug);
      if (!listing) return HttpResponse.json({ detail: "Listing not found" }, { status: 404 });
      return HttpResponse.json(listing);
    }
  ),

  http.patch(
    ({ request }) => /^\/api\/v1\/listings\/[^/]+$/.test(pathname(request)),
    async ({ request }) => {
      const id = pathname(request).split("/").pop()!;
      const body = (await request.json()) as Record<string, unknown>;
      const listing = mockListingsWithRentVariants.find((l) => l.id === id);
      if (!listing) return HttpResponse.json({ detail: "Listing not found" }, { status: 404 });
      return HttpResponse.json({ ...listing, ...body, updated_at: new Date().toISOString() });
    }
  ),

  http.delete(
    ({ request }) => /^\/api\/v1\/listings\/[^/]+$/.test(pathname(request)),
    ({ request }) => {
      const id = pathname(request).split("/").pop()!;
      const listing = mockListingsWithRentVariants.find((l) => l.id === id);
      if (!listing) return HttpResponse.json({ detail: "Listing not found" }, { status: 404 });
      return HttpResponse.json(null, { status: 204 });
    }
  ),

  // ── MEDIA ─────────────────────────────────────────────────────────────────
  http.post(
    ({ request }) => pathname(request) === "/api/v1/media/presigned-url",
    async ({ request }) => {
      const body = (await request.json()) as { filename: string; content_type: string };
      return HttpResponse.json(expandMswUploadTemplates(body.filename));
    }
  ),

  http.post(
    ({ request }) => pathname(request) === "/api/v1/media/confirm",
    async () =>
      HttpResponse.json({
        id: mswSyntheticIds.newImageId,
      })
  ),

  http.delete(
    ({ request }) => /^\/api\/v1\/media\/[^/]+$/.test(pathname(request)),
    () => HttpResponse.json(null, { status: 204 })
  ),

  // ── AMENITIES / LOCALITIES ────────────────────────────────────────────────────
  http.get(
    ({ request }) => /^\/api\/v1\/amenities\/?/.test(pathname(request)),
    () => HttpResponse.json(mockAmenities)
  ),

  http.get(
    ({ request }) => pathname(request) === "/api/v1/localities" || pathname(request) === "/api/v1/localities/",
    () => HttpResponse.json(mockLocalities)
  ),

  http.get(
    ({ request }) => /^\/api\/v1\/localities\/[^/]+$/.test(pathname(request)),
    ({ request }) => {
      const slug = pathname(request).split("/").pop()!;
      const loc = mockLocalities.find((n) => n.slug === slug);
      if (!loc) return HttpResponse.json({ detail: "Locality not found" }, { status: 404 });
      return HttpResponse.json(loc);
    }
  ),

  // ── INQUIRIES ─────────────────────────────────────────────────────────────
  http.post(
    ({ request }) => pathname(request) === "/api/v1/inquiries",
    async ({ request }) => {
      const body = (await request.json()) as { listing_id: string; message: string; move_in_date?: string | null };
      const newInquiry = {
        ...mockInquiries[0],
        id: mswSyntheticIds.newInquiryId,
        listing_id: body.listing_id,
        message: body.message,
        move_in_date: body.move_in_date ?? null,
        status: "pending" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return HttpResponse.json(newInquiry, { status: 201 });
    }
  ),

  http.get(
    ({ request }) => pathname(request) === "/api/v1/inquiries/sent",
    () => HttpResponse.json(mockInquiries)
  ),

  http.get(
    ({ request }) => pathname(request) === "/api/v1/inquiries/received",
    () => HttpResponse.json(mockInquiries)
  ),

  http.patch(
    ({ request }) => /^\/api\/v1\/inquiries\/[^/]+\/reply$/.test(pathname(request)),
    async ({ request }) => {
      const id = pathname(request).split("/")[4];
      const body = (await request.json()) as { owner_reply: string };
      const inquiry = mockInquiries.find((i) => i.id === id);
      if (!inquiry) return HttpResponse.json({ detail: "Inquiry not found" }, { status: 404 });
      return HttpResponse.json({ ...inquiry, owner_reply: body.owner_reply });
    }
  ),

  // ── VISITS ────────────────────────────────────────────────────────────────
  http.post(
    ({ request }) => pathname(request) === "/api/v1/visits",
    async ({ request }) => {
      const body = (await request.json()) as { listing_id: string; preferred_date: string; notes?: string };
      const newVisit = {
        ...mockVisitRequests[0],
        id: mswSyntheticIds.newVisitId,
        listing_id: body.listing_id,
        preferred_date: body.preferred_date,
        notes: body.notes ?? null,
        status: "pending" as const,
        created_at: new Date().toISOString(),
      };
      return HttpResponse.json(newVisit, { status: 201 });
    }
  ),

  http.get(
    ({ request }) => pathname(request) === "/api/v1/visits/my",
    () => HttpResponse.json(mockVisitRequests)
  ),

  http.get(
    ({ request }) => pathname(request) === "/api/v1/visits/received",
    () => HttpResponse.json(mockVisitRequests)
  ),

  http.patch(
    ({ request }) => /^\/api\/v1\/visits\/[^/]+\/confirm$/.test(pathname(request)),
    async ({ request }) => {
      const id = pathname(request).split("/")[4];
      const body = (await request.json()) as { confirmed_date: string };
      const visit = mockVisitRequests.find((v) => v.id === id);
      if (!visit) return HttpResponse.json({ detail: "Visit not found" }, { status: 404 });
      return HttpResponse.json({
        ...visit,
        status: "confirmed" as const,
        confirmed_date: body.confirmed_date,
      });
    }
  ),

  // ── FAVORITES ────────────────────────────────────────────────────────────
  http.get(
    ({ request }) => pathname(request) === "/api/v1/favorites",
    () => HttpResponse.json(mockFavorites)
  ),

  http.post(
    ({ request }) => pathname(request) === "/api/v1/favorites",
    async ({ request }) => {
      const body = (await request.json()) as { listing_id: string };
      const listing = mockListingItems.find((l) => l.id === body.listing_id) ?? mockListingItems[0];
      return HttpResponse.json(
        {
          user_id: mswSyntheticIds.favoriteDefaultUserId,
          listing_id: body.listing_id,
          created_at: new Date().toISOString(),
          listing,
        },
        { status: 201 }
      );
    }
  ),

  http.delete(
    ({ request }) => /^\/api\/v1\/favorites\/[^/]+$/.test(pathname(request)),
    () => HttpResponse.json(null, { status: 204 })
  ),

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  http.get(
    ({ request }) => pathname(request) === "/api/v1/admin/analytics/timeseries",
    ({ request }) => {
      const url = new URL(request.url);
      const rawDr = url.searchParams.get("date_range");
      const dateRange =
        rawDr === "last-7-days" || rawDr === "last-30-days" || rawDr === "last-90-days" ? rawDr : undefined;
      const body = buildAdminAnalyticsTimeseries({
        dateRange,
        city: url.searchParams.get("city") ?? undefined,
        listingType: url.searchParams.get("listing_type") ?? undefined,
        from: url.searchParams.get("from") ?? undefined,
        to: url.searchParams.get("to") ?? undefined,
      });
      return HttpResponse.json(body);
    }
  ),

  http.get(
    ({ request }) => pathname(request) === "/api/v1/admin/dashboard/summary",
    () =>
      HttpResponse.json({
        kpis: adminDashboardKpisCatalog.map((item) => ({ ...item })),
        activities: adminDashboardActivitiesCatalog.map((item) => ({ ...item })),
      })
  ),

  http.get(
    ({ request }) => pathname(request).startsWith("/api/v1/admin/listings"),
    ({ request }) => {
      const status = new URL(request.url).searchParams.get("status");
      const items = status ? adminListings.filter((listing) => listing.status === status) : adminListings;

      return HttpResponse.json({
        items,
        total: items.length,
        page: 1,
        page_size: 20,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      });
    }
  ),

  http.patch(
    ({ request }) => /^\/api\/v1\/admin\/listings\/[^/]+\/approve$/.test(pathname(request)),
    ({ request }) => {
      const id = pathname(request).split("/")[5];
      const listing = mockListingsWithRentVariants.find((l) => l.id === id);
      if (!listing) return HttpResponse.json({ detail: "Listing not found" }, { status: 404 });
      return HttpResponse.json({ ...listing, status: "active" as const, is_verified: true });
    }
  ),

  http.patch(
    ({ request }) => /^\/api\/v1\/admin\/listings\/[^/]+\/reject$/.test(pathname(request)),
    ({ request }) => {
      const id = pathname(request).split("/")[5];
      const listing = mockListingsWithRentVariants.find((l) => l.id === id);
      if (!listing) return HttpResponse.json({ detail: "Listing not found" }, { status: 404 });
      return HttpResponse.json({ ...listing, status: "rejected" as const });
    }
  ),

  http.get(
    ({ request }) => pathname(request).startsWith("/api/v1/admin/users"),
    () =>
      HttpResponse.json({
        items: [mockRenter, mockOwner, mockAdmin],
        total: 3,
        page: 1,
        page_size: 20,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      })
  ),

  http.patch(
    ({ request }) => /^\/api\/v1\/admin\/users\/[^/]+\/suspend$/.test(pathname(request)),
    ({ request }) => {
      const id = pathname(request).split("/")[5];
      return HttpResponse.json({ ...mockRenter, id, status: "suspended" as const });
    }
  ),

  http.get(
    ({ request }) => pathname(request).startsWith("/api/v1/admin/audit-log"),
    () =>
      HttpResponse.json({
        items: mockAuditLogs,
        total: mockAuditLogs.length,
        page: 1,
        page_size: 20,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      })
  ),

  http.get(
    ({ request }) => pathname(request) === "/api/v1/admin/analytics/overview",
    () => {
      const adminScenario = getAdminScenario();
      if (adminScenario.analyticsStatus) {
        return HttpResponse.json(adminScenario.analyticsBody ?? { detail: "Unexpected admin scenario error" }, { status: adminScenario.analyticsStatus });
      }
      if (adminScenario.analytics) {
        return HttpResponse.json(adminScenario.analytics);
      }
      return HttpResponse.json(mockAdminAnalytics);
    }
  ),
];
