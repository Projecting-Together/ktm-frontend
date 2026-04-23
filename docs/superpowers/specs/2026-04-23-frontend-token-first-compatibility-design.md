# Frontend Token-First Redesign and Backend Compatibility Prep

Date: 2026-04-23
Owner: Frontend Team
Status: Approved for planning

## 1) Objective

Redesign the frontend for stronger UX consistency and easier long-term maintenance by:
- making search and filtering clearer and always accessible,
- aligning priority pages (listing, map, profile, sign in/up) with a shared UI system,
- introducing a single centralized theme configuration that enables palette changes without editing component code,
- preparing a frontend API contract/adapter layer so backend integration next week is low-risk.

This phase is frontend-only. Live backend integration is intentionally deferred to next Saturday.

## 2) Scope

### In scope

- Global sticky, always-visible search bar on key user-facing pages.
- Filter panel redesign:
  - remove Neighborhood filter section,
  - replace price preset bubbles with range slider + min/max numeric inputs,
  - convert Home Type choices into box/card-style selection,
  - keep bedroom and bathroom selectors as current numeric pattern (1, 2, 3, 4+),
  - keep furnishing as toggle-style control.
- Listing page improvements (grid/list parity and consistency).
- Map page simplification:
  - simple markers only,
  - no price overlays on pins,
  - no clustering/grouping in this phase.
- Auth pages:
  - sign in with email/password and Google sign-in action,
  - sign up with first name, last name, email, password, confirm password,
  - remove role selection for now.
- Profile redesign:
  - public profile view,
  - editable account profile sections.
- Single active theme config and full-frontend token migration.
- Frontend contract layer with DTOs and adapters for listings, map, auth, and profile.

### Out of scope

- Connecting to live backend endpoints.
- API integration testing with backend services.
- Map marker price overlays and clustering.
- Deployment execution (Railway deployment details are tracked but not implemented here).

## 3) Architecture Design

### 3.1 Theme System (single source of truth)

Adopt one active semantic theme definition as the only source of color truth.

Core principle:
- components and pages consume semantic theme tokens, never hardcoded color values.

Proposed token groups:
- `color.background`
- `color.surface`
- `color.surfaceMuted`
- `color.textPrimary`
- `color.textSecondary`
- `color.border`
- `color.primary`
- `color.primaryForeground`
- `color.accent`
- `color.success`
- `color.warning`
- `color.danger`
- `color.focusRing`

Implementation pattern:
- one theme config module exports token values,
- global CSS variables are generated/applied from that config,
- utility classes (Tailwind or shared classnames) map to semantic variables,
- component styles only reference semantic utilities/tokens.

Result:
- when the future palette arrives, editing one config updates visuals everywhere without component-level code changes.

### 3.2 Frontend Contract + Adapter Layer

Create a stable contract layer that decouples UI components from transport shape differences.

Design:
- DTO type definitions for each domain (listing/map/profile/auth),
- adapters that map mock data into DTOs used by UI components,
- page-level hooks/components consume normalized DTOs only.

Benefits:
- API integration next week becomes a data source swap, not a page rewrite,
- stronger type safety and easier contract tests,
- reduced regression risk when backend schema evolves.

## 4) UX and Component Design

### 4.1 Global Search Bar

- Make search bar sticky and persistent on all primary user flows.
- Ensure it remains keyboard accessible and screen-reader labeled.
- Include search query and neighborhood/location input in search bar itself.
- Because neighborhood search is moved into search, remove neighborhood from filter panel.

### 4.2 Filter Panel

- Keep existing filter panel placement model (desktop sidebar + mobile drawer), but redesign internals.
- Replace price presets with:
  - a two-handle range slider for quick selection,
  - synchronized min and max numeric inputs for precision control.
- Use card/box UI for Home Type choices with explicit selected state.
- Preserve bedroom and bathroom selector interactions in current style.
- Keep furnishing as toggle-style choice.

### 4.3 Listing Page (grid/list)

- Maintain both grid and list modes.
- Ensure identical filter/search behavior across both views.
- Improve visual hierarchy using semantic token-based card and typography styling.
- Ensure loading/empty/error states are consistent with shared UI state components.

### 4.4 Map Page

- Render simple markers only for now.
- Remove price-on-pin overlays in this phase.
- Keep architecture ready for future clustering but do not enable clustering yet.

### 4.5 Auth Pages

Sign in:
- Email
- Password
- Sign in with Google entry point

Sign up:
- First name
- Last name
- Email
- Password
- Confirm password

Constraints:
- No role picker (renter/owner/agent) at this stage.
- Shared validation and semantic form styling.

### 4.6 Profile

Include two coherent profile surfaces:
- public profile page (viewed by other users),
- editable account profile for current user.

Both surfaces consume shared profile DTO shape to avoid divergence and ease backend wiring later.

## 5) Data Flow

Current phase flow:
1. UI emits search/filter/form interactions.
2. Local stores/hooks hold state.
3. Adapters normalize mock/local data into DTOs.
4. Components render DTO-driven UI.

Next week flow (planned):
1. Fetch from backend clients.
2. Map response payloads through same adapters.
3. Existing DTO-driven UI remains unchanged.

## 6) Error Handling and UX States

Standardize reusable states for:
- loading,
- empty/no results,
- recoverable error (with retry actions),
- validation errors (auth/profile forms).

Rules:
- state visuals must use semantic tokens,
- messages should be explicit and action-oriented,
- controls remain accessible in all states.

## 7) Testing Strategy

Frontend-only verification for this phase:
- unit/component tests:
  - slider + min/max sync behavior,
  - filter state transitions,
  - auth validation rules,
  - profile form validation.
- integration/page behavior checks:
  - sticky search bar visibility on target routes,
  - filter consistency across grid/list/map modes.
- contract tests:
  - adapter output matches DTO contracts for mock fixtures.

No live API tests in this phase.

## 8) Rollout Order

1. Theme token infrastructure and semantic utilities.
2. Shared DTO and adapter layer.
3. Search/filter redesign.
4. Listing and map updates.
5. Auth pages.
6. Profile pages (public + editable).
7. Full-frontend pass to remove remaining hardcoded colors.
8. Frontend test pass and polish.

## 9) Risks and Mitigations

- Risk: hidden hardcoded colors remain after migration.
  - Mitigation: run targeted scans and enforce token-only styling on modified files.
- Risk: adapter assumptions drift from backend schema.
  - Mitigation: keep DTOs explicit and schedule quick backend pairing validation next week.
- Risk: UX inconsistency during staged migration.
  - Mitigation: prioritize shared components first and migrate page by page with checklists.

## 10) Integration and Deployment Notes

- Backend integration and collaborative API testing are scheduled for next Saturday.
- Deployment target remains Railway using Docker container workflow.
- This spec intentionally prepares frontend structure for that phase without enabling network coupling now.

## 11) Acceptance Criteria

- Search bar is prominent and always available on primary pages.
- Neighborhood is removed from filter panel and handled via search.
- Price filter uses range slider + min/max inputs.
- Home Type uses box/card style selector.
- Bedroom/bathroom selectors retain existing interaction model.
- Furnishing remains toggle-style.
- Map markers are simple and non-priced.
- Auth forms match approved field sets and remove role selection.
- Profile redesign includes public and editable flows.
- One centralized theme config controls colors across the frontend.
- UI components rely on semantic theme tokens, not hardcoded palette values.
- Frontend contract/adapter layer exists and powers listing/map/profile/auth data shapes.
