# Frontend Neighborhood Hard Removal Design

Date: 2026-04-23
Status: Approved for planning
Owner: Frontend Team

## 1) Goal

Remove the neighborhood concept from the frontend completely.

This includes UI, routes, forms, frontend contracts, frontend query/filter behavior, and tests. The resulting discovery flow is keyword-only search.

## 2) Scope

### In scope

- Remove neighborhood from search UI and query sync.
- Remove neighborhood controls from filtering and listing discovery surfaces.
- Remove neighborhood references from listing form and listing review UI.
- Remove navbar/footer/home neighborhood links or promotional sections.
- Delete neighborhood route family under public pages (`/neighborhoods` index and detail routes).
- Remove neighborhood-specific frontend hooks/client usage where no longer needed.
- Update frontend contracts/adapters/types to avoid neighborhood dependence in active flows.
- Update/replace tests so they validate the new neighborhood-free behavior.

### Out of scope

- Backend schema/API refactors.
- Redirect compatibility for deleted neighborhood routes.
- Reintroducing alternative location taxonomy.

## 3) Product Behavior After Change

- Search is keyword-only; no location/neighborhood field and no neighborhood suggestion dropdown.
- Filter panel has no neighborhood control (already removed in prior pass, preserved here).
- Listing and map pages no longer show neighborhood-driven context badges or neighborhood query copy.
- Navbar/footer/home no longer expose neighborhood navigation surfaces.
- Listing creation wizard no longer requires neighborhood selection.
- `/neighborhoods` pages no longer exist.

## 4) Architecture and Data Boundaries

### 4.1 Search and filter state

- Remove neighborhood keys from frontend filter state and URL synchronization logic.
- Keep state transitions deterministic: only supported keys remain in store selectors and URL parsing.

### 4.2 Frontend contracts and adapters

- Remove neighborhood-specific fields from frontend-owned DTOs where they are used by active UI.
- Keep adapter outputs aligned with current rendered components so no hidden neighborhood dependency remains.

### 4.3 Route surface

- Delete frontend route modules for neighborhood pages.
- Remove all internal links that route to deleted neighborhood pages.

## 5) File/Area Targets

Primary areas expected to change:

- Search/discovery:
  - `components/search/SearchBar.tsx`
  - `components/search/SearchPageClient.tsx`
  - `lib/stores/filterStore.ts`
- Layout/public nav:
  - `components/layout/Navbar.tsx`
  - `components/layout/Footer.tsx`
  - `app/(public)/page.tsx`
- Route deletion:
  - `app/(public)/neighborhoods/page.tsx`
  - `app/(public)/neighborhoods/[slug]/page.tsx`
- Listing wizard/detail:
  - `components/listings/ListingForm/Step2Location.tsx`
  - `components/listings/ListingForm/Step8Review.tsx`
  - related wizard schema usage in `lib/validations/listingSchema.ts`
- Frontend contracts/adapters/types:
  - `lib/contracts/*`
  - `lib/api/types.ts` (frontend-facing usage cleanup only)
  - `lib/hooks/useNeighborhoods.ts` (remove if orphaned)
- Tests:
  - `__tests__/unit/**`
  - `__tests__/integration/**`
  - `__tests__/e2e/**` neighborhood-specific specs and expectations

## 6) Testing Strategy

Required verification:

- Typecheck passes.
- Unit/integration tests pass with neighborhood references removed from active flows.
- E2E tests updated so no test assumes neighborhood routes, neighborhood filters, or neighborhood URL params.

Key test assertions to add/update:

- Search bar renders single keyword input (no location/neighborhood input).
- URL filter sync excludes neighborhood query params.
- Listing wizard validation no longer requires neighborhood selection.
- Internal nav/footer/home have no neighborhood links.
- Neighborhood route tests are removed or replaced with explicit non-existence expectations.

## 7) Risks and Mitigations

- Risk: stale neighborhood references remain in copy, links, or edge pages.
  - Mitigation: codebase-wide neighborhood reference scan and focused cleanup.

- Risk: store/query parsing still accepts neighborhood and silently mutates URL.
  - Mitigation: strict allowlist filtering in query hydration and API filter selectors.

- Risk: test suite failures due to removed routes/fields.
  - Mitigation: update tests in same change set; avoid partial migration.

## 8) Acceptance Criteria

- No neighborhood field/control/suggestion exists in frontend user experience.
- No internal neighborhood page links remain in active frontend UI.
- `/neighborhoods` route modules are deleted from frontend.
- Listing form and related validation do not require neighborhood.
- Frontend query/filter/store logic does not include neighborhood key.
- Frontend contracts/adapters for active flows are neighborhood-independent.
- Updated test suite and typecheck pass.

## 9) Explicit Non-Goals Confirmation

- No backward-compatibility redirects for old neighborhood URLs.
- No partial hiding; this is complete frontend removal.

