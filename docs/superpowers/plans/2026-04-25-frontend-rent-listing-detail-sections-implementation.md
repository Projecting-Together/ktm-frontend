# Rent Listing Detail Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a rent-detail UI that reuses shared listing-detail blocks and adds ordered rent-specific sections with hybrid chips+table presentation, graceful missing-data prompts, and robust mock data coverage.

**Architecture:** Keep shared listing detail UI behavior in `ListingDetailClient` and render a dedicated `RentDetailSections` composition only when `listing.purpose === "rent"`. Move rent-only rendering into focused child components and pure mapping helpers so section logic is testable independent of page layout. Expand mock data variants to validate full, sparse, and mixed rent listing states before backend contract expansion.

**Tech Stack:** Next.js App Router, React + TypeScript, existing listing domain types in `src/lib/api/types.ts`, Jest + Testing Library unit tests, integration tests with MSW mocks, pnpm.

---

## File Structure and Responsibilities

- `src/components/listings/ListingDetailClient.tsx` - host page; keep shared blocks and mount rent section wrapper in purpose-aware flow.
- `src/components/listings/rent-detail/RentDetailSections.tsx` - rent section orchestrator with approved section order.
- `src/components/listings/rent-detail/RentSectionCard.tsx` - shared visual shell for each rent section.
- `src/components/listings/rent-detail/RentStatusChips.tsx` - reusable chips renderer for utility/amenity/unit-utility statuses.
- `src/components/listings/rent-detail/RentDetailsTable.tsx` - reusable compact two-column detail table.
- `src/components/listings/rent-detail/RentShortDescriptionSection.tsx` - rent-focused description block with fallback text.
- `src/components/listings/rent-detail/RentUtilitiesSection.tsx` - utilities chips + table.
- `src/components/listings/rent-detail/RentBuildingAmenitiesSection.tsx` - building amenities chips + table.
- `src/components/listings/rent-detail/RentUnitUtilitiesSection.tsx` - unit utilities chips + table.
- `src/components/listings/rent-detail/RentFloorPlanSection.tsx` - floor-plan panel + missing-data state.
- `src/components/listings/rent-detail/RentDetailsTableSection.tsx` - rent-specific all-properties detail table.
- `src/components/listings/rent-detail/RentMapSection.tsx` - map panel + missing lat/lng fallback state.
- `src/components/listings/rent-detail/rentDetailMappers.ts` - pure mapping helpers for row/chip models and fallback states.
- `src/components/listings/rent-detail/types.ts` - narrow display-model types for sections.
- `src/lib/utils.ts` - add/extend helper for `sqft -> m²` formatting if not already present.
- `src/test-utils/mockData.ts` - add rich rent listing variants for UI testing.
- `src/lib/mocks/admin/listings.ts` - align admin/listing mocks with new rent variants where needed.
- `src/msw/handlers.ts` - optional: wire one or more new rent variants into listing-detail response fixtures.
- `tests/unit/components/ListingDetailClient.test.tsx` - verify purpose-based section rendering and regressions.
- `tests/unit/components/rent-detail/RentDetailSections.test.tsx` - verify section order and fallback states.
- `tests/unit/components/rent-detail/rentDetailMappers.test.ts` - verify mapping logic for full/mixed/sparse cases.

---

### Task 1: Create rent display models and mapper helpers

**Files:**
- Create: `src/components/listings/rent-detail/types.ts`
- Create: `src/components/listings/rent-detail/rentDetailMappers.ts`
- Create: `tests/unit/components/rent-detail/rentDetailMappers.test.ts`
- Test: `tests/unit/components/rent-detail/rentDetailMappers.test.ts`

- [ ] **Step 1: Write failing mapper tests (full + sparse + mixed)**

```ts
// tests/unit/components/rent-detail/rentDetailMappers.test.ts
import { toUtilityRows, toRentDetailRows, toSqmLabel } from "@/components/listings/rent-detail/rentDetailMappers";
import { buildRentListingFull, buildRentListingSparse } from "@/test-utils/mockData";

describe("rent detail mappers", () => {
  it("maps known utility values and keeps unresolved rows", () => {
    const full = buildRentListingFull();
    const sparse = buildRentListingSparse();

    expect(toUtilityRows(full).find((row) => row.label === "Water")?.status).toBeTruthy();
    expect(toUtilityRows(sparse).every((row) => row.status.length > 0)).toBe(true);
  });

  it("formats sqft and sqm helper", () => {
    expect(toSqmLabel(1000)).toBe("92.9 m²");
    expect(toRentDetailRows(buildRentListingSparse()).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run mapper tests to confirm failure**

Run: `pnpm test -- tests/unit/components/rent-detail/rentDetailMappers.test.ts`  
Expected: FAIL with missing mapper module/exports.

- [ ] **Step 3: Implement mapper types and fallback model**

```ts
// src/components/listings/rent-detail/types.ts
export interface RentStatusRow {
  label: string;
  status: string;
  tone: "positive" | "neutral" | "warning";
}

export interface RentDetailRow {
  key: string;
  value: string;
}

export const MISSING_DETAIL_TEXT = "Ask owner for this detail";
```

- [ ] **Step 4: Implement utility/detail mapper helpers**

```ts
// src/components/listings/rent-detail/rentDetailMappers.ts
import type { Listing } from "@/lib/api/types";
import { MISSING_DETAIL_TEXT, type RentDetailRow, type RentStatusRow } from "./types";

export function toSqmLabel(areaSqft?: number | null): string {
  if (areaSqft == null) return MISSING_DETAIL_TEXT;
  const sqm = areaSqft * 0.092903;
  return `${sqm.toFixed(1)} m²`;
}

export function toUtilityRows(listing: Listing): RentStatusRow[] {
  const base = [
    { label: "Water", status: MISSING_DETAIL_TEXT },
    { label: "Gas", status: MISSING_DETAIL_TEXT },
    { label: "Electricity", status: MISSING_DETAIL_TEXT },
    { label: "Garbage", status: MISSING_DETAIL_TEXT },
  ];
  return base.map((row) => ({ ...row, tone: row.status === MISSING_DETAIL_TEXT ? "warning" : "positive" }));
}

export function toRentDetailRows(listing: Listing): RentDetailRow[] {
  return [
    { key: "Bedrooms", value: listing.bedrooms != null ? String(listing.bedrooms) : MISSING_DETAIL_TEXT },
    { key: "Bathrooms", value: listing.bathrooms != null ? String(listing.bathrooms) : MISSING_DETAIL_TEXT },
    { key: "Area", value: listing.area_sqft != null ? `${listing.area_sqft} sqft (${toSqmLabel(listing.area_sqft)})` : MISSING_DETAIL_TEXT },
  ];
}
```

- [ ] **Step 5: Re-run mapper tests**

Run: `pnpm test -- tests/unit/components/rent-detail/rentDetailMappers.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/listings/rent-detail/types.ts src/components/listings/rent-detail/rentDetailMappers.ts tests/unit/components/rent-detail/rentDetailMappers.test.ts
git commit -m "feat: add rent detail mapping models and helper mappers"
```

---

### Task 2: Build reusable rent section primitives (card, chips, table)

**Files:**
- Create: `src/components/listings/rent-detail/RentSectionCard.tsx`
- Create: `src/components/listings/rent-detail/RentStatusChips.tsx`
- Create: `src/components/listings/rent-detail/RentDetailsTable.tsx`
- Create: `tests/unit/components/rent-detail/RentDetailSections.test.tsx`
- Test: `tests/unit/components/rent-detail/RentDetailSections.test.tsx`

- [ ] **Step 1: Write failing primitive render tests**

```tsx
// tests/unit/components/rent-detail/RentDetailSections.test.tsx
import { render, screen } from "@testing-library/react";
import { RentStatusChips } from "@/components/listings/rent-detail/RentStatusChips";

it("renders chips with statuses", () => {
  render(<RentStatusChips rows={[{ label: "Water", status: "Included", tone: "positive" }]} />);
  expect(screen.getByText("Water")).toBeInTheDocument();
  expect(screen.getByText("Included")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `pnpm test -- tests/unit/components/rent-detail/RentDetailSections.test.tsx -t "renders chips with statuses"`  
Expected: FAIL with missing component exports.

- [ ] **Step 3: Implement section shell and chip/table primitives**

```tsx
// src/components/listings/rent-detail/RentSectionCard.tsx
export function RentSectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}
```

- [ ] **Step 4: Re-run primitive test**

Run: `pnpm test -- tests/unit/components/rent-detail/RentDetailSections.test.tsx -t "renders chips with statuses"`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/listings/rent-detail/RentSectionCard.tsx src/components/listings/rent-detail/RentStatusChips.tsx src/components/listings/rent-detail/RentDetailsTable.tsx tests/unit/components/rent-detail/RentDetailSections.test.tsx
git commit -m "feat: add reusable rent section UI primitives"
```

---

### Task 3: Implement ordered rent-specific section components

**Files:**
- Create: `src/components/listings/rent-detail/RentShortDescriptionSection.tsx`
- Create: `src/components/listings/rent-detail/RentUtilitiesSection.tsx`
- Create: `src/components/listings/rent-detail/RentBuildingAmenitiesSection.tsx`
- Create: `src/components/listings/rent-detail/RentUnitUtilitiesSection.tsx`
- Create: `src/components/listings/rent-detail/RentFloorPlanSection.tsx`
- Create: `src/components/listings/rent-detail/RentDetailsTableSection.tsx`
- Create: `src/components/listings/rent-detail/RentMapSection.tsx`
- Create: `src/components/listings/rent-detail/RentDetailSections.tsx`
- Modify: `tests/unit/components/rent-detail/RentDetailSections.test.tsx`
- Test: `tests/unit/components/rent-detail/RentDetailSections.test.tsx`

- [ ] **Step 1: Write failing section-order test**

```tsx
// tests/unit/components/rent-detail/RentDetailSections.test.tsx
import { render, screen } from "@testing-library/react";
import { RentDetailSections } from "@/components/listings/rent-detail/RentDetailSections";
import { buildRentListingSparse } from "@/test-utils/mockData";

it("renders rent sections in approved order", () => {
  render(<RentDetailSections listing={buildRentListingSparse()} />);
  const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
  expect(headings).toEqual([
    "Description",
    "Utilities",
    "Building Amenities",
    "Unit Utilities",
    "Floor Plan",
    "Property Details",
    "Location",
  ]);
});
```

- [ ] **Step 2: Run test to confirm failure**

Run: `pnpm test -- tests/unit/components/rent-detail/RentDetailSections.test.tsx -t "renders rent sections in approved order"`  
Expected: FAIL with missing component.

- [ ] **Step 3: Implement section components and wrapper in exact order**

```tsx
// src/components/listings/rent-detail/RentDetailSections.tsx
import type { Listing } from "@/lib/api/types";
import { RentShortDescriptionSection } from "./RentShortDescriptionSection";
import { RentUtilitiesSection } from "./RentUtilitiesSection";
import { RentBuildingAmenitiesSection } from "./RentBuildingAmenitiesSection";
import { RentUnitUtilitiesSection } from "./RentUnitUtilitiesSection";
import { RentFloorPlanSection } from "./RentFloorPlanSection";
import { RentDetailsTableSection } from "./RentDetailsTableSection";
import { RentMapSection } from "./RentMapSection";

export function RentDetailSections({ listing }: { listing: Listing }) {
  return (
    <div className="mt-8 space-y-5">
      <RentShortDescriptionSection listing={listing} />
      <RentUtilitiesSection listing={listing} />
      <RentBuildingAmenitiesSection listing={listing} />
      <RentUnitUtilitiesSection listing={listing} />
      <RentFloorPlanSection listing={listing} />
      <RentDetailsTableSection listing={listing} />
      <RentMapSection listing={listing} />
    </div>
  );
}
```

- [ ] **Step 4: Add explicit fallback state assertions**

```tsx
// tests/unit/components/rent-detail/RentDetailSections.test.tsx
it("shows fallback text for missing rows", () => {
  render(<RentDetailSections listing={buildRentListingSparse()} />);
  expect(screen.getAllByText("Ask owner for this detail").length).toBeGreaterThan(0);
});
```

- [ ] **Step 5: Re-run section tests**

Run: `pnpm test -- tests/unit/components/rent-detail/RentDetailSections.test.tsx`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/listings/rent-detail/RentShortDescriptionSection.tsx src/components/listings/rent-detail/RentUtilitiesSection.tsx src/components/listings/rent-detail/RentBuildingAmenitiesSection.tsx src/components/listings/rent-detail/RentUnitUtilitiesSection.tsx src/components/listings/rent-detail/RentFloorPlanSection.tsx src/components/listings/rent-detail/RentDetailsTableSection.tsx src/components/listings/rent-detail/RentMapSection.tsx src/components/listings/rent-detail/RentDetailSections.tsx tests/unit/components/rent-detail/RentDetailSections.test.tsx
git commit -m "feat: add ordered rent-specific detail sections with fallbacks"
```

---

### Task 4: Integrate rent sections into ListingDetailClient with reuse-first layout

**Files:**
- Modify: `src/components/listings/ListingDetailClient.tsx`
- Modify: `tests/unit/components/ListingDetailClient.test.tsx`
- Test: `tests/unit/components/ListingDetailClient.test.tsx`

- [ ] **Step 1: Write failing purpose-gated rendering test**

```tsx
// tests/unit/components/ListingDetailClient.test.tsx
it("renders rent detail sections for rent listings only", () => {
  render(<ListingDetailClient listing={buildRentListingFull()} />);
  expect(screen.getByRole("heading", { name: "Utilities" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run targeted test to verify failure**

Run: `pnpm test -- tests/unit/components/ListingDetailClient.test.tsx -t "renders rent detail sections for rent listings only"`  
Expected: FAIL because rent wrapper is not mounted.

- [ ] **Step 3: Integrate `RentDetailSections` and keep shared components unchanged**

```tsx
// src/components/listings/ListingDetailClient.tsx
import { RentDetailSections } from "@/components/listings/rent-detail/RentDetailSections";

// inside left column body, after shared description/amenities block:
{listing.purpose === "rent" && <RentDetailSections listing={listing} />}
```

- [ ] **Step 4: Add regression assertion for non-rent listing**

```tsx
// tests/unit/components/ListingDetailClient.test.tsx
it("does not render rent sections for sale listings", () => {
  render(<ListingDetailClient listing={buildSaleListing()} />);
  expect(screen.queryByRole("heading", { name: "Utilities" })).not.toBeInTheDocument();
});
```

- [ ] **Step 5: Re-run client tests**

Run: `pnpm test -- tests/unit/components/ListingDetailClient.test.tsx`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/listings/ListingDetailClient.tsx tests/unit/components/ListingDetailClient.test.tsx
git commit -m "feat: mount rent detail section wrapper in listing detail page"
```

---

### Task 5: Expand mock data variants and wire test fixtures

**Files:**
- Modify: `src/test-utils/mockData.ts`
- Modify: `src/lib/mocks/admin/listings.ts`
- Modify: `src/msw/handlers.ts`
- Modify: `tests/unit/components/rent-detail/rentDetailMappers.test.ts`
- Modify: `tests/unit/components/rent-detail/RentDetailSections.test.tsx`
- Test: `tests/unit/components/rent-detail/rentDetailMappers.test.ts`, `tests/unit/components/rent-detail/RentDetailSections.test.tsx`

- [ ] **Step 1: Write failing tests that require multiple rent variants**

```ts
// tests/unit/components/rent-detail/rentDetailMappers.test.ts
import { buildRentListingFull, buildRentListingMixed, buildRentListingSparse, buildRentListingPremium, buildRentListingMinimal } from "@/test-utils/mockData";

it("supports all required mock listing variants", () => {
  expect(buildRentListingFull().purpose).toBe("rent");
  expect(buildRentListingMixed().purpose).toBe("rent");
  expect(buildRentListingSparse().purpose).toBe("rent");
  expect(buildRentListingPremium().purpose).toBe("rent");
  expect(buildRentListingMinimal().purpose).toBe("rent");
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm test -- tests/unit/components/rent-detail/rentDetailMappers.test.ts`  
Expected: FAIL with missing variant builders.

- [ ] **Step 3: Add five explicit rent variant builders**

```ts
// src/test-utils/mockData.ts
export const buildRentListingFull = (): Listing => ({ ...baseRentListing, /* all section data populated */ });
export const buildRentListingSparse = (): Listing => ({ ...baseRentListing, description: null, area_sqft: null, amenities: [] });
export const buildRentListingMixed = (): Listing => ({ ...baseRentListing, amenities: [wifiAmenity], area_sqft: 920 });
export const buildRentListingPremium = (): Listing => ({ ...baseRentListing, amenities: [wifiAmenity, gymAmenity, storageAmenity], area_sqft: 1800 });
export const buildRentListingMinimal = (): Listing => ({ ...baseRentListing, bedrooms: 1, bathrooms: 1, description: "Compact city unit." });
```

- [ ] **Step 4: Re-run variant and section tests**

Run: `pnpm test -- tests/unit/components/rent-detail/rentDetailMappers.test.ts tests/unit/components/rent-detail/RentDetailSections.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/test-utils/mockData.ts src/lib/mocks/admin/listings.ts src/msw/handlers.ts tests/unit/components/rent-detail/rentDetailMappers.test.ts tests/unit/components/rent-detail/RentDetailSections.test.tsx
git commit -m "test: add diverse rent listing mock variants for detail UI states"
```

---

### Task 6: Full verification pass and docs alignment

**Files:**
- Modify: `docs/superpowers/specs/2026-04-25-frontend-rent-listing-detail-sections-design.md` (only if implementation decisions differ)
- Modify: `docs/superpowers/plans/2026-04-25-frontend-rent-listing-detail-sections-implementation.md` (checklist updates only)
- Test: `tests/unit/components/ListingDetailClient.test.tsx`, `tests/unit/components/rent-detail/RentDetailSections.test.tsx`, `tests/unit/components/rent-detail/rentDetailMappers.test.ts`

- [ ] **Step 1: Run focused unit test suite**

Run: `pnpm test -- tests/unit/components/ListingDetailClient.test.tsx tests/unit/components/rent-detail/RentDetailSections.test.tsx tests/unit/components/rent-detail/rentDetailMappers.test.ts`  
Expected: PASS.

- [ ] **Step 2: Run lint/type checks for changed files**

Run: `pnpm lint`  
Expected: PASS with no new lint errors.

Run: `pnpm typecheck`  
Expected: PASS with no new type errors.

- [ ] **Step 3: Validate manual UI behavior on rent and sale samples**

Run: `pnpm dev`  
Expected:
- rent listing shows ordered sections: Description -> Utilities -> Building Amenities -> Unit Utilities -> Floor Plan -> Property Details -> Location
- sale listing does not show rent-specific sections
- missing values display `Ask owner for this detail`

- [ ] **Step 4: Commit final polish and docs consistency updates**

```bash
git add src/components/listings/ListingDetailClient.tsx src/components/listings/rent-detail docs/superpowers/specs/2026-04-25-frontend-rent-listing-detail-sections-design.md docs/superpowers/plans/2026-04-25-frontend-rent-listing-detail-sections-implementation.md tests/unit/components/ListingDetailClient.test.tsx tests/unit/components/rent-detail src/test-utils/mockData.ts src/lib/mocks/admin/listings.ts src/msw/handlers.ts
git commit -m "feat: deliver rent listing detail sections with reusable shared layout"
```

---

## Self-Review Checklist (Completed)

- **Spec coverage:** All approved requirements are mapped: reuse-first architecture, exact section order, hybrid chips+table UI, fallback text, floor-plan/map missing states, and expanded mock variants.
- **Placeholder scan:** No `TBD`, `TODO`, or abstract-only implementation steps present.
- **Type consistency:** Mapper/type names are consistent across tasks (`RentStatusRow`, `RentDetailRow`, `toUtilityRows`, `toRentDetailRows`, `RentDetailSections`).
