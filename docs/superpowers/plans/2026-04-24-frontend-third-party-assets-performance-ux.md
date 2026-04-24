# Third-party assets and performance UX — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove runtime dependency on `fonts.googleapis.com` / `fonts.gstatic.com` for core typography by using `next/font`, tighten CSP accordingly, and document third-party traffic with a focus on map tiles remaining vendor-hosted; search map stays load-on-map-view (already dynamic).

**Architecture:** A single `src/lib/fonts.ts` module exports `next/font/google` instances with CSS variables (`--font-sans`, `--font-serif`, `--font-mono`). Root `layout.tsx` applies those variables on `<html>`; `globals.css` and a few inline `fontFamily` overrides switch to `var(--font-*)`. `src/lib/csp.ts` drops Google font origins. A short inventory markdown file records origins by route class.

**Tech stack:** Next.js App Router, `next/font/google`, existing middleware CSP, MSW, Playwright perf harness.

**Spec:** `docs/superpowers/specs/2026-04-24-frontend-third-party-assets-performance-ux-design.md`

---

## File map

| File | Responsibility |
|------|------------------|
| `src/lib/fonts.ts` (new) | Export DM Sans, DM Serif Display, JetBrains Mono with `variable` and `className` for layout |
| `src/app/layout.tsx` | Remove `<link>` + `preconnect` to Google; add font variable classes to `<html>` |
| `src/app/globals.css` | `body` / `h1–h6` / `.price` & Leaflet: use `var(--font-sans)` etc. |
| `src/lib/csp.ts` | Remove `fonts.googleapis.com` and `fonts.gstatic.com` from `connect-src`, `style-src`, `font-src` |
| `src/lib/providers/Providers.tsx` | Theme `fontFamily: var(--font-sans)` |
| `src/components/layout/Navbar.tsx`, `Footer.tsx` | Brand: `var(--font-serif)` |
| `src/app/(auth)/login/page.tsx`, `register/page.tsx` | Brand: `var(--font-serif)` |
| `docs/superpowers/audits/2026-04-24-third-party-inventory.md` (new) | Route × origin inventory |

---

### Task 1: Add `next/font` module

**Files:**

- Create: `src/lib/fonts.ts`

- [x] **Step 1: Add font exports**

```ts
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from "next/font/google";

export const fontSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const fontSerif = DM_Serif_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  style: ["normal", "italic"],
  weight: "400",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
});
```

- [x] **Step 2: Run typecheck**

Run: `npm run check`  
Expected: No errors in `src/lib/fonts.ts`.

- [x] **Step 3: Commit**

```bash
git add src/lib/fonts.ts
git commit -m "feat(fonts): add next/font Google exports for sans, serif, mono"
```

---

### Task 2: Wire fonts in root layout

**Files:**

- Modify: `src/app/layout.tsx`

- [x] **Step 1: Import and apply classes**

- Import `fontSans`, `fontSerif`, `fontMono` from `@/lib/fonts`.
- On `<html>`, set `className` to a string joining `fontSans.variable`, `fontSerif.variable`, `fontMono.variable` (and preserve `suppressHydrationWarning`, `data-scroll-behavior`).
- Remove the three children under `<head>`: both `preconnect` links and the `link` to `fonts.googleapis.com/css2?...`.
- Remove `children` of `<head>` if only those remain—**keep** the inline `<style>` for theme variables if it exists.

- [x] **Step 2: Run `npm run build`**

Expected: Build completes; no missing font module errors.

- [x] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(layout): apply next/font variables; drop Google Fonts links"
```

---

### Task 3: Point global CSS and Leaflet to CSS variables

**Files:**

- Modify: `src/app/globals.css`

- [x] **Step 1: Replace family strings**

- `body` `font-family`: `var(--font-sans), system-ui, sans-serif`
- `h1, …, h6` `font-family`: `var(--font-serif), Georgia, serif`
- `.price, code, .mono` `font-family`: `var(--font-mono), ui-monospace, monospace`
- `.ktm-leaflet .leaflet-container` `font-family`: `var(--font-sans), system-ui, sans-serif`

- [x] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "style: use next/font CSS variables in base and Leaflet"
```

---

### Task 4: Inline brand `fontFamily` overrides

**Files:**

- Modify: `src/lib/providers/Providers.tsx`, `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`

- [x] **Step 1: Use variables**

- `Providers` Chakra or theme: `fontFamily: "var(--font-sans), sans-serif"` (or stack matching globals).
- Navbar/Footer/Login/Register: replace `fontFamily: "'DM Serif Display', serif"` with `fontFamily: "var(--font-serif), Georgia, serif"`.

- [x] **Step 2: Commit**

```bash
git add src/lib/providers/Providers.tsx src/components/layout/Navbar.tsx src/components/layout/Footer.tsx "src/app/(auth)/login/page.tsx" "src/app/(auth)/register/page.tsx"
git commit -m "fix: brand and provider typography use --font-serif/--font-sans"
```

---

### Task 5: Tighten CSP (remove Google Fonts hosts)

**Files:**

- Modify: `src/lib/csp.ts`

- [x] **Step 1: Edit policy strings**

- In `connectSrc`, remove `https://fonts.googleapis.com` and `https://fonts.gstatic.com`.
- In `contentSecurityPolicy` array:
  - `style-src`: remove `https://fonts.googleapis.com` (result: `'self' 'unsafe-inline'`).
  - `font-src`: change to `'self'` only (remove `https://fonts.gstatic.com`).

- [x] **Step 2: Dev smoke**

Run `npm run dev`, open `/` and `/apartments`; confirm no CSP console violations for fonts.

- [x] **Step 3: Commit**

```bash
git add src/lib/csp.ts
git commit -m "chore(csp): drop Google Fonts allowlist; fonts same-origin"
```

---

### Task 6: Third-party inventory doc (Phase A + map note)

**Files:**

- Create: `docs/superpowers/audits/2026-04-24-third-party-inventory.md`

- [x] **Step 1: Write inventory**

Include a table: routes (`/`, `/apartments`, `/apartments/*`, `/login`, `/register`, `/manage/*`), rows for `self` (Next chunks, API), `*.tile.openstreetmap.org` (map view only), `images.ktmapartments.com` / API hosts as in CSP, and a note that **listings map** loads only when `view === "map"` with `next/dynamic` + `ssr: false` (`SearchPageClient`).

- [x] **Step 2: Commit**

```bash
git add docs/superpowers/audits/2026-04-24-third-party-inventory.md
git commit -m "docs: add third-party origin inventory (Phase A)"
```

---

### Task 7: Verification

- [x] **Step 1: `npm run check`**

Expected: pass.

- [x] **Step 2: `npm run build`**

Expected: pass.

- [x] **Step 3: `npm run test:perf` (optional in CI; run locally if time)**

Expected: Playwright perf completes; `build/performance/summary.md` no longer lists `fonts.googleapis` / `gstatic` for typical runs (global assets may shift).

- [x] **Step 4: Final commit** if any doc tweak only.

---

## Plan self-review

- **Spec coverage:** §6.2 fonts, §6.1/6.3 inventory + map behavior, §8 verification — all mapped to tasks.
- **No placeholders** in saved plan: tasks reference real paths; inventory path is explicit.
- **Map:** No code change required if gating is already by view — task 6 documents current behavior; optional follow-up (intersection-only) is out of scope for this pass.

**Plan complete and saved to** `docs/superpowers/plans/2026-04-24-frontend-third-party-assets-performance-ux.md`.

**Execution options:**

1. **Subagent-Driven (recommended)** — one task per agent with review between tasks.  
2. **Inline** — run tasks sequentially in this session with checkpoints.

This session will proceed with **inline execution** of Tasks 1–7 unless you prefer otherwise.
