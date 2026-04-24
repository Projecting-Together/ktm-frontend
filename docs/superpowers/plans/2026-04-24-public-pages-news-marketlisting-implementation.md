# Public Pages + News + MarketListing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship launch-ready public pages and add dynamic `News` plus separate `MarketListing` modules with role-based publishing workflows.

**Architecture:** Keep static pages simple and code-managed in public routes, while implementing `News` and `MarketListing` as independent modules with separate contracts, API client methods, and management/admin surfaces. Reuse existing UI patterns (`Navbar`, `Footer`, badges, cards, table/list layouts) to reduce regression risk and keep behavior consistent with the current app.

**Tech Stack:** Next.js 15 App Router, TypeScript, React Query hooks, existing typed API client (`src/lib/api/client.ts`), Jest (`next/jest`), Playwright smoke checks, pnpm.

---

## File Structure and Responsibilities

- `src/app/(public)/about/page.tsx` - static company overview page
- `src/app/(public)/contact/page.tsx` - static contact + support channels page
- `src/app/(public)/privacy/page.tsx` - static privacy policy page
- `src/app/(public)/terms/page.tsx` - static terms of service page
- `src/app/(public)/news/page.tsx` - public news listing page
- `src/app/(public)/news/[slug]/page.tsx` - public news detail page
- `src/app/(public)/market-listing/page.tsx` - public market listing index page
- `src/app/(public)/market-listing/[slug]/page.tsx` - public market listing detail page
- `src/app/manage/news/page.tsx` - creator-side news management
- `src/app/manage/market-listing/page.tsx` - creator-side market listing management
- `src/app/admin/news/page.tsx` - admin moderation for news
- `src/app/admin/market-listing/page.tsx` - admin moderation for market listings
- `src/lib/contracts/news.ts` - typed news domain contract
- `src/lib/contracts/marketListing.ts` - typed market-listing domain contract
- `src/lib/api/types.ts` - API response/request type additions for both modules
- `src/lib/api/client.ts` - new API functions for listing/detail/create/update/status transitions
- `src/lib/hooks/useNews.ts` - React Query hooks for news flows
- `src/lib/hooks/useMarketListings.ts` - React Query hooks for market listing flows
- `src/components/layout/Navbar.tsx` - top-level navigation link additions
- `src/components/layout/Footer.tsx` - footer navigation/legal link alignment
- `tests/unit/contracts/news-contract.test.ts` - contract validity and state rules
- `tests/unit/contracts/market-listing-contract.test.ts` - contract/state rule tests
- `tests/integration/api/news.test.ts` - API client tests for news
- `tests/integration/api/market-listings.test.ts` - API client tests for market listing
- `tests/unit/components/layout/navigation-public-links.test.tsx` - nav/footer link assertions
- `tests/integration/news/public-news-pages.test.tsx` - news page rendering + filtering behavior
- `tests/integration/market-listing/public-market-pages.test.tsx` - market pages rendering + visibility behavior

---

### Task 1: Baseline and Domain Contract Scaffolding

**Files:**
- Create: `src/lib/contracts/news.ts`
- Create: `src/lib/contracts/marketListing.ts`
- Create: `tests/unit/contracts/news-contract.test.ts`
- Create: `tests/unit/contracts/market-listing-contract.test.ts`
- Modify: `src/lib/contracts/adapters.ts`
- Test: `tests/unit/contracts/news-contract.test.ts`, `tests/unit/contracts/market-listing-contract.test.ts`

- [ ] **Step 1: Write failing contract tests for status transitions**

```ts
// tests/unit/contracts/news-contract.test.ts
import { canPublishNews } from "@/lib/contracts/news";

describe("news publishing policy", () => {
  it("blocks owners from direct publish", () => {
    expect(canPublishNews("owner")).toBe(false);
  });

  it("allows trusted agents and admins", () => {
    expect(canPublishNews("agent")).toBe(true);
    expect(canPublishNews("admin")).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to confirm failures**

Run: `pnpm test -- tests/unit/contracts/news-contract.test.ts tests/unit/contracts/market-listing-contract.test.ts`  
Expected: FAIL with missing exports/functions.

- [ ] **Step 3: Implement minimal domain contracts**

```ts
// src/lib/contracts/news.ts
export type ContentStatus = "draft" | "pending_review" | "published" | "rejected";
export type PublisherRole = "owner" | "agent" | "admin";

export function canPublishNews(role: PublisherRole): boolean {
  return role === "agent" || role === "admin";
}
```

- [ ] **Step 4: Add market-listing contract in parallel**

```ts
// src/lib/contracts/marketListing.ts
export type MarketListingStatus = "draft" | "pending_review" | "published" | "rejected";

export function nextStatusForSubmit(role: PublisherRole): MarketListingStatus {
  return role === "owner" ? "pending_review" : "published";
}
```

- [ ] **Step 5: Re-run contract tests**

Run: `pnpm test -- tests/unit/contracts/news-contract.test.ts tests/unit/contracts/market-listing-contract.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/contracts/news.ts src/lib/contracts/marketListing.ts src/lib/contracts/adapters.ts tests/unit/contracts/news-contract.test.ts tests/unit/contracts/market-listing-contract.test.ts
git commit -m "feat: add news and market listing publishing contracts"
```

---

### Task 2: Add Static Public Pages and Navigation Wiring

**Files:**
- Create: `src/app/(public)/about/page.tsx`
- Create: `src/app/(public)/contact/page.tsx`
- Create: `src/app/(public)/privacy/page.tsx`
- Create: `src/app/(public)/terms/page.tsx`
- Modify: `src/components/layout/Navbar.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Create: `tests/unit/components/layout/navigation-public-links.test.tsx`
- Test: `tests/unit/components/layout/navigation-public-links.test.tsx`

- [ ] **Step 1: Write failing navigation test**

```ts
// tests/unit/components/layout/navigation-public-links.test.tsx
it("shows public platform-completeness links", () => {
  render(<Navbar />);
  expect(screen.getByRole("link", { name: "News" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "MarketListing" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the navigation test to verify failure**

Run: `pnpm test -- tests/unit/components/layout/navigation-public-links.test.tsx`  
Expected: FAIL because links are missing.

- [ ] **Step 3: Add new nav/footer link entries**

```ts
// src/components/layout/Navbar.tsx
const NAV_LINKS = [
  { href: "/apartments", label: "Apartments" },
  { href: "/agents", label: "Agents" },
  { href: "/news", label: "News" },
  { href: "/market-listing", label: "MarketListing" },
];
```

- [ ] **Step 4: Add static page route components**

```tsx
// src/app/(public)/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <section className="container py-12">
      <h1>Privacy Policy</h1>
      <p className="mt-4 text-muted-foreground">How KTM Apartments handles your data.</p>
    </section>
  );
}
```

- [ ] **Step 5: Re-run unit tests**

Run: `pnpm test -- tests/unit/components/layout/navigation-public-links.test.tsx`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/(public)/about/page.tsx src/app/(public)/contact/page.tsx src/app/(public)/privacy/page.tsx src/app/(public)/terms/page.tsx src/components/layout/Navbar.tsx src/components/layout/Footer.tsx tests/unit/components/layout/navigation-public-links.test.tsx
git commit -m "feat: add static public pages and navigation links"
```

---

### Task 3: Extend API Types and Client for News

**Files:**
- Modify: `src/lib/api/types.ts`
- Modify: `src/lib/api/client.ts`
- Create: `src/lib/hooks/useNews.ts`
- Create: `tests/integration/api/news.test.ts`
- Test: `tests/integration/api/news.test.ts`

- [ ] **Step 1: Write failing API integration test for news list/detail**

```ts
// tests/integration/api/news.test.ts
import { getNewsPosts, getNewsPostBySlug } from "@/lib/api/client";

it("builds published-only list query", async () => {
  await getNewsPosts({ status: "published", limit: 12 });
  // assert mocked fetch called with /news?status=published&limit=12
});
```

- [ ] **Step 2: Run news API test to verify failure**

Run: `pnpm test -- tests/integration/api/news.test.ts`  
Expected: FAIL with missing `getNewsPosts`.

- [ ] **Step 3: Add News request/response types**

```ts
// src/lib/api/types.ts
export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  status: "draft" | "pending_review" | "published" | "rejected";
  published_at?: string | null;
}
```

- [ ] **Step 4: Add typed news client methods**

```ts
// src/lib/api/client.ts
export async function getNewsPosts(filters: { status?: string; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.limit) params.set("limit", String(filters.limit));
  const q = params.toString();
  return apiFetch<PaginatedResponse<NewsPost>>(q ? `/news?${q}` : "/news", {}, false);
}
```

- [ ] **Step 5: Add React Query hooks for News**

```ts
// src/lib/hooks/useNews.ts
export function usePublicNewsList() {
  return useQuery({ queryKey: ["news", "published"], queryFn: () => getNewsPosts({ status: "published" }) });
}
```

- [ ] **Step 6: Re-run news API tests**

Run: `pnpm test -- tests/integration/api/news.test.ts`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/api/types.ts src/lib/api/client.ts src/lib/hooks/useNews.ts tests/integration/api/news.test.ts
git commit -m "feat: add news api types client methods and hooks"
```

---

### Task 4: Build Public and Manage/Admin News Pages

**Files:**
- Create: `src/app/(public)/news/page.tsx`
- Create: `src/app/(public)/news/[slug]/page.tsx`
- Create: `src/app/manage/news/page.tsx`
- Create: `src/app/admin/news/page.tsx`
- Create: `tests/integration/news/public-news-pages.test.tsx`
- Test: `tests/integration/news/public-news-pages.test.tsx`

- [ ] **Step 1: Write failing page integration test for published-only visibility**

```tsx
// tests/integration/news/public-news-pages.test.tsx
it("renders only published news on public index", async () => {
  // mock API with draft + published rows
  // assert only published title is displayed
});
```

- [ ] **Step 2: Run the news page test and verify failure**

Run: `pnpm test -- tests/integration/news/public-news-pages.test.tsx`  
Expected: FAIL because `news/page.tsx` route is missing.

- [ ] **Step 3: Implement public index/detail pages**

```tsx
// src/app/(public)/news/page.tsx
export default async function NewsPage() {
  const res = await getNewsPosts({ status: "published", limit: 24 });
  const posts = res.data?.items ?? [];
  return <NewsListingSection posts={posts} />;
}
```

- [ ] **Step 4: Implement manage/admin pages with role-aware status actions**

```tsx
// src/app/manage/news/page.tsx
// owner -> submit for review, agent -> publish action available
```

- [ ] **Step 5: Re-run integration tests**

Run: `pnpm test -- tests/integration/news/public-news-pages.test.tsx`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/(public)/news/page.tsx src/app/(public)/news/[slug]/page.tsx src/app/manage/news/page.tsx src/app/admin/news/page.tsx tests/integration/news/public-news-pages.test.tsx
git commit -m "feat: add news public routes and moderation pages"
```

---

### Task 5: Extend API Types and Client for MarketListing

**Files:**
- Modify: `src/lib/api/types.ts`
- Modify: `src/lib/api/client.ts`
- Create: `src/lib/hooks/useMarketListings.ts`
- Create: `tests/integration/api/market-listings.test.ts`
- Test: `tests/integration/api/market-listings.test.ts`

- [ ] **Step 1: Write failing market-listing API tests**

```ts
// tests/integration/api/market-listings.test.ts
import { getMarketListings, getMarketListingBySlug } from "@/lib/api/client";

it("requests market listings with filters", async () => {
  await getMarketListings({ status: "published", property_type: "apartment" });
  // assert path contains /market-listings
});
```

- [ ] **Step 2: Run test and confirm failure**

Run: `pnpm test -- tests/integration/api/market-listings.test.ts`  
Expected: FAIL with missing market-listing client exports.

- [ ] **Step 3: Add market-listing types**

```ts
// src/lib/api/types.ts
export interface MarketListing {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: "NPR" | "USD";
  location: string;
  property_type: "apartment" | "house" | "commercial" | "land";
  status: "draft" | "pending_review" | "published" | "rejected";
}
```

- [ ] **Step 4: Implement market-listing client + hooks**

```ts
// src/lib/api/client.ts
export async function getMarketListings(filters: Record<string, string | number> = {}) {
  const q = new URLSearchParams(Object.entries(filters).map(([k, v]) => [k, String(v)])).toString();
  return apiFetch<PaginatedResponse<MarketListing>>(q ? `/market-listings?${q}` : "/market-listings", {}, false);
}
```

- [ ] **Step 5: Re-run integration tests**

Run: `pnpm test -- tests/integration/api/market-listings.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/api/types.ts src/lib/api/client.ts src/lib/hooks/useMarketListings.ts tests/integration/api/market-listings.test.ts
git commit -m "feat: add market listing api types client methods and hooks"
```

---

### Task 6: Build Public and Manage/Admin MarketListing Pages

**Files:**
- Create: `src/app/(public)/market-listing/page.tsx`
- Create: `src/app/(public)/market-listing/[slug]/page.tsx`
- Create: `src/app/manage/market-listing/page.tsx`
- Create: `src/app/admin/market-listing/page.tsx`
- Create: `tests/integration/market-listing/public-market-pages.test.tsx`
- Test: `tests/integration/market-listing/public-market-pages.test.tsx`

- [ ] **Step 1: Write failing integration test for public market index/detail**

```tsx
// tests/integration/market-listing/public-market-pages.test.tsx
it("renders published market listings and links to detail page", async () => {
  // mock published + pending records, assert only published appear
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `pnpm test -- tests/integration/market-listing/public-market-pages.test.tsx`  
Expected: FAIL because routes do not exist.

- [ ] **Step 3: Implement public market routes**

```tsx
// src/app/(public)/market-listing/page.tsx
export default async function MarketListingPage() {
  const res = await getMarketListings({ status: "published", limit: 24 });
  return <MarketListingGrid items={res.data?.items ?? []} />;
}
```

- [ ] **Step 4: Implement manage/admin moderation pages**

```tsx
// src/app/admin/market-listing/page.tsx
// table with approve/reject/unpublish actions and rejection reason modal
```

- [ ] **Step 5: Run tests**

Run: `pnpm test -- tests/integration/market-listing/public-market-pages.test.tsx`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/(public)/market-listing/page.tsx src/app/(public)/market-listing/[slug]/page.tsx src/app/manage/market-listing/page.tsx src/app/admin/market-listing/page.tsx tests/integration/market-listing/public-market-pages.test.tsx
git commit -m "feat: add market listing public and moderation pages"
```

---

### Task 7: Role-Transition Guards and Submission UX

**Files:**
- Modify: `src/lib/hooks/useNews.ts`
- Modify: `src/lib/hooks/useMarketListings.ts`
- Modify: `src/app/manage/news/page.tsx`
- Modify: `src/app/manage/market-listing/page.tsx`
- Modify: `src/app/admin/news/page.tsx`
- Modify: `src/app/admin/market-listing/page.tsx`
- Test: `tests/unit/contracts/news-contract.test.ts`, `tests/unit/contracts/market-listing-contract.test.ts`, page integration tests

- [ ] **Step 1: Add failing test for owner submit path**

```ts
it("forces owner submission to pending_review", () => {
  expect(nextStatusForSubmit("owner")).toBe("pending_review");
});
```

- [ ] **Step 2: Run focused tests**

Run: `pnpm test -- tests/unit/contracts/news-contract.test.ts tests/unit/contracts/market-listing-contract.test.ts`  
Expected: FAIL if transition logic drifted.

- [ ] **Step 3: Implement explicit transition helper usage in manage pages**

```ts
const targetStatus = nextStatusForSubmit(user.role);
await mutateAsync({ ...payload, status: targetStatus });
```

- [ ] **Step 4: Add admin moderation actions**

```ts
await adminTransitionNews({ id, action: "approve" });
await adminTransitionMarketListing({ id, action: "reject", reason });
```

- [ ] **Step 5: Re-run all impacted tests**

Run: `pnpm test -- tests/unit/contracts/news-contract.test.ts tests/unit/contracts/market-listing-contract.test.ts tests/integration/news/public-news-pages.test.tsx tests/integration/market-listing/public-market-pages.test.tsx`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/hooks/useNews.ts src/lib/hooks/useMarketListings.ts src/app/manage/news/page.tsx src/app/manage/market-listing/page.tsx src/app/admin/news/page.tsx src/app/admin/market-listing/page.tsx tests/unit/contracts/news-contract.test.ts tests/unit/contracts/market-listing-contract.test.ts
git commit -m "feat: enforce role-based status transitions for news and market listing"
```

---

### Task 8: Full Verification and Docs Sync

**Files:**
- Modify: `docs/superpowers/specs/2026-04-24-public-pages-news-marketlisting-design.md` (only if implementation decisions changed)
- Modify: `README.md` or `docs/**` references (if public route maps are documented)
- Test: all new/changed test suites + build

- [ ] **Step 1: Run targeted unit/integration suites**

Run:
```bash
pnpm test -- tests/unit/contracts/news-contract.test.ts tests/unit/contracts/market-listing-contract.test.ts tests/unit/components/layout/navigation-public-links.test.tsx tests/integration/api/news.test.ts tests/integration/api/market-listings.test.ts tests/integration/news/public-news-pages.test.tsx tests/integration/market-listing/public-market-pages.test.tsx
```
Expected: PASS.

- [ ] **Step 2: Run global quality gates**

Run:
```bash
pnpm check
pnpm test
pnpm build
```
Expected: all commands exit 0.

- [ ] **Step 3: Optional smoke list for e2e route coverage**

Run: `pnpm test:e2e -- --list`  
Expected: includes coverage for `/about`, `/contact`, `/privacy`, `/terms`, `/news`, `/market-listing`.

- [ ] **Step 4: Commit final stabilization updates**

```bash
git add -A
git commit -m "test: verify public pages and content modules for release readiness"
```

---

## Spec Coverage Check

- Static pages (`Contact`, `About`, `Privacy`, `Terms`): Task 2
- Dynamic `News` module with public + manage/admin flows: Tasks 3 and 4
- Dynamic separate `MarketListing` module: Tasks 5 and 6
- Role policy (admin + agents + owners, trusted agent auto-publish, owner approval): Tasks 1 and 7
- Navigation/footer platform completeness: Task 2
- Error handling + publish visibility guard: Tasks 3, 4, 5, 6, and 7
- Testing expectations (unit/integration/e2e smoke + build): Task 8

## Placeholder Scan

- No `TODO`, `TBD`, or deferred placeholders used.
- Every task includes explicit files, concrete commands, and expected outcomes.
- Test-first workflow is explicit for each behavior group.

## Type and Path Consistency Check

- Status values are consistently `draft`, `pending_review`, `published`, `rejected`.
- Route paths are consistently `/news` and `/market-listing`.
- Public visibility is consistently `published` only.
