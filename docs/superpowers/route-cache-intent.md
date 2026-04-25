# Route cache and render intent

Date: 2026-04-24

## See also

- **Middleware, Edge vs Node, invalidation follow-ups:** `docs/superpowers/deployment-runtime-and-invalidation.md`

## Public marketing + listings

| Route / area | Render / data | Caching |
| --- | --- | --- |
| `/` (`src/app/(public)/page.tsx`) | Server Component; featured listings via `getListings` from `src/lib/api/client.ts` | `export const revalidate = 300` (ISR) |
| `/apartments` | Client search (`SearchPageClient`) inside `Suspense` | Results load in the browser |
| `/apartments/[id]` | Server metadata + body via `getListing` when `NEXT_PUBLIC_USE_MSW` is not `true` | `export const revalidate = 60` |

**Wave 1 note:** The scalability program adds tagged `fetch` and `revalidatePublicListingCache` for these paths. When that code is merged, update this table to match `src/lib/api/server-public-listings.ts` and `src/lib/cache/` as the source of truth.

## Authenticated app (dashboard / manage / admin)

- **Segment layouts:** `src/app/dashboard/layout.tsx`, `src/app/manage/layout.tsx`, and `src/app/admin/layout.tsx` are **server components** that export `export const dynamic = "force-dynamic"` and render a single client shell (`*LayoutClient.tsx`) containing nav + `Navbar` + `children`.
- **Data:** Authenticated pages continue to use **TanStack Query** and `src/lib/api/client.ts` (in-memory JWT; `accessToken` / `userRole` cookies for middleware).
- **Freshness:** Server `dynamic = "force-dynamic"` makes the **HTML shell** for each request non-static; client data freshness remains driven by React Query `invalidateQueries` on mutations.

**Optional later refactor:** Further shrink client bundles by lifting static chrome to the server layout—out of scope for Wave 2.

## Tag inventory (Wave 1, when implemented)

| Tag | Meaning |
| --- | --- |
| `listings:public` | Public list fetches |
| `listings:detail:<slugOrId>` | Public detail fetch for that URL segment |

See `docs/superpowers/plans/2026-04-24-frontend-scalability-maintainability-wave1.md` for the authoritative tag list once that branch lands.
