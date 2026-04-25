# Frontend Rent Listing Detail Sections Design

Date: 2026-04-25  
Scope: Frontend UI-only (no backend contract changes in this phase)

## Context

The rent listing detail page needs richer decision-making information while staying visually consistent with buy mode and existing shared detail UI. The goal is to help renters compare listings quickly without requiring backend schema changes in phase 1.

## Goals

- Reuse existing shared detail components where possible (gallery and common sections).
- Add rent-specific sections through isolated child components.
- Show all rent detail sections expanded by default.
- Use a hybrid presentation in detail-heavy sections:
  - quick scan chips
  - compact detail table
- Handle missing data transparently using friendly prompts.
- Add diverse mock listings to validate visual behavior across multiple data shapes.

## Non-Goals (Phase 1)

- No API/backend payload or DB schema changes.
- No listing creation form changes.
- No buy mode redesign beyond shared component reuse.

## Approved UX Decisions

- Implementation approach: modular section system with `RentDetailSections` and child components.
- Reuse-first strategy: keep buy/rent visual consistency by reusing shared blocks first, then composing rent-only sections.
- Section order (fixed):
  1. Short description block (rent-focused tone)
  2. Utilities
  3. Building amenities
  4. Unit utilities
  5. Floor plan
  6. Rent-specific details table
  7. Map location panel
- Missing data pattern: show contextual fallback text, `Ask owner for this detail`.

## Architecture

## Shared Detail Layer (reused)

These stay in the existing listing detail composition and should be reused between buy and rent:

- Gallery / cover image flow
- Title + location header
- Key stats (bed, bath, area, availability)
- Price + contact card
- Owner and safety/report blocks

## Rent-Specific Layer

Add a dedicated wrapper that renders only when purpose is rent:

- `RentDetailSections`
  - `RentShortDescriptionSection`
  - `RentUtilitiesSection`
  - `RentBuildingAmenitiesSection`
  - `RentUnitUtilitiesSection`
  - `RentFloorPlanSection`
  - `RentDetailsTableSection`
  - `RentMapSection`

Each child component has one purpose and receives pre-mapped display rows instead of raw ad-hoc rendering logic.

## Data Mapping Strategy (UI-only)

Because some requested fields do not yet exist explicitly in the listing contract, UI components use mapping helpers with deterministic fallback behavior.

Proposed mapping helpers:

- `toUtilityRows(listing, amenities)`
- `toBuildingAmenityRows(listing, amenities)`
- `toUnitUtilityRows(listing, amenities)`
- `toRentDetailRows(listing)`

Mapping rules:

- Prefer direct listing fields when available.
- Use amenity name/code matches for inferred booleans where direct fields are absent.
- For unresolved values, render `Ask owner for this detail`.
- Keep `area_sqft` as source and show computed `m²` as secondary helper text.

## Section Behavior

## 1) Short description block

- Uses existing listing description.
- Tone and heading optimized for renters.
- Missing description fallback: `Ask owner for this detail`.

## 2) Utilities

- Hybrid presentation:
  - chips for scanability (Included, Tenant pays, Not specified)
  - compact `Item | Status` table for precision
- Typical rows: water, gas, electricity, garbage, internet, others.

## 3) Building amenities

- Hybrid chips + table.
- Typical rows: parking, gym, storage locker, elevator, security.

## 4) Unit utilities

- Hybrid chips + table.
- Typical rows: Wi-Fi included, furnishing level, balcony, air conditioning, heating.

## 5) Floor plan

- If floor plan media is unavailable, render a placeholder panel with:
  - fallback text (`Ask owner for this detail`)
  - optional contact-owner CTA.

## 6) Rent-specific details table

- Dense comparison-friendly table with all key attributes.
- Rows remain visible even when value is missing, using fallback prompt.

## 7) Map location panel

- If lat/lng available: render location map panel.
- If missing: render informative fallback card with prompt text.

## Mock Data Expansion Requirement

To verify UI states and avoid optimistic-only design, add/adjust frontend mock listing data with multiple rent variants:

- Full-data listing (all sections populated).
- Sparse-data listing (many values missing; fallback text visible).
- Mixed-data listing (partial utilities, partial amenities).
- Premium listing (high amenity density, full unit utilities).
- Minimal listing (description + core facts only).

Mock variants must explicitly validate:

- section order
- hybrid chips + table rendering
- fallback text behavior
- map/floor-plan missing-data states
- `sqft` + computed `m²` helper visibility

## Error and Resilience Behavior

- Section-level rendering must never crash the page due to missing fields.
- Missing data affects only local row display, not entire page layout.
- Shared detail layer remains stable regardless of rent section completeness.

## Testing Strategy (Frontend)

- Unit tests for mapping helpers (full, mixed, sparse input cases).
- Component tests for:
  - exact section order
  - hybrid rendering in utilities/amenities/unit utilities
  - fallback prompt text visibility
  - floor plan and map fallback states
  - `m²` helper rendering from `area_sqft`
- Regression checks for existing listing detail behavior.

## Risks and Mitigations

- Risk: large detail component grows hard to maintain.  
  Mitigation: split into focused child sections with clear interfaces.

- Risk: inferred values from amenities can be inconsistent.  
  Mitigation: centralize mapping logic and keep explicit fallback state.

- Risk: UI mismatch between buy and rent detail pages.  
  Mitigation: enforce shared component reuse and style contracts.

## Implementation Handoff Notes

- Start by extracting shared blocks only where already duplicated or likely to diverge.
- Keep rent-only rendering behind purpose checks.
- Do not add new backend types in this phase; keep UI mapping local and explicit.
- Use mock variants during implementation to validate the visual system before integrating additional data sources.
