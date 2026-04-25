# Deployment runtime, middleware, and cache invalidation

Date: 2026-04-24

## Related docs

- Route-level cache and render intent: `docs/superpowers/route-cache-intent.md`
- Wave 2 design: `docs/superpowers/specs/2026-04-24-frontend-wave2-layout-runtime-design.md`
- Wave 1 scalability program (tagged public fetches + on-demand revalidation when implemented): `docs/superpowers/specs/2026-04-24-frontend-scalability-maintainability-program-design.md`

## Middleware (`src/middleware.ts`)

- **Matcher:** `export const config.matcher` runs middleware on all paths except `api`, `_next/static`, `_next/image`, `favicon.ico`, and common static image extensions.
- **Auth gate:** Paths under `/dashboard`, `/manage`, `/admin` require an `accessToken` cookie; otherwise the user is redirected to `/login?next=…`.
- **Role checks:** `userRole` cookie: `/admin/*` requires `admin`; `/manage/*` uses `isListingCreationPath` for `/manage/listings/new` versus other manage routes (see source for allowed roles).
- **CSP:** Responses pass through `withCsp`, setting `Content-Security-Policy` from `src/lib/csp.ts`.
- **Cost (SEC-01):** Middleware runs before matched routes. Keep logic branch-only and avoid external `fetch` here.

## Runtime: Edge vs Node

- **Middleware** in Next.js runs on the **Edge** runtime by default (this project does not use experimental Node middleware).
- **App Router** pages and route handlers in a standard `next build` + `next start` deployment run on the **Node** server process unless a module exports `export const runtime = 'edge'`.
- **Hosting topology:** Confirm whether production runs a **single** Node instance or **multiple** instances behind a load balancer. Until confirmed in your deploy docs, treat **on-demand `revalidateTag`** as **eventually consistent across instances** and track follow-ups below.

## Public listing cache (Wave 1 program)

When the Wave 1 implementation is present, public listing reads use Next `fetch` with **tags** and `revalidateTag` from a Server Action after mutations. Until merged, this repo may still use `getListings` / `getListing` from `src/lib/api/client.ts` on server pages without tag-based invalidation—see `route-cache-intent.md` for the live description.

## Follow-up table (replace Issue URL when filed)

| ID | Topic | Owner | Target | Status |
| --- | --- | --- | --- | --- |
| W2-INV-1 | Validate `revalidateTag` behavior when more than one Node instance serves the app | Record assignee in first PR that touches prod deploy | Next planning milestone | Open |
| W2-INV-2 | Confirm Edge middleware + Node RSC split against hosting provider documentation | Record assignee in first PR that touches prod deploy | Next planning milestone | Open |
