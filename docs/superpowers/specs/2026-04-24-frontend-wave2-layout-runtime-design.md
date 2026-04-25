# Frontend Wave 2 — Server Layout Shells and Runtime / Reliability Documentation

Date: 2026-04-24  
Status: Approved (brainstorming)  
Owner: Frontend Team

## 1) Goal

Advance **editability** and **maintainability** (clear server vs client boundaries, smaller route-level client surface) and **reliability / operational clarity** (explicit dynamic intent for authenticated segments, documented middleware/runtime and cache-invalidation assumptions) in line with Next.js guidance and the gap matrix in `2026-04-24-nextjs-research-codebase-cross-comparison-audit.md`.

This wave complements **Wave 1** (`2026-04-24-frontend-scalability-maintainability-program-design.md` and its implementation plan): Wave 1 focused on **public** tagged fetches and on-demand revalidation; Wave 2 focuses on **authenticated** segment structure and **deployment-facing** documentation.

## 2) Decision summary (validated)

| Decision | Choice |
| --- | --- |
| Delivery style | **Thin vertical slices** — one authenticated segment at a time (order: **dashboard**, then **manage**, then **admin**). |
| Primary engineering move | **Server** segment `layout.tsx` that exports `dynamic = "force-dynamic"` and renders a **single** existing client layout shell moved into `*LayoutClient.tsx` (or equivalent name). |
| Reliability work in the same program | **Extend documentation** (middleware scope, runtime notes, invalidation vs topology) and **define backlog ticket stubs** for unknowns (`CACHE-04`, `VERIFY-03`); do not claim resolved topology without evidence. |
| ARCH-03 | **Surgical** — reinforce `server-only` only where a concrete boundary is touched; no repo-wide sweep in this wave. |

## 3) Scope

### In scope

- **NOW-2 / RENDER-03 / CACHE-01 (authenticated):** Explicit `export const dynamic = "force-dynamic"` at the **server** segment layout for dashboard, then manage, then admin, after extracting current `"use client"` layout into a dedicated client module per segment.
- **NOW-3 / PERF-01–02 (incremental):** Reduce **top-level** client ownership of the segment entry file only; **do not** replace React Query data flows or rebuild pages as RSC in this wave.
- **NEXT-2 / DEPLOY-02–03 and SEC-01 (documentation):** Add or extend docs: default middleware runtime behavior, what executes per request, guidance to keep middleware lean, and where explicit `runtime` exports belong if introduced later.
- **LATER-2 / VERIFY-03 / CACHE-04 (governance):** Document current **assumption** about deployment topology (single instance vs unknown). For **unknown**, require **tracked** follow-ups (issue tracker or planning doc table) with owner and target resolution **field** (date or milestone), not vague “later”.

### Out of scope

- Migrating dashboard/manage/admin data loading from React Query to server components or server actions.
- **VERIFY-02** ISR stale-window performance suite (remains **Later** unless explicitly pulled in).
- Large middleware refactors; only **documentation** and **trivial** clarity edits unless a blocking bug is discovered during layout work.
- Blanket `server-only` on all modules under `src/lib/api`.

## 4) Architecture

### 4.1 Per-segment pattern (repeat three times)

1. **Rename / extract** current `src/app/<segment>/layout.tsx` body into `src/app/<segment>/<Segment>LayoutClient.tsx` with `"use client"` at top (same props: `{ children }`).
2. **Replace** `src/app/<segment>/layout.tsx` with a **server** default export that:
   - sets `export const dynamic = "force-dynamic"`;
   - imports and renders `<SegmentLayoutClient>{children}</SegmentLayoutClient>`.
3. **Verify** navigation, providers (if any live in layout), and auth-gated routes for that segment.

**Order:** `dashboard` → `manage` → `admin` so the pattern is proven before the highest-privilege surface.

### 4.2 Documentation artifacts

- **Primary:** Extend `docs/superpowers/route-cache-intent.md` **or** add `docs/superpowers/deployment-runtime-and-invalidation.md` if the route doc would become too long. The spec **prefers one linked doc pair** (route intent + runtime) over scattering sections.
- **Required sections in the runtime doc (or dedicated section):**
  - Middleware: matcher scope, role checks, CSP; note **cost** (runs before matched routes).
  - Runtime: state that middleware defaults to **Edge** in Next.js unless configured otherwise; state that **app route handlers and RSC** use the **Node** server in a typical `next start` deployment unless `export const runtime = 'edge'` is set—wording must match the team’s **actual** hosting (if unknown, mark **Unknown** and file `VERIFY-03`).
  - **On-demand revalidation:** Reference Wave 1 `revalidatePublicListingCache` and tags from `listing-tags.ts`; explain that **multi-instance** caches may need extra steps (`CACHE-04`) and link to the ticket table.

### 4.3 Ticket table (VERIFY-03)

| ID | Topic | Owner | Target | Status |
| --- | --- | --- | --- | --- |
| (filled at implementation time) | e.g. multi-instance `revalidateTag` | TBD | TBD | Open |

The table lives in the chosen doc until issues exist in an external tracker; then the doc links to issues.

## 5) Data flow

No change to **data** architecture: authenticated UI continues to use **TanStack Query** and `src/lib/api/client.ts`. Public pages keep Wave 1 ISR + tag invalidation. The server layout only declares **segment-level rendering / freshness** for the HTML shell and subtree, not new fetch paths.

## 6) Error handling and risks

| Risk | Mitigation |
| --- | --- |
| Broken providers or context after layout split | Move **entire** previous layout tree into the client file unchanged first; only the outer wrapper file changes. |
| Duplicate layout boundaries | One client shell per segment; no nested duplicate `Navbar` unless already present. |
| Incorrect runtime claims in docs | Mark **Unknown** where hosting is not confirmed; ticket instead of guessing. |

## 7) Testing

- **Manual:** Smoke each segment after migration (login, role-appropriate path, navigation between nested routes).
- **Automated:** Reuse existing Jest/Playwright suites; add **only** if a regression is discovered and a small test is sufficient. Wave 2 does **not** require new E2E by default.

## 8) Success criteria

- Each of **dashboard**, **manage**, and **admin** has a **server** `layout.tsx` with `dynamic = "force-dynamic"` and a **client** shell module containing the prior layout UI.
- Runtime / middleware / invalidation doc exists and contains no false claims—unknowns are labeled and ticketed.
- Audit pointers satisfied **incrementally:** `NOW-2` intent explicit for app shells; `NEXT-2` documentation present; `VERIFY-03` / `CACHE-04` have traceable follow-ups.

## 9) Traceability

| Audit / checklist | This wave |
| --- | --- |
| NOW-2, RENDER-03, CACHE-01 (app) | Server `dynamic` on segment layouts |
| NOW-3, PERF-01–02 | Smaller client **entry** for segment (shell extraction only) |
| NEXT-2, DEPLOY-02–03, SEC-01 | Runtime + middleware documentation |
| LATER-2, VERIFY-03, CACHE-04 | Ticket table + topology assumption |
| ARCH-03 | Optional targeted `server-only` only when touching a boundary |

## 10) Next step

After written spec review in the repository sense, produce **`docs/superpowers/plans/2026-04-24-frontend-wave2-layout-runtime-implementation.md`** via the **writing-plans** skill with concrete file names (`DashboardLayoutClient.tsx`, etc.) and a checklist per segment. No implementation until that plan exists and is agreed for execution.

## 11) References

- `docs/superpowers/specs/2026-04-24-frontend-scalability-maintainability-program-design.md`
- `docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-audit.md`
- `docs/superpowers/route-cache-intent.md`
- `docs/superpowers/plans/2026-04-24-frontend-scalability-maintainability-wave1.md`
