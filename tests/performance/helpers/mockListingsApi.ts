import type { Page } from "@playwright/test";
import type { PerfSnapshot } from "./perfReport";

export interface ListingsMockOptions {
  totalItems: number;
  delayMs?: number;
}

export interface RequestCounter {
  getCount: (pathPrefix: string) => number;
  getEndpointAveragesMs: () => Record<string, number>;
  getEndpointMaxMs: () => Record<string, number>;
  getEndpointCounts: () => Record<string, number>;
  getDuplicateRequestKeys: (minCount?: number) => Array<{ key: string; count: number }>;
}

type PerfFinding = NonNullable<PerfSnapshot["findings"]>[number];

function makeListing(index: number) {
  return {
    id: `perf-listing-${index + 1}`,
    slug: `perf-listing-${index + 1}`,
    title: `Performance Listing ${index + 1}`,
    price: 25_000 + index * 100,
    price_period: "monthly",
    currency: "NPR",
    bedrooms: (index % 4) + 1,
    bathrooms: (index % 3) + 1,
    area_sqft: 800 + index * 3,
    listing_type: "apartment",
    furnishing: "semi",
    status: "active",
    is_verified: true,
    pets_allowed: true,
    parking: true,
    location: {
      city: "Kathmandu",
      district: "Kathmandu",
      locality: {
        id: "nbh-perf",
        name: "Thamel",
        slug: "thamel",
      },
      latitude: 27.7172,
      longitude: 85.324,
      address_line: "Thamel Marg",
    },
    images: [
      {
        id: `img-${index + 1}`,
        listing_id: `perf-listing-${index + 1}`,
        image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
        webp_url: null,
        storage_key: "",
        alt_text: "Listing image",
        sort_order: 0,
        is_primary: true,
        is_cover: true,
      },
    ],
    created_at: "2025-01-01T00:00:00Z",
  };
}

export function buildSearchFlowFindings(input: {
  initialLoadMs?: number;
  listingsRequestCount?: number;
  filterInteractionMs?: number;
  listingsRequestsPerFilterChange?: number;
}): PerfFinding[] {
  const findings: PerfFinding[] = [];

  if (typeof input.initialLoadMs === "number" && input.initialLoadMs >= 3000) {
    findings.push({
      id: "slow_initial_load",
      title: "Initial apartments load exceeds budget",
      impact: "high",
      confidence: "high",
      effort: "M",
      metricValue: Number(input.initialLoadMs.toFixed(2)),
      action: "defer non-critical rendering work and reduce blocking network dependencies",
    });
  }

  if (typeof input.listingsRequestCount === "number" && input.listingsRequestCount > 1) {
    findings.push({
      id: "duplicate_initial_listings_fetch",
      title: "Initial load triggers duplicate listings requests",
      impact: "medium",
      confidence: "high",
      effort: "M",
      metricValue: input.listingsRequestCount,
      action: "stabilize initial query key and URL-derived params to avoid duplicate fetches",
    });
  }

  if (typeof input.filterInteractionMs === "number" && input.filterInteractionMs >= 1000) {
    findings.push({
      id: "slow_filter_to_ui",
      title: "Filter interaction exceeds target latency",
      impact: "medium",
      confidence: "high",
      effort: "M",
      metricValue: Number(input.filterInteractionMs.toFixed(2)),
      action: "reduce synchronous work in filter handlers and derived transforms",
    });
  }

  if (
    typeof input.listingsRequestsPerFilterChange === "number" &&
    input.listingsRequestsPerFilterChange > 2
  ) {
    findings.push({
      id: "duplicate_listings_fetch",
      title: "Single filter change triggers excess listings requests",
      impact: "high",
      confidence: "high",
      effort: "M",
      metricValue: input.listingsRequestsPerFilterChange,
      action: "stabilize URL-sync and query invalidation boundaries after filter changes",
    });
  }

  return findings;
}

export async function installListingsMocks(page: Page, options: ListingsMockOptions): Promise<RequestCounter> {
  const counters = new Map<string, number>();
  const inc = (key: string) => counters.set(key, (counters.get(key) ?? 0) + 1);
  const requestStart = new WeakMap<object, number>();
  const endpointDurationSums = new Map<string, number>();
  const endpointDurationMax = new Map<string, number>();
  const endpointDurationCounts = new Map<string, number>();
  const requestKeyCounts = new Map<string, number>();

  page.on("request", (request) => {
    const url = new URL(request.url());
    inc(url.pathname);
    requestStart.set(request, performance.now());
    const requestKey = `${request.method()} ${url.pathname}?${url.searchParams.toString()}`;
    requestKeyCounts.set(requestKey, (requestKeyCounts.get(requestKey) ?? 0) + 1);
  });

  page.on("response", (response) => {
    const req = response.request();
    const startedAt = requestStart.get(req);
    if (startedAt == null) return;
    const duration = performance.now() - startedAt;
    const pathname = new URL(req.url()).pathname;
    endpointDurationSums.set(pathname, (endpointDurationSums.get(pathname) ?? 0) + duration);
    endpointDurationCounts.set(pathname, (endpointDurationCounts.get(pathname) ?? 0) + 1);
    endpointDurationMax.set(pathname, Math.max(endpointDurationMax.get(pathname) ?? 0, duration));
  });

  const items = Array.from({ length: options.totalItems }, (_, i) => makeListing(i));

  await page.route("**/api/v1/listings**", async (route) => {
    if (options.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items,
        total: items.length,
        page: 1,
        page_size: Math.max(20, items.length),
        total_pages: 1,
        has_next: false,
        has_prev: false,
      }),
    });
  });

  await page.route("**/api/v1/favorites**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    });
  });

  await page.route("**/api/v1/amenities**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    });
  });

  return {
    getCount: (pathPrefix: string) => {
      let total = 0;
      for (const [key, value] of counters.entries()) {
        if (key.startsWith(pathPrefix)) total += value;
      }
      return total;
    },
    getEndpointAveragesMs: () => {
      const out: Record<string, number> = {};
      for (const [endpoint, sum] of endpointDurationSums.entries()) {
        const count = endpointDurationCounts.get(endpoint) ?? 1;
        out[endpoint] = Number((sum / count).toFixed(2));
      }
      return out;
    },
    getEndpointMaxMs: () => {
      const out: Record<string, number> = {};
      for (const [endpoint, max] of endpointDurationMax.entries()) {
        out[endpoint] = Number(max.toFixed(2));
      }
      return out;
    },
    getEndpointCounts: () => {
      const out: Record<string, number> = {};
      for (const [endpoint, count] of endpointDurationCounts.entries()) {
        out[endpoint] = count;
      }
      return out;
    },
    getDuplicateRequestKeys: (minCount = 2) => {
      return [...requestKeyCounts.entries()]
        .filter(([, count]) => count >= minCount)
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count);
    },
  };
}
