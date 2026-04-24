# Frontend third-party assets and performance UX — design

**Date:** 2026-04-24  
**Status:** Approved (user confirmation in session)  
**Scope:** `ktm-frontend` — key public and authenticated routes

## 1. Problem

First-load and repeat navigation pay for **third-party network hops** (notably Google Fonts in the root layout) and for **heavy client features** (Leaflet + OpenStreetMap tiles) that can compete with critical content. The goal is **better perceived speed and reliability** without violating vendor constraints or product scope.

## 2. Goals and non-goals

### Goals

- **Speed (priority):** Reduce blocking and high-priority third-party work on first meaningful paint for agreed routes.
- **Reliability (secondary):** Improve behavior on slow or flaky networks by bundling or deferring work appropriately.
- **Clarity:** Maintain a written inventory of third-party origins per route and the chosen mitigation (self-host, defer, keep as-is).

### Non-goals

- Replacing Leaflet or changing map providers in this design.
- **Proxying OSM tiles** through our origin (policy, caching, and operational risk; default is **do not**).
- Re-hosting vendor scripts for **ads, payments, or analytics** when those products require vendor-hosted delivery; instead optimize **load timing** and fallbacks.

## 3. Route coverage (v1)

Audit and apply mitigations on:

| Area | Routes (representative) |
|------|-------------------------|
| Marketing / first impression | `/` and other public landings linked from global nav |
| Search | `/apartments`, listing detail under `/apartments/...` |
| Auth | `/login`, `/register` |
| Manage | `/manage` and nested paths (e.g. `/manage/analytics`) |

## 4. Third-party policy

| Category | Policy |
|----------|--------|
| **Typography (Google Fonts today)** | **Self-host or use `next/font`** so fonts ship from same origin as the app; subset to weights/axes in use. |
| **Leaflet + OSM tiles** | **Keep on vendor infrastructure**; optimize with **code-splitting**, **lazy mount**, and **user or viewport gating** so tiles do not run on routes or viewports that do not need a map. |
| **Telemetry** | Current code uses `gtag` when present else `CustomEvent` — no requirement to add GA in this work; if GA (or similar) is added later, treat as **external script** with **deferred / consent-gated** load. |
| **Images** | Prefer existing **first-party or configured CDN** (`images.ktmapartments.com` per CSP); avoid new third-party image hosts without review. |

## 5. Current codebase anchors

- **Root layout** loads Google Fonts via `<link>` to `fonts.googleapis.com` and `preconnect` to `fonts.gstatic.com` (`src/app/layout.tsx`).
- **CSP** allows Google font and OSM tile origins (`src/lib/csp.ts` — `connect-src` / `style-src` / `font-src`).
- **Map:** `MapView` uses Leaflet with `NEXT_PUBLIC_MAP_TILE_URL` defaulting to `https://{s}.tile.openstreetmap.org/...`; marker assets are already **same-origin** under `/public/leaflet` (`leaflet-defaults.ts`).

## 6. Technical approach

### 6.1 Phase A — Short inventory

For each route in §3, produce a table: **origin**, **resource type** (font, script, image, XHR, websocket), **blocking vs async**, **owner** (us vs vendor), **recommended action** (self-host, defer/lazy, keep + document).

**Sources:** DevTools network (cold + warm), existing Playwright perf artifacts under `build/performance/` where applicable, and Lighthouse “third-party” summary.

### 6.2 Phase B — Typography (first implementation slice)

- Migrate from **linked Google CSS** to **`next/font`** (Google provider or local files) for **DM Sans**, **DM Serif Display**, and **JetBrains Mono** — only the weights and styles used in UI.
- Remove obsolete `<link rel="stylesheet">` / `preconnect` entries once fonts are bundled.
- **Tighten CSP** after migration: remove `https://fonts.googleapis.com` and `https://fonts.gstatic.com` from directives where no longer required (verify MSW/dev still work per comment in `csp.ts`).

### 6.3 Phase C — Map loading (vendor unchanged)

- Ensure **map chunk and tile requests** do not run on **initial paint** for views that do not show a map, or until **in view** / **user opens map** (product decision recorded in implementation plan).
- Keep **attribution** visible per OSM requirements.
- Do **not** add a default tile proxy; if a future need arises, evaluate **policy-compliant** options in a separate spec.

### 6.4 Phase D — Remaining inventory items

Address each row from Phase A: self-host small static assets where legal and worthwhile; for mandatory externals, document **strategy** (idle load, interaction trigger, consent).

## 7. UX and accessibility

- Map deferral must not remove **non-map** paths to the same tasks (e.g. list-first search remains fully usable).
- Font changes should be checked for **layout shift** and **contrast** on light/dark surfaces.
- Keyboard and screen reader: map remains **enhancement**; controls that replace map-only actions must stay reachable.

## 8. Verification

- Re-run **`npm run test:perf`** (mocked) and compare `build/performance/summary.md` for font-related and navigation metrics.
- Optional: **`npm run test:perf:real`** when `NEXT_PUBLIC_API_URL` is set, for backend-inclusive runs (separate from third-party static work).
- Manual or Lighthouse spot check on `/`, `/apartments`, `/login`, `/manage`.

## 9. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Font subset too aggressive | Start from current variable axes in layout URL; verify glyphs for Latin + numerals used in UI. |
| CSP regressions in dev/MSW | Test with MSW and without; align `connect-src` with actual fetch targets. |
| Map lazy mount confuses users | Clear “Show map” or equivalent if map is behind interaction. |

## 10. Out of scope for this design

- Backend API latency optimization (covered by other work and real perf runs).
- Replacing OSM with commercial tiles without a separate product decision.

---

## Self-review (internal)

- **Placeholders:** None; route list is intentionally representative (“other public landings”) to be enumerated in the implementation plan.
- **Consistency:** Policy table matches user choices (speed first, full pass inventory, vendors A stay external).
- **Scope:** Single deliverable family (third-party + perceived perf); map proxy explicitly excluded.
- **Ambiguity:** “User or viewport gating” for maps requires one concrete rule per surface in the **implementation plan** (not duplicated here as false precision).
