# Route cache and render intent

Date: 2026-04-24  
Related plan: `docs/superpowers/plans/2026-04-24-frontend-scalability-maintainability-wave1.md`

## See also

- **Middleware, Edge vs Node, invalidation follow-ups:** `docs/superpowers/deployment-runtime-and-invalidation.md`

## 1) Public marketing + listings

| Route / area | Render / data | Caching |
| --- | --- | --- |
| `/` (`src/app/(public)/page.tsx`) | Server Component; featured rent/sale via `fetchPublicListings` | `export const revalidate = 300`; fetches use `cache: "force-cache"` + tag `listings:public` |
| `/apartments` | Client search UI (`SearchPageClient`) inside `Suspense` on `src/app/(public)/apartments/page.tsx` | Search results load in the browser (React Query / client `fetch`); not ISR-tagged |
| `/apartments/[id]` | Server metadata + body via `fetchPublicListingDetail` when `NEXT_PUBLIC_USE_MSW` is not `true` | `export const revalidate = 60`; tags `listings:public` + `listings:detail:<param>` |

**On-demand revalidation:** After listing mutations that affect public content, the client calls the Server Action `revalidatePublicListingCache` in `src/lib/cache/revalidate-public-listings.ts` (from `src/lib/hooks/useListings.ts`). That clears tagged Next fetch cache so ISR pages can refetch on the next request.

## 2) Authenticated app (dashboard / manage / admin)

- **Segment layouts:** `src/app/dashboard/layout.tsx`, `src/app/manage/layout.tsx`, and `src/app/admin/layout.tsx` are **server components** that export `export const dynamic = "force-dynamic"` and render a single client shell (`DashboardLayoutClient`, `ManageLayoutClient`, `AdminLayoutClient`) containing nav + `Navbar` + `children`.
- **Data:** Authenticated pages use **TanStack Query** and `src/lib/api/client.ts` (in-memory JWT; `accessToken` / `userRole` cookies for middleware).
- **Freshness:** Server `dynamic = "force-dynamic"` makes the **HTML shell** for each request non-static; client data freshness remains driven by React Query `invalidateQueries` on mutations. The same mutations call `revalidatePublicListingCache` so public ISR pages stay consistent with writes.

**Optional later refactor:** Further shrink client bundles by lifting static chrome into the server layout—out of scope for the current wave.

## 3) Tag inventory

| Tag | Meaning | Invalidation triggers |
| --- | --- | --- |
| `listings:public` | All public **list** fetches (`fetchPublicListings`) | Any `revalidatePublicListingCache()` call (create/update/delete/publish/mark rented/admin approve/reject) |
| `listings:detail:<slugOrId>` | Public **detail** fetch for that URL param | `revalidatePublicListingCache(id)` when `id` is passed |

Tag helpers live in `src/lib/cache/listing-tags.ts`.
