# Frontend Scalability and Maintainability — Wave 1 (Public Vertical Slices) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Wave 1 of `2026-04-24-frontend-scalability-maintainability-program-design.md`: explicit Next.js cache tags and `fetch` policies for the **public listings vertical slice** (home → apartments search → detail), **on-demand revalidation** after owner/admin listing mutations, **documented** render/cache intent for authenticated app routes, **one** measurable loading UX improvement on the slice, and **non-zero** automated tests for tag helpers and revalidation wiring.

**Architecture:** Public listing reads move through a **`server-only`** fetch layer that passes `next.tags` / `cache` to `fetch`, keyed by stable tag constants in `src/lib/cache/`. Client-side React Query mutations call a **Server Action** that checks for the existing `accessToken` cookie (same signal as `src/middleware.ts`) and then runs `revalidateTag` / optional `revalidatePath`. Authenticated dashboard/manage/admin pages declare **`dynamic = 'force-dynamic'`** (or equivalent) so freshness intent is explicit. Route-family intent is captured in a short markdown doc under `docs/superpowers/`.

**Tech Stack:** Next.js 15 (`^15.5.2`), React 19, TypeScript, Jest (`tests/unit`, `tests/integration`), Playwright (existing perf script optional for before/after note).

**Approved spec:** `docs/superpowers/specs/2026-04-24-frontend-scalability-maintainability-program-design.md`  
**Evidence baseline:** `docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-audit.md`

---

## File map (create / modify)

| Path | Responsibility |
| --- | --- |
| `src/lib/cache/listing-tags.ts` | Stable `revalidateTag` / `fetch` tag strings + `listingPublicDetailTag(id: string)`. |
| `src/lib/cache/revalidate-public-listings.ts` | `'use server'` — cookie gate + `revalidateTag` (+ optional `revalidatePath`). |
| `src/lib/api/listing-query-params.ts` | Pure `buildListingQueryParams` moved from `client.ts` (no `fetch`). |
| `src/lib/api/server-public-listings.ts` | `import "server-only"` — `fetchPublicListings`, `fetchPublicListingDetail` with `next: { tags, revalidate }`. |
| `src/lib/api/client.ts` | Import `buildListingQueryParams` from `listing-query-params.ts`; re-export if needed for external imports. |
| `src/app/(public)/page.tsx` | Use server fetch helpers; keep `export const revalidate = 300`. |
| `src/app/(public)/apartments/[id]/page.tsx` | Use server fetch in `generateMetadata` + page; keep `revalidate = 60` aligned with fetch `revalidate`. |
| `src/lib/hooks/useListings.ts` | After successful listing mutations, `await revalidatePublicListingCache(id?)`. |
| *(none in Wave 1 for `dynamic`)* | `dashboard` / `manage` / `admin` segment `layout.tsx` files are **`"use client"`** today — `export const dynamic` belongs in a **server** segment file; Wave 1 documents freshness instead of a large layout refactor (see Task 5). |
| `src/app/(public)/apartments/loading.tsx` | Route-level skeleton for `/apartments` (perf slice). |
| `docs/superpowers/route-cache-intent.md` | Route families: public vs app surfaces. |
| `tests/unit/lib/cache/listing-tags.test.ts` | Tag string stability. |
| `tests/unit/lib/cache/revalidate-public-listings.test.ts` | Mocks `next/cache` + `next/headers` cookies. |

---

### Task 1: Extract pure listing query builder

**Files:**
- Create: `src/lib/api/listing-query-params.ts`
- Modify: `src/lib/api/client.ts` (remove in-file `buildListingQueryParams`, import from new module)

- [ ] **Step 1: Add `listing-query-params.ts`**

```typescript
import type { ListingFilters } from "./types";

/** URLSearchParams for GET /listings/ — safe to import from server and client. */
export function buildListingQueryParams(filters: ListingFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(filters)) {
    if (val === undefined || val === null || val === "") continue;
    if (Array.isArray(val)) val.forEach((v) => params.append(key, String(v)));
    else params.set(key, String(val));
  }
  return params;
}
```

- [ ] **Step 2: Update `client.ts`** — remove the old `buildListingQueryParams` function body and add:

```typescript
import { buildListingQueryParams } from "./listing-query-params";
```

Keep `export async function getListings` using `buildListingQueryParams(filters).toString()` unchanged.

- [ ] **Step 3: Run typecheck**

Run: `pnpm run check`  
Expected: PASS (no new errors).

- [ ] **Step 4: Run Jest integration tests that touch listings client**

Run: `pnpm exec jest tests/integration/api/listings.test.ts --passWithNoTests`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/api/listing-query-params.ts src/lib/api/client.ts
git commit -m "refactor(api): extract buildListingQueryParams for server reuse"
```

---

### Task 2: Tag constants (VERIFY-01 / CACHE-03 anchor)

**Files:**
- Create: `src/lib/cache/listing-tags.ts`
- Create: `tests/unit/lib/cache/listing-tags.test.ts`

- [ ] **Step 1: Implement `listing-tags.ts`**

```typescript
/** Single tag for all public listing *list* fetches (home featured + any server-side list). */
export const LISTING_PUBLIC_LIST_TAG = "listings:public";

/** Detail pages — pass URL param as stored (id or slug). */
export function listingPublicDetailTag(slugOrId: string): string {
  return `listings:detail:${slugOrId}`;
}
```

- [ ] **Step 2: Add unit test**

```typescript
import {
  LISTING_PUBLIC_LIST_TAG,
  listingPublicDetailTag,
} from "@/lib/cache/listing-tags";

describe("listing-tags", () => {
  it("uses stable list tag", () => {
    expect(LISTING_PUBLIC_LIST_TAG).toBe("listings:public");
  });

  it("encodes detail tag with raw param", () => {
    expect(listingPublicDetailTag("abc-123")).toBe("listings:detail:abc-123");
    expect(listingPublicDetailTag("my-slug")).toBe("listings:detail:my-slug");
  });
});
```

- [ ] **Step 3: Run test**

Run: `pnpm exec jest tests/unit/lib/cache/listing-tags.test.ts -v`  
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/cache/listing-tags.ts tests/unit/lib/cache/listing-tags.test.ts
git commit -m "feat(cache): add public listing revalidate tag helpers"
```

---

### Task 3: Server-only public listing fetch with Next cache tags

**Files:**
- Create: `src/lib/api/server-public-listings.ts`

- [ ] **Step 1: Implement server fetch module** (uses same `API_BASE` pattern as `client.ts`, no in-memory JWT — public reads use `withAuth = false` semantics)

```typescript
import "server-only";
import type { ApiResponse, Listing, ListingFilters, ListingListItem, PaginatedResponse } from "./types";
import { buildListingQueryParams } from "./listing-query-params";
import { LISTING_PUBLIC_LIST_TAG, listingPublicDetailTag } from "@/lib/cache/listing-tags";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ktmapartments.com/api/v1";

const API_FETCH_TIMEOUT_MS = 25_000;

async function readJson<T>(res: Response): Promise<ApiResponse<T>> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { detail?: string; message?: string };
      message = typeof body.detail === "string" ? body.detail : body.message ?? message;
    } catch {
      /* ignore */
    }
    return { data: null, error: { message, status: res.status } };
  }
  if (res.status === 204) return { data: null, error: null };
  return { data: (await res.json()) as T, error: null };
}

export async function fetchPublicListings(
  filters: ListingFilters,
  nextCache: { revalidate: number }
): Promise<ApiResponse<PaginatedResponse<ListingListItem>>> {
  const q = buildListingQueryParams(filters).toString();
  const path = q ? `/listings/?${q}` : "/listings/";
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    signal: AbortSignal.timeout(API_FETCH_TIMEOUT_MS),
    cache: "force-cache",
    next: {
      tags: [LISTING_PUBLIC_LIST_TAG],
      revalidate: nextCache.revalidate,
    },
  });
  return readJson<PaginatedResponse<ListingListItem>>(res);
}

export async function fetchPublicListingDetail(
  slugOrId: string,
  nextCache: { revalidate: number }
): Promise<ApiResponse<Listing>> {
  const res = await fetch(`${API_BASE}/listings/${encodeURIComponent(slugOrId)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    signal: AbortSignal.timeout(API_FETCH_TIMEOUT_MS),
    cache: "force-cache",
    next: {
      tags: [LISTING_PUBLIC_LIST_TAG, listingPublicDetailTag(slugOrId)],
      revalidate: nextCache.revalidate,
    },
  });
  return readJson<Listing>(res);
}
```

- [ ] **Step 2: Switch public server pages to these helpers**

In `src/app/(public)/page.tsx`, replace `getListings(...)` imports from `@/lib/api/client` with:

```typescript
import { fetchPublicListings } from "@/lib/api/server-public-listings";
```

and call `fetchPublicListings({ ... }, { revalidate: 300 })` for both featured calls (matches existing `export const revalidate = 300`).

In `src/app/(public)/apartments/[id]/page.tsx`, replace `getListing` with `fetchPublicListingDetail(id, { revalidate: 60 })` in both `generateMetadata` and the page component (keep MSW branch using client as today).

- [ ] **Step 3: Run typecheck**

Run: `pnpm run check`  
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/api/server-public-listings.ts src/app/\(public\)/page.tsx src/app/\(public\)/apartments/\[id\]/page.tsx
git commit -m "feat(cache): tag public listing fetches for on-demand revalidation"
```

---

### Task 4: Server Action — revalidate after authenticated mutations

**Files:**
- Create: `src/lib/cache/revalidate-public-listings.ts`
- Modify: `src/lib/hooks/useListings.ts`

- [ ] **Step 1: Add Server Action module**

```typescript
"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { LISTING_PUBLIC_LIST_TAG, listingPublicDetailTag } from "@/lib/cache/listing-tags";

/**
 * Bust Next fetch cache for public listing pages after a mutation.
 * Gated on presence of accessToken cookie (same coarse signal as middleware).
 */
export async function revalidatePublicListingCache(listingId?: string) {
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) return { ok: false as const, reason: "no_session" as const };

  revalidateTag(LISTING_PUBLIC_LIST_TAG);
  if (listingId) {
    revalidateTag(listingPublicDetailTag(listingId));
  }
  return { ok: true as const };
}
```

- [ ] **Step 2: Wire mutations** — at top of `useListings.ts`:

```typescript
import { revalidatePublicListingCache } from "@/lib/cache/revalidate-public-listings";
```

Extend each `onSuccess` for mutations that change public-visible listing data to call:

```typescript
void revalidatePublicListingCache(data.id); // or no arg for delete-only list bust
```

Concrete mapping:
- `useCreateListing` → `void revalidatePublicListingCache(data.id);`
- `useUpdateListing` → `void revalidatePublicListingCache(data.id);`
- `useDeleteListing` → `void revalidatePublicListingCache();` (list-only is enough; optional pass deleted id if you still revalidate detail tag)
- `usePublishListing` → `void revalidatePublicListingCache(data.id);`
- `useMarkRented` → `void revalidatePublicListingCache(data.id);`
- `useAdminApproveListing` / `useAdminRejectListing` → change `onSuccess` to receive the returned `Listing` and call `void revalidatePublicListingCache(data.id);` (`adminApproveListing` / `adminRejectListing` in `client.ts` return `ApiResponse<Listing>`).

- [ ] **Step 3: Unit test with mocks**

Create `tests/unit/lib/cache/revalidate-public-listings.test.ts`:

```typescript
/** @jest-environment node */

const mockRevalidateTag = jest.fn();
jest.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
}));

const mockGet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: async () => ({ get: (name: string) => mockGet(name) }),
}));

import { revalidatePublicListingCache } from "@/lib/cache/revalidate-public-listings";
import { LISTING_PUBLIC_LIST_TAG, listingPublicDetailTag } from "@/lib/cache/listing-tags";

describe("revalidatePublicListingCache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("no-ops without accessToken cookie", async () => {
    mockGet.mockReturnValue(undefined);
    const r = await revalidatePublicListingCache("x");
    expect(r.ok).toBe(false);
    expect(mockRevalidateTag).not.toHaveBeenCalled();
  });

  it("revalidates list and detail tags when session present", async () => {
    mockGet.mockImplementation((name: string) =>
      name === "accessToken" ? { value: "t" } : undefined
    );
    const r = await revalidatePublicListingCache("listing-1");
    expect(r.ok).toBe(true);
    expect(mockRevalidateTag).toHaveBeenCalledWith(LISTING_PUBLIC_LIST_TAG);
    expect(mockRevalidateTag).toHaveBeenCalledWith(listingPublicDetailTag("listing-1"));
  });
});
```

- [ ] **Step 4: Run tests**

Run: `pnpm exec jest tests/unit/lib/cache/revalidate-public-listings.test.ts tests/unit/lib/cache/listing-tags.test.ts -v`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/cache/revalidate-public-listings.ts src/lib/hooks/useListings.ts tests/unit/lib/cache/revalidate-public-listings.test.ts
git commit -m "feat(cache): revalidate public listing tags after mutations"
```

---

### Task 5: Explicit render/freshness intent for app shells (RENDER-03 / NOW-2)

**Context:** `src/app/dashboard/layout.tsx`, `src/app/manage/layout.tsx`, and `src/app/admin/layout.tsx` are all **`"use client"`** (they use `usePathname`). You **cannot** add `export const dynamic = "force-dynamic"` to those files. Moving to a server layout + client nav island is a **separate refactor** — not required to close Wave 1.

**Files:**
- Create (via Task 6): `docs/superpowers/route-cache-intent.md` — must include a subsection **“Authenticated app (dashboard / manage / admin)”** that states explicitly:
  - Shells are client components; listing data uses **React Query** + in-memory API client (`src/lib/api/client.ts`).
  - After mutations that affect **public** SEO pages, **`revalidatePublicListingCache`** (Server Action) runs so **ISR-tagged server fetches** on public routes refresh.
  - Stale UI inside authenticated pages is bounded by React Query `invalidateQueries` (already in `useListings.ts`).
  - **Follow-up (optional):** introduce a thin **server** `layout.tsx` wrapper per segment that only renders children + `export const dynamic = "force-dynamic"` and moves current layout to `*LayoutClient.tsx` — track as Wave 2 if needed.

- [ ] **Step 1:** Write the subsection above in the doc (can be done together with Task 6 in one edit).

- [ ] **Step 2:** No separate code commit for Task 5 alone if merged into Task 6; otherwise `docs:` commit with the subsection.

---

### Task 6: Route cache intent doc (maintainability / CACHE-01)

**Files:**
- Create: `docs/superpowers/route-cache-intent.md`

- [ ] **Step 1: Write doc** with sections:

1. **Public marketing + listings** — `/` ISR 300s; `/apartments` client search + Suspense; `/apartments/[id]` ISR 60s + tagged fetch; on-demand revalidation triggers (Server Action from `useListings` mutations + admin approve/reject).
2. **Authenticated app** — `dynamic` export locations (or React Query note from Task 5).
3. **Tag inventory** — table: tag name, meaning, invalidation triggers.

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/route-cache-intent.md
git commit -m "docs: document route cache and render intent"
```

---

### Task 7: Perf slice — `loading.tsx` for `/apartments`

**Files:**
- Create: `src/app/(public)/apartments/loading.tsx`

- [ ] **Step 1: Match existing skeleton style** from `src/app/(public)/apartments/page.tsx` Suspense fallback — extract shared fragment if needed, or duplicate briefly for YAGNI.

Example:

```tsx
export default function ApartmentsLoading() {
  return (
    <div className="container py-8">
      <div className="skeleton mb-4 h-8 w-48" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[4/3] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Manual verify** — `pnpm dev`, navigate to `/apartments`, throttle network in DevTools, confirm skeleton shows on slow navigation.

- [ ] **Step 3: Optional perf note** — run `pnpm run test:perf` or document "skipped" in PR if environment lacks baseline.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(public\)/apartments/loading.tsx
git commit -m "feat(ui): add apartments route loading boundary"
```

---

### Task 8: Wave 1 closure checklist (human + CI)

- [ ] **Full test suite:** `pnpm test` — Expected: PASS.
- [ ] **E2E (if time):** `pnpm run test:e2e` — Expected: PASS or known-flake documented.
- [ ] **Update audit cross-links (optional):** In `2026-04-24-nextjs-research-codebase-cross-comparison-audit.md`, add a one-line "Wave 1 addressed" note under NOW-1 — only if team wants living doc.

---

## Spec coverage (self-review)

| Spec section | Tasks |
| --- | --- |
| O1 Public experience | Task 7 (`loading.tsx`); optional perf script note. |
| O2 Data truth | Tasks 2–4 (tags, `force-cache`, revalidate on mutations). |
| O3 Maintainability | Tasks 1, 6 (extracted pure module, doc); Task 5 explicit dynamic or documented fallback. |
| Wave 1 slice routes | `src/app/(public)/page.tsx`, `(public)/apartments/**`, `[id]`; hooks for mutations. |
| VERIFY-01 | Tasks 2–4 tests. |

**Placeholder scan:** None by design — Task 5 documents the fallback if layouts cannot export `dynamic` without refactor.

---

## Execution handoff

**Plan complete and saved to** `docs/superpowers/plans/2026-04-24-frontend-scalability-maintainability-wave1.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration. **REQUIRED SUB-SKILL:** superpowers:subagent-driven-development.

2. **Inline Execution** — Execute tasks in this session using executing-plans with checkpoints. **REQUIRED SUB-SKILL:** superpowers:executing-plans.

**Which approach?**
