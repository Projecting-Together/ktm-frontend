# Third-party network origins (v1) — 2026-04-24

Inventory for public and authenticated routes per `2026-04-24-frontend-third-party-assets-performance-ux-design.md`. **Action** is the mitigation class: *same-origin / bundled*, *vendor (expected)*, *defer*.

## Summary table

| Origin / class | Resource types | Where | Action |
|----------------|----------------|-------|--------|
| **Same app origin** (`/`) | HTML, `/_next/static/*` JS/CSS, `/_next/image`, `public/*` (incl. `/leaflet/*.png`) | All routes | Bundled; primary path |
| **Backend API** | XHR/fetch, cookies | `NEXT_PUBLIC_API_URL` / `https://api.ktmapartments.com` in prod | App data; not “asset CDN” |
| **Image CDN** (if used) | images | `https://images.ktmapartments.com` | First-party images per CSP |
| **OpenStreetMap** | Map raster tiles | `https://*.tile.openstreetmap.org` | **Vendor** — only when map mounts |
| **Google Fonts** (removed) | N/A at runtime | — | Replaced with **`next/font`** (fonts served with app) |

## By route class

### `/` (home) and public marketing

- **Next** chunks, CSS, same-origin images.
- No map on typical home layout unless a section embeds one later.

### `/apartments` (search)

- **Listings API** (same as rest of app).
- **Map (Leaflet + OSM):** `SearchPageClient` uses `next/dynamic` with `ssr: false` and mounts **`SearchMap` only when `store.view === "map"`** after listings resolve (not on grid/list). Tile requests hit OSM only in that case.
- **Leaflet default icons:** same-origin under `/public/leaflet` (see `leaflet-defaults.ts`).

### `/apartments/[id]` (listing detail)

- Same-origin + API + images; no `MapView` in codebase outside search as of this audit.

### `/login`, `/register`

- Same-origin + API for auth; typography from **`next/font`** (no `fonts.googleapis.com` in document).

### `/manage/*` (landlord)

- Same-origin + API; no third-party map in shell by default.

## Telemetry

- `src/lib/analytics/events.ts` uses `window.gtag` if injected; else `CustomEvent` — **no extra origin** in base bundle.

## Follow-ups (not required for v1)

- If GA or similar is added as a script tag, list under **vendor (defer / consent)** and keep out of initial critical path.
- Optional: further defer map by **in-view** or explicit “Load map” if product wants zero tile prefetch until scroll.
