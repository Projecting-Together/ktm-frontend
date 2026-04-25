# Loading and Suspense intent (Wave 3)

Date: 2026-04-24

## Principles

- `loading.tsx` is **presentation-only** (no `fetch`).
- Coexistence: `/apartments` uses route `loading.tsx` for segment transitions **and** `Suspense` around `SearchPageClient` for client subtree streaming — different scopes (segment vs client island).

## Route boundaries

| File | UX intent |
| --- | --- |
| `src/app/(public)/loading.tsx` | Show marketing shell (container + skeleton hero blocks) while any `(public)` child segment loads. |
| `src/app/(public)/news/loading.tsx` | Show list-card skeletons while news index loads. |
| `src/app/(public)/news/[slug]/loading.tsx` | Show article skeleton while slug page loads. |
| `src/app/(public)/market-listing/loading.tsx` | Show feed card skeletons while market index loads. |
| `src/app/(public)/market-listing/[slug]/loading.tsx` | Show detail skeleton while market detail loads. |
| `src/app/(public)/agents/loading.tsx` | Show card grid skeleton while agents index loads. |
| `src/app/(public)/apartments/loading.tsx` | (Existing) Segment transition skeleton; pairs with inner `Suspense` on `apartments/page.tsx` for search UI. |

## NOW-3 evidence (dashboard `/dashboard` First Load JS)

Record from `npm run build` output (First Load JS column for route `/dashboard`).

| Stage | First Load JS | Captured |
| --- | --- | --- |
| Before server `page.tsx` + client island | 129 kB | `npm run build` on branch `feat/wave3-loading-islands-isr` (Next route table, `/dashboard` third column). |
| After refactor | 129 kB | Same `npm run build` table after server `page.tsx` + `DashboardOverviewClient` split (shared First Load JS unchanged at route granularity). |

## Perf verification

- Run `npm run test:perf` for mocked perf suites (includes home ISR baseline once `home-isr.mocked.perf.spec.ts` exists).

## Related

- `docs/superpowers/route-cache-intent.md`
- `docs/superpowers/specs/2026-04-24-frontend-wave3-loading-islands-isr-verification-design.md`
