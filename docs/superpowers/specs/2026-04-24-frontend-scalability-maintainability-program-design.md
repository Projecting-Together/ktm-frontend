# Frontend Scalability and Maintainability Program (Public Vertical Slices)

Date: 2026-04-24  
Status: Approved (brainstorming)  
Owner: Frontend Team

## 1) Goal

Turn the findings in `2026-04-24-nextjs-research-checklist.md` and `2026-04-24-nextjs-research-codebase-cross-comparison-audit.md` into a **single delivery program** that advances all of:

- **Public experience and SEO** — speed, perceived performance, and consistency on public/search/listing paths.
- **Data correctness** — explicit caching, invalidation, and freshness so users do not see stale or inconsistent business-critical information.
- **Maintainability** — small units, clear boundaries, documented intent per route family, and tests that protect the behaviors we care about.

The program uses **Approach C: public vertical slices**: each wave delivers **both** cache/data contracts **and** at least one **measured** performance or composition improvement on the **same** public flows, with a **no-done-without-verification** gate for those flows.

Baseline design context: `2026-04-24-nextjs-research-codebase-cross-comparison-design.md`.

## 2) Decision summary (validated)

| Decision | Choice |
| --- | --- |
| Delivery style | **Public vertical slices** — one or two end-to-end public flows per wave; each wave includes data/cache work **and** a targeted perf move. |
| Tie-breaker (first 4–8 week wave) | **Public experience** is the primary disappointment if missed; **data truth** is a **hard gate** — do not ship slice “done” without addressing both for that flow. |
| Relationship to audit roadmap | Adopts **Now / Next / Later** from the audit as program phases; does not replace the gap matrix — it **executes** it in slice order. |

## 3) Objectives (12-month horizon)

- **O1 — Public experience:** Public/search/listing surfaces meet agreed performance and UX targets (including loading boundaries and bundle discipline where applicable). Where a separate spec exists (for example third-party assets), slice work may **coordinate** with it rather than duplicating it.
- **O2 — Data truth:** Business-critical public data has explicit fetch/cache policy, tag-based invalidation at real write points where applicable, and no long-lived ambiguity about freshness for that slice.
- **O3 — Maintainability:** Route families document render and cache **intent**; server-only boundaries are strengthened where mistakes are likely (`ARCH-03`); tests grow with touched code (`VERIFY-01`).

## 4) Phasing (aligned with audit Now / Next / Later)

### Wave 1 — “Now” (first implementation program)

Targets audit items **NOW-1**, **NOW-2**, **NOW-3**, and verification **VERIFY-01** for **selected public flows** (for example: home → listing list → listing detail — exact routes are chosen in the implementation plan, not fixed in this spec).

For each flow in scope:

1. **Data and cache:** Introduce explicit `fetch` cache modes where data is loaded; define `revalidateTag` / `revalidatePath` usage and **document** trigger points (admin actions, webhooks, form success paths — whatever the product actually has).
2. **Personalized / app surfaces:** Define an explicit dynamic freshness strategy for dashboard, manage, and admin (`RENDER-03`, `CACHE-01`) so it is not implicit — either server-fresh, client with documented tradeoffs, or hybrid — and keep it consistent with cache conventions from (1).
3. **Performance:** Apply **one** targeted improvement per slice — for example reduce route-level `"use client"` surface, add a `loading.tsx` boundary, or apply a change traceable to bundle or Web Vitals for that route.
4. **Verification:** Add or extend **automated** checks for the slice’s cache and refresh behavior (scope can start minimal and grow; the requirement is **non-zero** coverage for critical paths before calling the slice complete).

### Wave 2 — “Next”

- Standardize loading and Suspense boundaries where they improve UX (`PERF-03`, `RENDER-04`).
- Document edge vs Node runtime choices and middleware behavior at a level operators can reason about (`DEPLOY-02`, `DEPLOY-03`, `SEC-01` — documentation and light refactors only as needed for clarity).

### Wave 3 — “Later”

- ISR stale-window and representative traffic validation (`VERIFY-02`).
- Multi-instance or edge invalidation follow-ups and explicit backlog items for unknowns (`CACHE-04`, `VERIFY-03`).

## 5) System shape (boundaries)

- **Data access:** Server-side data loading for public flows in a slice must declare caching behavior; mutations that affect listing visibility or detail must tie to **tag** or **path** invalidation with documented owners.
- **Route documentation:** Each **route family** (public marketing, public listings, authenticated app) has a short, living note: default render mode, cache/revalidate expectations, and what must always be fresh.
- **Client boundaries:** Interactive **islands** stay small; page shells default to Server Components except where interactivity requires client — matching the audit’s `PERF-01` / `PERF-02` direction.
- **Third-party and assets:** Follow `2026-04-24-frontend-third-party-assets-performance-ux-design.md` when changes touch embeds, fonts, or maps; do not invent duplicate performance rules in this spec.

## 6) Success criteria (reviewable in PRs)

- **Per Wave-1 slice:** Written cache/tag/invalidation contract for that flow; at least one automated test or check covering refresh or invalidation behavior; before/after note for a chosen metric (route bundle, LCP, or existing perf spec) for that flow.
- **Personalized routes:** No remaining “implicit” freshness — documented strategy and aligned with team conventions.
- **No false “done”:** A slice is not complete if public users can see obviously stale listing state after a known write path without a documented exception.

## 7) Out of scope (for this program)

- Unrelated large refactors or rewrites of features not touched by a slice.
- Re-running the full audit for areas already **Compliant** unless a change regresses them.
- Pentesting, load testing to production scale, or multi-region deployment design — may inform **Later** tickets only.

## 8) Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Perf work ships without cache correctness | Slice definition requires both; PR review uses success criteria in Section 6. |
| Invalidation spread across many instances | Wave 1 documents current deployment assumptions; Wave 3 / backlog addresses `CACHE-04` when needed. |
| Test coverage stays thin | `VERIFY-01` is a gate: smallest valuable check first, then expand. |

## 9) Traceability to checklist / audit

This program **implements** the audit’s **Now** stack as integrated slices, then **Next** and **Later** as sequenced. Primary checklist anchors: `CACHE-02`, `CACHE-03`, `VERIFY-01`, `RENDER-03`, `CACHE-01`, `PERF-01`, `PERF-02`, and progressively `PERF-03`, `RENDER-04`, `VERIFY-02`, `VERIFY-03`, `DEPLOY-02`, `DEPLOY-03`, `SEC-01`, `CACHE-04`.

## 10) Next step

After this spec is reviewed and approved in the repository sense, use the **writing-plans** skill to produce a dated implementation plan that names **concrete routes**, **tag names**, **invalidation trigger points**, and **test files** for Wave 1. No feature implementation should start before that plan exists.
