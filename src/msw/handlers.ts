/**
 * MSW handlers aligned with `lib/api/client.ts` paths.
 * Requests use `NEXT_PUBLIC_API_URL` as origin + `/listings/`, etc. — pathname is always `/api/v1/...`.
 */
import { http, HttpResponse, passthrough } from "msw";
import type { ListingStats } from "@/lib/api/types";
import { scenarioCatalog } from "@/msw/mockScenarioData";
import { resolveScenarioState } from "@/msw/mockScenarioSelector";
import {
  mockListingsPage1,
  mockThamelListings,
  mockPendingListings,
  mockListings,
  mockListingItems,
  mockNeighborhoods,
  mockRenter,
  mockOwner,
  mockAdmin,
  mockAuthTokens,
  mockOwnerAuthTokens,
  mockInquiries,
  mockVisitRequests,
  mockFavorites,
  mockAdminAnalytics,
  mockAuditLogs,
  mockAmenities,
  mockRentListingVariants,
} from "@/test-utils/mockData";
import { adminListings } from "@/lib/mocks/admin/listings";

const mockAdminAuthTokens = {
  access_token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItYWRtaW4tMDAxIiwiZW1haWwiOiJhZG1pbkBrdG1hcGFydG1lbnRzLmNvbSIsInJvbGUiOiJhZG1pbiIsInN0YXR1cyI6ImFjdGl2ZSIsImlhdCI6MTcxMDAwMDAwMCwiZXhwIjoxNzEwMDAwOTAwfQ.mock_signature",
  refresh_token: "mock-refresh-admin",
  token_type: "bearer" as const,
};

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

function filterListingItems(request: Request) {
  const url = new URL(request.url);
  const neighborhood = url.searchParams.get("neighborhood");
  const status = url.searchParams.get("status");
  const priceMax = url.searchParams.get("price_max") ?? url.searchParams.get("max_price");
  const beds = url.searchParams.get("beds") ?? url.searchParams.get("bedrooms");
  const furnishing = url.searchParams.get("furnishing");
  const verified = url.searchParams.get("verified");

  if (status === "pending") return mockPendingListings;
  if (neighborhood === "thamel") return mockThamelListings;

  let filtered = [...mockListingItems];
  if (priceMax) filtered = filtered.filter((l) => Number(l.price) <= Number(priceMax));
  if (beds) filtered = filtered.filter((l) => (l.bedrooms ?? 0) >= Number(beds));
  if (furnishing) filtered = filtered.filter((l) => l.furnishing === furnishing);
  if (verified === "true") filtered = filtered.filter((l) => l.is_verified);

  return {
    ...mockListingsPage1,
    items: filtered,
    total: filtered.length,
  };
}

export const handlers = [
  passthroughNextAssets,
  // ── AUTH ──────────────────────────────────────────────────────────────────
  http.post(
    ({ request }) => pathname(request) === "/api/v1/auth/login",
    async ({ request }) => {
      const body = (await request.json()) as { email: string; password: string };
      if (body.email === "ram.sharma@gmail.com" && body.password === "password123") {
        return HttpResponse.json(mockAuthTokens);
      }
      if (body.email === "sita.thapa@gmail.com" && body.password === "password123") {
        return HttpResponse.json(mockOwnerAuthTokens);
      }
      if (body.email === "admin@ktmapartments.com" && body.password === "password123") {
        return HttpResponse.json(mockAdminAuthTokens);
      }
      return HttpResponse.json({ detail: "Invalid email or password" }, { status: 401 });
    }
  ),

  http.post(
    ({ request }) => pathname(request) === "/api/v1/auth/register",
    async ({ request }) => {
      const body = (await request.json()) as { email: string; password: string };
      if (body.email === "existing@gmail.com") {
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
      return HttpResponse.json(mockRenter);
    }
  ),

  // ── LISTINGS (specific paths before `/listings/:id`) ─────────────────────
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
        id: "lst-new-001",
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
      return HttpResponse.json({
        upload_url: `https://r2.ktmapartments.com/upload/${body.filename}?token=mock`,
        storage_key: `listings/mock/${body.filename}`,
        public_url: `https://images.ktmapartments.com/listings/mock/${body.filename}`,
      });
    }
  ),

  http.post(
    ({ request }) => pathname(request) === "/api/v1/media/confirm",
    async () =>
      HttpResponse.json({
        id: "img-new-001",
      })
  ),

  http.delete(
    ({ request }) => /^\/api\/v1\/media\/[^/]+$/.test(pathname(request)),
    () => HttpResponse.json(null, { status: 204 })
  ),

  // ── AMENITIES / NEIGHBORHOODS ───────────────────────────────────────────────
  http.get(
    ({ request }) => /^\/api\/v1\/amenities\/?/.test(pathname(request)),
    () => HttpResponse.json(mockAmenities)
  ),

  http.get(
    ({ request }) => pathname(request) === "/api/v1/neighborhoods" || pathname(request) === "/api/v1/neighborhoods/",
    () => HttpResponse.json(mockNeighborhoods)
  ),

  http.get(
    ({ request }) => /^\/api\/v1\/neighborhoods\/[^/]+$/.test(pathname(request)),
    ({ request }) => {
      const slug = pathname(request).split("/").pop()!;
      const nbh = mockNeighborhoods.find((n) => n.slug === slug);
      if (!nbh) return HttpResponse.json({ detail: "Neighborhood not found" }, { status: 404 });
      return HttpResponse.json(nbh);
    }
  ),

  // ── INQUIRIES ─────────────────────────────────────────────────────────────
  http.post(
    ({ request }) => pathname(request) === "/api/v1/inquiries",
    async ({ request }) => {
      const body = (await request.json()) as { listing_id: string; message: string; move_in_date?: string | null };
      const newInquiry = {
        ...mockInquiries[0],
        id: "inq-new-001",
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
        id: "vis-new-001",
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
          user_id: "usr-renter-001",
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
