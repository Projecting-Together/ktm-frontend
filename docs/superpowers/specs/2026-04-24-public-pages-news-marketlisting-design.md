# Public Pages + News and MarketListing Design

**Date:** 2026-04-24  
**Status:** Approved design draft  
**Scope:** Add deployment-ready public pages and introduce dynamic `News` and separate `MarketListing` modules.

## 1) Goal

Make the platform feel complete and launch-ready by adding:

- Static public pages: `Contact`, `About Us`, `Privacy Policy`, `Terms of Service`
- Dynamic modules: `News`, `MarketListing`

The implementation must keep existing apartment-listing flows stable and avoid risky refactors.

## 2) Decisions Captured

- **Delivery strategy:** Static legal/info pages + dynamic `News` and `MarketListing`
- **Content ownership:** Admin + Agents + Owners
- **Publishing policy:** Trusted Agents auto-publish; Owners require admin approval
- **MarketListing domain:** Separate marketplace module (not a view over existing apartment listings)
- **Architecture option selected:** Lightweight separate modules (Approach 1)

## 3) Architecture

### 3.1 Route-level structure

Public pages under `src/app/(public)`:

- `about/page.tsx`
- `contact/page.tsx`
- `privacy/page.tsx`
- `terms/page.tsx`
- `news/page.tsx`
- `news/[slug]/page.tsx`
- `market-listing/page.tsx`
- `market-listing/[slug]/page.tsx`

Management routes:

- `manage/news/page.tsx`
- `manage/market-listing/page.tsx`
- `admin/news/page.tsx`
- `admin/market-listing/page.tsx`

### 3.2 Separation of concerns

- Static pages are code-managed and server-rendered for predictable deploy behavior.
- `News` and `MarketListing` are independent modules with their own data models, validation, and role-aware workflows.
- Existing apartment listing domain remains unchanged except optional shared UI primitives.

## 4) Components and Data Flow

### 4.1 Public consumption flow

- `News` index shows published articles sorted by most recent.
- `News` detail page resolves by slug.
- `MarketListing` index shows published market items with basic filters (price/location/type).
- `MarketListing` detail page resolves by slug and shows contact CTA.

### 4.2 Authoring flow

Actor capabilities:

- **Admin:** full CRUD, approve/reject, publish/unpublish
- **Trusted Agent:** create/edit + auto-publish
- **Owner:** create/edit + submit for review

Status lifecycle:

- `draft` -> `pending_review` -> `published`
- `rejected` for moderated declines

Publishing behavior:

- Owner submissions move to `pending_review`
- Trusted Agent submissions can become `published` immediately
- Admin can override state transitions as moderation authority

### 4.3 Suggested v1 data contracts

`News` fields:

- `id`, `title`, `slug`, `summary`, `body`, `coverImage`
- `status`, `authorId`, `publishedAt`, timestamps

`MarketListing` fields:

- `id`, `title`, `slug`, `description`
- `price`, `currency`, `location`, `propertyType`, `images`
- `status`, `ownerId`, `publishedAt`, timestamps

## 5) Navigation and Platform Completeness

- Add top navigation links for `About`, `Contact`, `News`, `MarketListing`
- Add footer links for `Privacy Policy` and `Terms of Service`
- Ensure page metadata (title/description) is present for launch readiness

## 6) Error Handling and Safety

- Validate all create/update payloads server-side (required fields, enums, numeric checks, slug uniqueness).
- Enforce role-based transition guards:
  - Owners cannot directly set `published`
  - Trusted Agents can publish
  - Admins can publish/unpublish/approve/reject
- Public routes must return only `published` records.
- Unknown slugs return route-safe not-found behavior.
- Manage/admin UIs show clear success/failure feedback and rejection reasons.

## 7) Testing Strategy

### 7.1 Unit tests

- Status transition policy by role
- Slug creation + uniqueness constraints
- Payload validation rules

### 7.2 Integration tests

- Owner create/edit -> `pending_review`
- Trusted Agent create/edit -> `published`
- Admin approve/reject/unpublish transitions
- Public listings only include `published` records

### 7.3 E2E smoke tests

- Create content per role and verify visibility/state behavior
- Verify navigation and rendering of all static pages
- Verify detail route behavior for valid and invalid slugs

## 8) Non-Goals (This Phase)

- No migration of existing apartment-listing schema into market module
- No generalized CMS abstraction for all content types
- No full-text search or advanced editorial workflow beyond defined moderation states

## 9) Rollout Notes

- Implement in small slices: static pages first, then `News`, then `MarketListing`, then admin/manage wiring.
- Keep module boundaries explicit to reduce regression risk and simplify future extension.

## Spec Self-Review

- **Placeholder scan:** No `TODO`, `TBD`, or deferred placeholders remain.
- **Internal consistency:** Ownership, moderation policy, and status transitions are consistent across sections.
- **Scope check:** The document is scoped for a single implementation plan cycle.
- **Ambiguity check:** Publish permissions and module boundaries are explicit.
