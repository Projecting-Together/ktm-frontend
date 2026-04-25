# Frontend Wave 3 — Loading Boundaries, Client Islands, and ISR Verification

Date: 2026-04-24  
Status: Approved (brainstorming)  
Owner: Frontend Team

## 1) Goal

Deliver a **third implementation wave** that advances all of:

1. **NEXT-1 (`PERF-03`, `RENDER-04`)** — Standardize route-level **loading** boundaries and tie **Suspense** (where already used) to explicit **UX intent** in documentation.
2. **NOW-3 (`PERF-01`, `PERF-02`)** — Reduce **route-level** `"use client"` scope on **one** high-traffic area by moving to a **server default + client islands** pattern, with **documented before/after** client JS evidence for that target (per audit Section 6 style).
3. **LATER-1 (`VERIFY-02`)** — Add or extend **automated** checks for **ISR / stale-window** (or cache-age) behavior for **public** ISR routes already covered by Wave 1 tagging, using the existing **Playwright perf** harness where practical.

This wave assumes **Wave 1** (public tagged fetch + `revalidatePublicListingCache`) and **Wave 2** (server segment layouts + runtime docs) are merged. Traceability: `docs/superpowers/specs/2026-04-24-nextjs-research-codebase-cross-comparison-audit.md`.

## 2) Decision summary (validated)

| Decision | Choice |
| --- | --- |
| Combination strategy | **Phased milestones:** M1 **NEXT-1** → M2 **NOW-3** (single target) → M3 **LATER-1** (perf tests). |
| NEXT-1 route coverage | An **enumerated route set** chosen in the implementation plan (not the entire app in one PR). |
| NOW-3 scope cap | **Exactly one** page or cohesive feature area per Wave 3; additional pages roll to a later wave. |
| Measurement | **One agreed method** for NOW-3 (e.g. Next build client reference, bundle analyzer, or route-level note)—record baseline and post-change in the same artifact. |
| VERIFY-02 | Extend **`playwright.perf.config.ts`** / `tests/performance/**` with **at least one** new or strengthened assertion; thresholds must be **documented** and **CI-tolerant** (or explicitly skipped in default CI with a documented command). |

## 3) Scope

### In scope

- **Milestone 1 — NEXT-1:** Add or refine `src/app/**/loading.tsx` (and Suspense boundaries only where they already exist or are clearly justified) for the **planned route list**. Add a **Loading & Suspense intent** subsection (new doc or extension of `docs/superpowers/route-cache-intent.md`) where each listed boundary has a **one-line UX objective** (what appears first, what we are optimizing for).
- **Milestone 2 — NOW-3:** Refactor **one** target from full-page client toward server shell + islands; preserve behavior and auth; no global React Query removal.
- **Milestone 3 — LATER-1:** Implement ISR / stale-window (or cache-age) verification tied to public ISR pages (e.g. `/` or `/apartments/[id]` `revalidate` semantics), reusing or extending existing perf tooling.
- **Cross-links:** Reference `docs/superpowers/deployment-runtime-and-invalidation.md` and Wave 1/Wave 2 specs where relevant.

### Out of scope

- Converting all dashboard/manage/admin pages to RSC or removing TanStack Query app-wide.
- Middleware or CSP refactors (Wave 2 documentation stands unless a defect is found).
- Closing **LATER-2** in an external issue tracker (optional follow-up; Wave 3 may only **reference** existing `W2-INV-*` rows).
- Arbitrary new product features unrelated to loading, bundle size, or ISR verification.

## 4) Architecture

### 4.1 Loading (`loading.tsx`)

- **Presentation-only:** No data fetching in `loading.tsx`; skeletons mirror approximate layout of the paired `page.tsx`.
- **Coexistence with Suspense:** Where `Suspense` already wraps slow client subtrees (e.g. search), `loading.tsx` covers **segment navigation**; document the division of responsibility in the Loading intent doc to avoid duplicate skeleton stacks.

### 4.2 NOW-3 islands

- **Server component** owns static chrome and serializable props; **client components** own interactivity (forms, maps, filters, stores).
- **Props:** Serializable only across the boundary; avoid passing classes or non-JSON shapes.
- **Default export** of the route `page.tsx` should be a Server Component when feasible; push `"use client"` to leaf modules.

### 4.3 VERIFY-02 perf tests

- Prefer **deterministic** signals: e.g. documented `revalidate` seconds, response metadata, or controlled clock/wait patterns documented in the plan.
- If full E2E timing is flaky in CI, document **local** run commands and optional CI job; do not merge unbounded `waitForTimeout` without caps.

## 5) Data flow

No change to **API contracts** or Wave 1 **cache tag** semantics. Loading and layout changes must **not** alter when listing data is invalidated; NOW-3 refactors must keep the same mutation and `revalidatePublicListingCache` call paths unless the plan explicitly documents a move (out of scope by default).

## 6) Error handling and risks

| Risk | Mitigation |
| --- | --- |
| Hydration mismatch after island split | Strict serializable props; incremental PR; manual smoke on target route. |
| Duplicate skeletons (loading + Suspense) | Document layering per route in Loading intent section. |
| Flaky perf tests | Documented thresholds; optional CI split; avoid coupling to wall-clock alone. |
| Scope creep on NOW-3 | Hard cap: one target per Wave 3. |

## 7) Testing

- **Milestone 1:** Manual navigation smoke for each route that gains `loading.tsx`.
- **Milestone 2:** Manual + existing Jest where hooks are touched; regression on target user flows.
- **Milestone 3:** New or updated Playwright perf spec(s); `npm run test:perf` (or documented equivalent) passes locally before merge.

## 8) Success criteria

- **M1:** Every route in the **agreed list** has a documented loading/Suspense intent line; `loading.tsx` (or explicit documented exception) exists where promised.
- **M2:** One NOW-3 target ships with **before/after** bundle evidence artifact linked from PR or `docs/superpowers/`.
- **M3:** At least one **VERIFY-02**-aligned automated check exists and is described in the implementation plan with run instructions.

## 9) Traceability

| Audit | Wave 3 |
| --- | --- |
| NEXT-1, PERF-03, RENDER-04 | Milestone 1 |
| NOW-3, PERF-01, PERF-02 | Milestone 2 |
| LATER-1, VERIFY-02 | Milestone 3 |

## 10) References

- `docs/superpowers/specs/2026-04-24-frontend-scalability-maintainability-program-design.md`
- `docs/superpowers/specs/2026-04-24-frontend-wave2-layout-runtime-design.md`
- `docs/superpowers/route-cache-intent.md`
- `docs/superpowers/deployment-runtime-and-invalidation.md`
- `docs/superpowers/plans/2026-04-24-frontend-scalability-maintainability-wave1.md`

## 11) Next step

After the written spec is reviewed in-repo, produce **`docs/superpowers/plans/2026-04-24-frontend-wave3-loading-islands-isr-verification-implementation.md`** using the **writing-plans** skill: enumerate **exact routes** for M1, **exact NOW-3 target file(s)**, **measurement commands**, and **perf test file paths**. No feature implementation until that plan exists and is agreed for execution.
