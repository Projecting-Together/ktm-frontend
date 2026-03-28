import { http, HttpResponse } from "msw";
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
  mockReports,
} from "@/test-utils/mockData";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const handlers = [
  // ── AUTH ──────────────────────────────────────────────────────────────────
  http.post(`${API}/api/v1/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    if (body.email === "ram.sharma@gmail.com" && body.password === "password123") {
      return HttpResponse.json({ tokens: mockAuthTokens, user: mockRenter });
    }
    if (body.email === "sita.thapa@gmail.com" && body.password === "password123") {
      return HttpResponse.json({ tokens: mockOwnerAuthTokens, user: mockOwner });
    }
    return HttpResponse.json(
      { detail: "Invalid email or password" },
      { status: 401 }
    );
  }),

  http.post(`${API}/api/v1/auth/register`, async ({ request }) => {
    const body = await request.json() as { email: string; role: string };
    if (body.email === "existing@gmail.com") {
      return HttpResponse.json(
        { detail: "Email already registered" },
        { status: 409 }
      );
    }
    return HttpResponse.json(
      {
        tokens: mockAuthTokens,
        user: { ...mockRenter, email: body.email, role: body.role },
      },
      { status: 201 }
    );
  }),

  http.post(`${API}/api/v1/auth/logout`, () => {
    return HttpResponse.json({ message: "Logged out successfully" });
  }),

  http.get(`${API}/api/v1/auth/me`, ({ request }) => {
    const auth = request.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return HttpResponse.json({ detail: "Not authenticated" }, { status: 401 });
    }
    if (auth.includes("owner")) {
      return HttpResponse.json(mockOwner);
    }
    return HttpResponse.json(mockRenter);
  }),

  // ── LISTINGS ──────────────────────────────────────────────────────────────
  http.get(`${API}/api/v1/listings`, ({ request }) => {
    const url = new URL(request.url);
    const neighborhood = url.searchParams.get("neighborhood");
    const status = url.searchParams.get("status");
    const priceMax = url.searchParams.get("price_max") ?? url.searchParams.get("max_price");
    const beds = url.searchParams.get("beds") ?? url.searchParams.get("bedrooms");
    const furnishing = url.searchParams.get("furnishing");
    const verified = url.searchParams.get("verified");

    // Simulate backend filtering
    if (status === "pending") return HttpResponse.json(mockPendingListings);
    if (neighborhood === "thamel") return HttpResponse.json(mockThamelListings);

    let filtered = [...mockListingItems];
    if (priceMax) filtered = filtered.filter(l => Number(l.price) <= Number(priceMax));
    if (beds) filtered = filtered.filter(l => (l.bedrooms ?? 0) >= Number(beds));
    if (furnishing) filtered = filtered.filter(l => l.furnishing === furnishing);
    if (verified === "true") filtered = filtered.filter(l => l.is_verified);

    return HttpResponse.json({
      ...mockListingsPage1,
      items: filtered,
      total: filtered.length,
    });
  }),

  http.get(`${API}/api/v1/listings/:slug`, ({ params }) => {
    const listing = mockListings.find(
      (l) => l.slug === params.slug || l.id === params.slug
    );
    if (!listing) {
      return HttpResponse.json({ detail: "Listing not found" }, { status: 404 });
    }
    return HttpResponse.json(listing);
  }),

  http.post(`${API}/api/v1/listings`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const newListing = {
      ...mockListings[0],
      id: "lst-new-001",
      slug: `new-listing-${Date.now()}`,
      title: body.title ?? "New Listing",
      status: "pending",
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(newListing, { status: 201 });
  }),

  http.patch(`${API}/api/v1/listings/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const listing = mockListings.find((l) => l.id === params.id);
    if (!listing) {
      return HttpResponse.json({ detail: "Listing not found" }, { status: 404 });
    }
    return HttpResponse.json({ ...listing, ...body, updated_at: new Date().toISOString() });
  }),

  http.delete(`${API}/api/v1/listings/:id`, ({ params }) => {
    const listing = mockListings.find((l) => l.id === params.id);
    if (!listing) {
      return HttpResponse.json({ detail: "Listing not found" }, { status: 404 });
    }
    return HttpResponse.json({ message: "Listing deleted successfully" });
  }),

  http.post(`${API}/api/v1/listings/:id/publish`, ({ params }) => {
    const listing = mockListings.find((l) => l.id === params.id);
    if (!listing) {
      return HttpResponse.json({ detail: "Listing not found" }, { status: 404 });
    }
    return HttpResponse.json({ ...listing, status: "active" });
  }),

  // ── NEIGHBORHOODS ─────────────────────────────────────────────────────────
  http.get(`${API}/api/v1/neighborhoods`, () => {
    return HttpResponse.json({ items: mockNeighborhoods, total: mockNeighborhoods.length });
  }),

  http.get(`${API}/api/v1/neighborhoods/:slug`, ({ params }) => {
    const nbh = mockNeighborhoods.find((n) => n.slug === params.slug);
    if (!nbh) {
      return HttpResponse.json({ detail: "Neighborhood not found" }, { status: 404 });
    }
    return HttpResponse.json(nbh);
  }),

  // ── FAVORITES ─────────────────────────────────────────────────────────────
  http.get(`${API}/api/v1/users/me/favorites`, () => {
    return HttpResponse.json({ items: mockFavorites, total: mockFavorites.length });
  }),

  http.post(`${API}/api/v1/users/me/favorites/:listingId`, ({ params }) => {
    const newFav = {
      user_id: "usr-renter-001",
      listing_id: params.listingId as string,
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json(newFav, { status: 201 });
  }),

  http.delete(`${API}/api/v1/users/me/favorites/:listingId`, () => {
    return HttpResponse.json({ message: "Removed from favorites" });
  }),

  // ── INQUIRIES ─────────────────────────────────────────────────────────────
  http.get(`${API}/api/v1/users/me/inquiries`, () => {
    return HttpResponse.json({ items: mockInquiries, total: mockInquiries.length });
  }),

  http.post(`${API}/api/v1/listings/:id/inquiries`, async ({ params, request }) => {
    const body = await request.json() as { message: string; move_in_date?: string };
    const newInquiry = {
      ...mockInquiries[0],
      id: "inq-new-001",
      listing_id: params.id as string,
      message: body.message,
      move_in_date: body.move_in_date ?? null,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json(newInquiry, { status: 201 });
  }),

  http.get(`${API}/api/v1/manage/inquiries`, () => {
    return HttpResponse.json({ items: mockInquiries, total: mockInquiries.length });
  }),

  // ── VISIT REQUESTS ────────────────────────────────────────────────────────
  http.get(`${API}/api/v1/users/me/visits`, () => {
    return HttpResponse.json({ items: mockVisitRequests, total: mockVisitRequests.length });
  }),

  http.post(`${API}/api/v1/listings/:id/visits`, async ({ params, request }) => {
    const body = await request.json() as { preferred_date: string; notes?: string };
    const newVisit = {
      ...mockVisitRequests[0],
      id: "vis-new-001",
      listing_id: params.id as string,
      preferred_date: body.preferred_date,
      notes: body.notes ?? null,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json(newVisit, { status: 201 });
  }),

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  http.get(`${API}/api/v1/admin/listings`, () => {
    return HttpResponse.json(mockPendingListings);
  }),

  http.patch(`${API}/api/v1/admin/listings/:id/approve`, ({ params }) => {
    const listing = mockListings.find((l) => l.id === params.id);
    if (!listing) {
      return HttpResponse.json({ detail: "Listing not found" }, { status: 404 });
    }
    return HttpResponse.json({ ...listing, status: "active", is_verified: true });
  }),

  http.patch(`${API}/api/v1/admin/listings/:id/reject`, ({ params }) => {
    const listing = mockListings.find((l) => l.id === params.id);
    if (!listing) {
      return HttpResponse.json({ detail: "Listing not found" }, { status: 404 });
    }
    return HttpResponse.json({ ...listing, status: "rejected" });
  }),

  http.get(`${API}/api/v1/admin/users`, () => {
    return HttpResponse.json({
      items: [mockRenter, mockOwner, mockAdmin],
      total: 3,
      page: 1,
      page_size: 20,
      total_pages: 1,
    });
  }),

  http.patch(`${API}/api/v1/admin/users/:id/suspend`, ({ params }) => {
    return HttpResponse.json({ id: params.id, status: "suspended" });
  }),

  http.get(`${API}/api/v1/admin/analytics/overview`, () => {
    return HttpResponse.json(mockAdminAnalytics);
  }),

  http.get(`${API}/api/v1/admin/audit-log`, () => {
    return HttpResponse.json({ items: mockAuditLogs, total: mockAuditLogs.length });
  }),

  // ── MEDIA ─────────────────────────────────────────────────────────────────
  http.post(`${API}/api/v1/media/presigned-url`, async ({ request }) => {
    const body = await request.json() as { filename: string; content_type: string };
    return HttpResponse.json({
      upload_url: `https://r2.ktmapartments.com/upload/${body.filename}?token=mock`,
      storage_key: `listings/mock/${body.filename}`,
      public_url: `https://images.ktmapartments.com/listings/mock/${body.filename}`,
    });
  }),

  http.post(`${API}/api/v1/media/confirm`, async () => {
    return HttpResponse.json({
      id: "img-new-001",
      listing_id: "lst-001",
      image_url: "https://images.ktmapartments.com/listings/mock/image-1.jpg",
      webp_url: "https://images.ktmapartments.com/listings/mock/image-1.webp",
      storage_key: "listings/mock/image-1.webp",
      sort_order: 0,
      is_primary: false,
      is_cover: false,
      upload_status: "complete",
    });
  }),
];
