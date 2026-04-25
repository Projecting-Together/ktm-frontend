# Frontend Wave 3 — Loading, Islands, and ISR Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `docs/superpowers/specs/2026-04-24-frontend-wave3-loading-islands-isr-verification-design.md` in three milestones: **M1** route `loading.tsx` + documented UX intent, **M2** one NOW-3 island refactor (`/dashboard`) with build metric evidence, **M3** mocked perf coverage for public home ISR path (`VERIFY-02` baseline).

**Architecture:** M1 adds presentational `loading.tsx` files under `src/app/(public)/` segments (no data fetching). M2 moves `src/app/dashboard/page.tsx` to a server entry that renders `DashboardOverviewClient` (`"use client"`) containing all hooks. M3 adds `tests/performance/home-isr.mocked.perf.spec.ts` using existing `installListingsMocks` + `measureActionMs` + `writePerfSnapshot` patterns.

**Tech Stack:** Next.js 15 App Router, Playwright (`playwright.perf.config.ts`), Jest (unchanged unless regressions).

**Approved spec:** `docs/superpowers/specs/2026-04-24-frontend-wave3-loading-islands-isr-verification-design.md`

---

## Milestone route and file map

| Milestone | Deliverable |
| --- | --- |
| M1 | `docs/superpowers/loading-and-suspense-intent.md` + 6× `loading.tsx` under `(public)` |
| M2 | `src/app/dashboard/DashboardOverviewClient.tsx` + server `src/app/dashboard/page.tsx` |
| M3 | `tests/performance/home-isr.mocked.perf.spec.ts` |

**M1 `loading.tsx` paths (segment-level + leaf):**

- `src/app/(public)/loading.tsx` — intent: shared skeleton when moving between top-level marketing pages (home, about, contact, …).
- `src/app/(public)/news/loading.tsx` — intent: list shell while `getNews` resolves (`revalidate = 60`).
- `src/app/(public)/news/[slug]/loading.tsx` — intent: article chrome while detail resolves.
- `src/app/(public)/market-listing/loading.tsx` — intent: list shell while `getMarketListings` resolves.
- `src/app/(public)/market-listing/[slug]/loading.tsx` — intent: detail shell.
- `src/app/(public)/agents/loading.tsx` — intent: directory shell (matches agents index pattern).

**Existing (do not duplicate logic):** `src/app/(public)/apartments/loading.tsx` already exists; **extend** `loading-and-suspense-intent.md` to reference it and note coexistence with `apartments/page.tsx` inner `Suspense` for `SearchPageClient`.

---

### Task M1-1: Author loading intent doc

**Files:**
- Create: `docs/superpowers/loading-and-suspense-intent.md`

- [ ] **Step 1: Add document** with this structure (fill table rows for each file created in M1-2; apartments row references existing file):

```markdown
# Loading and Suspense intent (Wave 3)

Date: 2026-04-24

## Principles

- `loading.tsx` is **presentation-only** (no `fetch`).
- Coexistence: `/apartments` uses route `loading.tsx` for segment transitions **and** `Suspense` around `SearchPageClient` for client subtree streaming — different scopes (segment vs client island).

## Route boundaries

| File | UX intent |
| --- | --- |
| `src/app/(public)/loading.tsx` | Show marketing shell (container + skeleton hero blocks) while any `(public)` child segment loads. |
| `src/app/(public)/news/loading.tsx` | Show list-card skeletons while news index loads. |
| `src/app/(public)/news/[slug]/loading.tsx` | Show article skeleton while slug page loads. |
| `src/app/(public)/market-listing/loading.tsx` | Show feed card skeletons while market index loads. |
| `src/app/(public)/market-listing/[slug]/loading.tsx` | Show detail skeleton while market detail loads. |
| `src/app/(public)/agents/loading.tsx` | Show card grid skeleton while agents index loads. |
| `src/app/(public)/apartments/loading.tsx` | (Existing) Segment transition skeleton; pairs with inner Suspense on `apartments/page.tsx` for search UI. |

## Related

- `docs/superpowers/route-cache-intent.md`
- `docs/superpowers/specs/2026-04-24-frontend-wave3-loading-islands-isr-verification-design.md`
```

- [ ] **Step 2: Link from `docs/superpowers/route-cache-intent.md`** — add under “See also” a bullet: `- Loading / Suspense UX: docs/superpowers/loading-and-suspense-intent.md`

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/loading-and-suspense-intent.md docs/superpowers/route-cache-intent.md
git commit -m "docs: add Wave 3 loading and Suspense intent"
```

---

### Task M1-2: Add `loading.tsx` files

**Files:**
- Create: `src/app/(public)/loading.tsx`
- Create: `src/app/(public)/news/loading.tsx`
- Create: `src/app/(public)/news/[slug]/loading.tsx`
- Create: `src/app/(public)/market-listing/loading.tsx`
- Create: `src/app/(public)/market-listing/[slug]/loading.tsx`
- Create: `src/app/(public)/agents/loading.tsx`

- [ ] **Step 1: `(public)/loading.tsx`**

```tsx
export default function PublicSegmentLoading() {
  return (
    <div className="container py-10">
      <div className="skeleton mx-auto mb-6 h-10 max-w-lg" />
      <div className="skeleton mx-auto mb-10 h-5 max-w-xl" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="skeleton h-40 rounded-xl" />
        <div className="skeleton h-40 rounded-xl" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `news/loading.tsx`**

```tsx
export default function NewsIndexLoading() {
  return (
    <main className="container py-10">
      <div className="skeleton mx-auto mb-8 h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-48 rounded-xl" />
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: `news/[slug]/loading.tsx`**

```tsx
export default function NewsArticleLoading() {
  return (
    <main className="container max-w-3xl py-10">
      <div className="skeleton mb-4 h-6 w-32" />
      <div className="skeleton mb-6 h-10 w-full" />
      <div className="space-y-3">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 max-w-[90%]" />
      </div>
    </main>
  );
}
```

- [ ] **Step 4: `market-listing/loading.tsx`** — same grid skeleton as `news/loading.tsx` (duplicate is acceptable for YAGNI).

- [ ] **Step 5: `market-listing/[slug]/loading.tsx`** — same as `news/[slug]/loading.tsx`.

- [ ] **Step 6: `agents/loading.tsx`**

```tsx
export default function AgentsLoading() {
  return (
    <main className="container py-10">
      <div className="skeleton mx-auto mb-8 h-9 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[4/5] rounded-xl" />
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 7: Run typecheck**

Run: `npm run check`  
Expected: exit code 0.

- [ ] **Step 8: Manual smoke** — slow 3G in DevTools: navigate `/` → `/about` → `/news` and confirm skeletons flash without errors.

- [ ] **Step 9: Commit**

```bash
git add src/app/\(public\)/loading.tsx src/app/\(public\)/news/loading.tsx "src/app/(public)/news/[slug]/loading.tsx" src/app/\(public\)/market-listing/loading.tsx "src/app/(public)/market-listing/[slug]/loading.tsx" src/app/\(public\)/agents/loading.tsx
git commit -m "feat(ui): add public segment loading boundaries (Wave 3 M1)"
```

---

### Task M2-1: Baseline First Load JS for `/dashboard`

- [ ] **Step 1: Record baseline (before refactor)**

Run: `npm run build`  
In the terminal table, find the row for `ƒ /dashboard` (or `○ /dashboard` depending on Next version). Record the **First Load JS** value (string like `123 kB`) in `docs/superpowers/loading-and-suspense-intent.md` under a new section **“NOW-3 evidence”** as **Before** (or create `docs/superpowers/wave3-now3-dashboard-bundle.md` if you prefer a dedicated evidence file).

- [ ] **Step 2: Commit the evidence doc update** (can be combined with M2-2 if preferred).

---

### Task M2-2: Dashboard overview client island

**Files:**
- Create: `src/app/dashboard/DashboardOverviewClient.tsx`
- Modify: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create `DashboardOverviewClient.tsx`** — move entire contents of current `page.tsx` (including `"use client"`):

```tsx
"use client";
import Link from "next/link";
import { Heart, MessageCircle, Calendar, Eye } from "lucide-react";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useAuthStore } from "@/lib/stores/authStore";

export default function DashboardOverviewClient() {
  const { user } = useAuthStore();
  const { data: favorites } = useFavorites();

  const stats = [
    { label: "Saved Listings", value: favorites?.length ?? 0, icon: Heart, href: "/dashboard/favorites" },
    { label: "Active Inquiries", value: 0, icon: MessageCircle, href: "/dashboard/inquiries" },
    { label: "Visit Requests", value: 0, icon: Calendar, href: "/dashboard/visits" },
    { label: "Recently Viewed", value: 0, icon: Eye, href: "/dashboard/recently-viewed" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Welcome back{user?.profile?.first_name ? `, ${user.profile.first_name}` : ""}!
      </h1>
      <p className="mt-1 text-muted-foreground">{"Here's your rental activity overview."}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}
              className="rounded-xl border border-border bg-card p-5 transition-all hover:border-accent hover:shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-4xl mb-3">🏠</p>
        <h3 className="font-semibold">Start your search</h3>
        <p className="mt-1 text-sm text-muted-foreground">Browse thousands of verified apartments across Kathmandu.</p>
        <Link href="/apartments" className="btn-primary mt-4 inline-flex">Browse Apartments</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `src/app/dashboard/page.tsx`**

```tsx
import DashboardOverviewClient from "./DashboardOverviewClient";

export default function DashboardPage() {
  return <DashboardOverviewClient />;
}
```

- [ ] **Step 3: Run typecheck**

Run: `npm run check`  
Expected: 0.

- [ ] **Step 4: Run tests**

Run: `npm test`  
Expected: all pass.

- [ ] **Step 5: Record **After** First Load JS** — same `npm run build` step as M2-1; append to the same evidence section.

- [ ] **Step 6: Manual smoke** — logged-in user: `/dashboard` shows same UI, stats and links work.

- [ ] **Step 7: Commit**

```bash
git add src/app/dashboard/page.tsx src/app/dashboard/DashboardOverviewClient.tsx docs/superpowers/loading-and-suspense-intent.md
git commit -m "refactor(dashboard): server page shell with client overview island (Wave 3 M2)"
```

(Adjust paths if evidence lives in a separate file.)

---

### Task M3-1: Home ISR mocked perf spec (`VERIFY-02` baseline)

**Files:**
- Create: `tests/performance/home-isr.mocked.perf.spec.ts`

- [ ] **Step 1: Implement spec**

```typescript
import { expect, test } from "@playwright/test";
import { installListingsMocks, buildSearchFlowFindings } from "./helpers/mockListingsApi";
import { measureActionMs, writePerfSnapshot } from "./helpers/perfReport";

test.describe("Public home ISR (mocked perf)", () => {
  test.skip(process.env.PERF_USE_REAL_BACKEND === "1", "Mocked suite is skipped in real-backend mode.");

  test("home loads within budget (ISR route under perf harness)", async ({ page }, testInfo) => {
    const requests = await installListingsMocks(page, { totalItems: 16, delayMs: 35 });

    const firstMs = await measureActionMs(async () => {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(
        page.getByRole("heading", { name: /Find Your Perfect Home in\s*Kathmandu/i })
      ).toBeVisible({ timeout: 25_000 });
    });

    const secondMs = await measureActionMs(async () => {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await expect(
        page.getByRole("heading", { name: /Find Your Perfect Home in\s*Kathmandu/i })
      ).toBeVisible({ timeout: 25_000 });
    });

    const listingsHits = requests.getCount("/api/v1/listings");
    const budgets = [
      { name: "first_navigation_ms", threshold: 12_000, actual: firstMs, pass: firstMs < 12_000 },
      { name: "repeat_navigation_ms", threshold: 12_000, actual: secondMs, pass: secondMs < 12_000 },
    ];

    const findings = buildSearchFlowFindings({
      initialLoadMs: firstMs,
      listingsRequestCount: listingsHits,
    });

    await writePerfSnapshot(testInfo, {
      testName: testInfo.title,
      mode: "mocked",
      route: "/",
      auditPhase: "search_flow",
      metrics: { firstMs, secondMs },
      budgets,
      requestCounts: { listings: listingsHits },
      findings,
      notes: [
        "Wave 3 VERIFY-02 baseline: home uses ISR (revalidate=300) with tagged fetch when Wave 1 code present; repeat navigation exercises Data Cache / browser cache interaction under mocked API.",
      ],
      dataFlow: {
        endpointAvgMs: requests.getEndpointAveragesMs(),
        endpointMaxMs: requests.getEndpointMaxMs(),
        endpointCount: requests.getEndpointCounts(),
        duplicateRequestKeys: requests.getDuplicateRequestKeys(),
      },
    });

    expect(budgets.every((b) => b.pass)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run perf suite (local, long-running)**

Run: `npm run test:perf`  
Expected: all `*.perf.spec.ts` pass including the new file. Allow up to **5 minutes** for `next build` + `next start` in webServer.

- [ ] **Step 3: Document command in `loading-and-suspense-intent.md`** — append **“Perf verification”** bullet: run `npm run test:perf` for mocked ISR baseline including home.

- [ ] **Step 4: Commit**

```bash
git add tests/performance/home-isr.mocked.perf.spec.ts docs/superpowers/loading-and-suspense-intent.md
git commit -m "test(perf): add mocked home ISR baseline (Wave 3 M3)"
```

---

### Task Z: Closure

- [ ] **Step 1:** `npm run check` && `npm test` — both pass.

- [ ] **Step 2 (optional):** If CI cannot run `npm run test:perf`, document in PR body and keep default CI on `npm test` only.

---

## Spec coverage (self-review)

| Spec milestone | Tasks |
| --- | --- |
| M1 NEXT-1 | M1-1, M1-2 |
| M2 NOW-3 | M2-1, M2-2 |
| M3 LATER-1 / VERIFY-02 | M3-1 |

**Placeholder scan:** No `TBD` in executable steps; route list is explicit; measurement uses standard `npm run build` output.

---

## Execution handoff

**Plan saved to** `docs/superpowers/plans/2026-04-24-frontend-wave3-loading-islands-isr-verification-implementation.md`.

**1. Subagent-Driven (recommended)** — superpowers:subagent-driven-development.  
**2. Inline Execution** — superpowers:executing-plans.

**Which approach?**
