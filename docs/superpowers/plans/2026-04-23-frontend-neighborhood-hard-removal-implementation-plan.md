# Frontend Neighborhood Hard Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove neighborhood from frontend end-to-end and ship keyword-only search with no neighborhood routes, links, forms, or filter/query usage.

**Architecture:** Remove neighborhood at the boundaries first (search/filter store + routes), then remove residual UI references (nav/footer/home/listing form), then clean contracts/hooks/tests so no frontend flow depends on neighborhood. Keep backend integration out of scope and make all behavior changes test-driven.

**Tech Stack:** Next.js App Router, TypeScript, Zustand, React Hook Form + Zod, Jest + Testing Library, Playwright

---

## Scope Check

This is one cohesive subsystem (frontend neighborhood capability removal) and can be executed as a single plan with sequential tasks.

## File Structure Map

- Search/filter removal
  - Modify: `components/search/SearchBar.tsx`
  - Modify: `components/search/SearchPageClient.tsx`
  - Modify: `lib/stores/filterStore.ts`
- Route and navigation removal
  - Delete: `app/(public)/neighborhoods/page.tsx`
  - Delete: `app/(public)/neighborhoods/[slug]/page.tsx`
  - Modify: `components/layout/Navbar.tsx`
  - Modify: `components/layout/Footer.tsx`
  - Modify: `app/(public)/page.tsx`
- Listing workflow removal
  - Modify: `components/listings/ListingForm/Step2Location.tsx`
  - Modify: `components/listings/ListingForm/Step8Review.tsx`
  - Modify: `components/listings/ListingForm/index.tsx`
  - Modify: `lib/validations/listingSchema.ts`
- Contracts/hooks cleanup
  - Modify: `lib/contracts/*`
  - Modify: `lib/api/types.ts` (frontend-owned fields only)
  - Delete or modify: `lib/hooks/useNeighborhoods.ts` depending on remaining usage
- Tests
  - Modify: `__tests__/unit/components/SearchBar.test.tsx`
  - Modify: `__tests__/unit/components/FilterPanel.test.tsx`
  - Modify: `__tests__/integration/stores/filterStore.test.ts`
  - Modify/delete neighborhood-specific tests under `__tests__/e2e` and `__tests__/unit`

### Task 1: Remove Neighborhood From Search UI and Store Query Flow

**Files:**
- Modify: `components/search/SearchBar.tsx`
- Modify: `components/search/SearchPageClient.tsx`
- Modify: `lib/stores/filterStore.ts`
- Test: `__tests__/unit/components/SearchBar.test.tsx`
- Test: `__tests__/integration/stores/filterStore.test.ts`

- [ ] **Step 1: Write failing tests for keyword-only search**

```tsx
it("renders only one search textbox (keyword)", () => {
  render(<SearchBar />);
  expect(screen.getAllByRole("textbox")).toHaveLength(1);
});
```

```ts
it("does not keep neighborhood key in api filter projection", () => {
  const state = useFilterStore.getState();
  state.setFilter("search", "studio");
  const filters = selectApiFilters(useFilterStore.getState());
  expect("neighborhood" in filters).toBe(false);
});
```

- [ ] **Step 2: Run tests to verify fail**

Run: `npm test -- __tests__/unit/components/SearchBar.test.tsx __tests__/integration/stores/filterStore.test.ts`  
Expected: FAIL because current search/store still handle neighborhood.

- [ ] **Step 3: Implement keyword-only search and remove neighborhood filter state**

```tsx
// SearchBar.tsx (shape)
<input
  type="text"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  placeholder="Search properties..."
/>
```

```ts
// filterStore.ts (remove neighborhood action/key)
const API_FILTER_KEYS = [
  "search", "listing_type", "min_price", "max_price", "bedrooms", "bathrooms",
  "furnishing", "parking", "pets_allowed", "verified", "available_from",
  "amenities", "sort_by", "sort_order", "page", "limit", "min_lat", "max_lat",
  "min_lng", "max_lng", "lat", "lng", "radius_km",
] as const;
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npm test -- __tests__/unit/components/SearchBar.test.tsx __tests__/integration/stores/filterStore.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/search/SearchBar.tsx components/search/SearchPageClient.tsx lib/stores/filterStore.ts __tests__/unit/components/SearchBar.test.tsx __tests__/integration/stores/filterStore.test.ts
git commit -m "refactor: remove neighborhood from search and filter state"
```

### Task 2: Remove Neighborhood Routes and All Internal Navigation Links

**Files:**
- Delete: `app/(public)/neighborhoods/page.tsx`
- Delete: `app/(public)/neighborhoods/[slug]/page.tsx`
- Modify: `components/layout/Navbar.tsx`
- Modify: `components/layout/Footer.tsx`
- Modify: `app/(public)/page.tsx`
- Test: `__tests__/e2e/neighborhoods.spec.ts` (delete or replace)

- [ ] **Step 1: Write failing navigation assertions**

```tsx
it("does not render Neighborhoods nav link", () => {
  render(<Navbar />);
  expect(screen.queryByRole("link", { name: /neighborhoods/i })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify fail**

Run: `npm test -- __tests__/unit/components/Navbar.test.tsx`  
Expected: FAIL while neighborhoods link still exists.

- [ ] **Step 3: Remove links and delete route files**

```tsx
// Navbar.tsx / Footer.tsx
const NAV_LINKS = [
  { href: "/apartments", label: "Apartments" },
  { href: "/agents", label: "Agents" },
];
```

```bash
git rm "app/(public)/neighborhoods/page.tsx" "app/(public)/neighborhoods/[slug]/page.tsx"
```

- [ ] **Step 4: Run route/nav-related tests**

Run: `npm test -- __tests__/unit/components/Navbar.test.tsx __tests__/unit/components/Footer.test.tsx`  
Expected: PASS after link removal and test updates.

- [ ] **Step 5: Commit**

```bash
git add components/layout/Navbar.tsx components/layout/Footer.tsx app/(public)/page.tsx __tests__
git commit -m "refactor: remove neighborhood routes and navigation surfaces"
```

### Task 3: Remove Neighborhood From Listing Wizard and Validation

**Files:**
- Modify: `components/listings/ListingForm/Step2Location.tsx`
- Modify: `components/listings/ListingForm/Step8Review.tsx`
- Modify: `components/listings/ListingForm/index.tsx`
- Modify: `lib/validations/listingSchema.ts`
- Test: `__tests__/unit/schemas/listingSchema.test.ts`
- Test: `__tests__/e2e/listing-wizard.spec.ts`

- [ ] **Step 1: Write failing schema test for neighborhood-free wizard**

```ts
it("step1 schema passes without neighborhood_id", () => {
  const result = step1Schema.safeParse({
    title: "Nice room",
    listing_type: "room",
    price: 15000,
    bedrooms: 1,
    bathrooms: 1,
  });
  expect(result.success).toBe(true);
});
```

- [ ] **Step 2: Run tests to verify fail**

Run: `npm test -- __tests__/unit/schemas/listingSchema.test.ts`  
Expected: FAIL while `neighborhood_id` remains required.

- [ ] **Step 3: Remove neighborhood UI and validation dependency**

```ts
// listingSchema.ts
export const step1Schema = z.object({
  title: z.string().min(3),
  listing_type: z.enum(["apartment", "room", "house", "studio", "commercial"]),
  price: z.coerce.number().positive(),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
});
```

- [ ] **Step 4: Run schema + wizard tests**

Run: `npm test -- __tests__/unit/schemas/listingSchema.test.ts __tests__/e2e/listing-wizard.spec.ts`  
Expected: PASS after test updates.

- [ ] **Step 5: Commit**

```bash
git add components/listings/ListingForm/Step2Location.tsx components/listings/ListingForm/Step8Review.tsx components/listings/ListingForm/index.tsx lib/validations/listingSchema.ts __tests__/unit/schemas/listingSchema.test.ts __tests__/e2e/listing-wizard.spec.ts
git commit -m "refactor: remove neighborhood from listing wizard flow"
```

### Task 4: Remove Neighborhood From Contracts, Hooks, and API-Usage Surface

**Files:**
- Modify: `lib/contracts/adapters.ts`
- Modify: `lib/contracts/listing.ts`
- Modify: `lib/api/types.ts`
- Delete/modify: `lib/hooks/useNeighborhoods.ts`
- Modify: `msw/handlers.ts` (if neighborhood handlers become unused)
- Test: `__tests__/unit/contracts/adapters.test.ts`

- [ ] **Step 1: Write failing contract test for no neighborhood dependency**

```ts
it("listing card adapter does not require neighborhood object", () => {
  const dto = mapListingCardDto(mockListingWithoutNeighborhood);
  expect(dto.title).toBeTruthy();
});
```

- [ ] **Step 2: Run adapter tests to verify fail (if currently coupled)**

Run: `npm test -- __tests__/unit/contracts/adapters.test.ts`  
Expected: FAIL if adapters still assume neighborhood shape.

- [ ] **Step 3: Decouple neighborhood from active frontend contracts**

```ts
// adapters.ts pattern
const locationLabel = [listing.location?.city].filter(Boolean).join(", ");
```

- [ ] **Step 4: Run adapter tests and typecheck**

Run: `npm test -- __tests__/unit/contracts/adapters.test.ts && npm run check`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/contracts lib/api/types.ts lib/hooks/useNeighborhoods.ts msw/handlers.ts __tests__/unit/contracts/adapters.test.ts
git commit -m "refactor: decouple frontend contracts from neighborhood data"
```

### Task 5: Clean Neighborhood-Specific Tests and Final Verification

**Files:**
- Modify/delete: neighborhood-specific test files under `__tests__/e2e`, `__tests__/unit`, `__tests__/integration`
- Modify: any remaining files found by neighborhood scan

- [ ] **Step 1: Write/update regression assertions for absence**

```tsx
it("search page does not show neighborhood copy", () => {
  render(<SearchPageClient />);
  expect(screen.queryByText(/neighborhood/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run targeted neighborhood scan and tests**

Run: `rg -n "Neighborhood|neighborhood" app components lib __tests__`  
Expected: only accepted non-frontend remnants (if any) or zero in active frontend paths.

- [ ] **Step 3: Remove or update failing neighborhood-specific tests**

```bash
git rm __tests__/e2e/neighborhoods.spec.ts
```

- [ ] **Step 4: Run full verification**

Run: `npm run check && npm test -- --passWithNoTests`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app components lib __tests__ msw
git commit -m "test: finalize neighborhood-free frontend behavior"
```

### Task 6: Final Acceptance Sweep and Branch Hygiene

**Files:**
- Modify: any files needed for final consistency fixes only

- [ ] **Step 1: Acceptance checklist validation**

```txt
- no neighborhood search/filter control
- no neighborhood routes
- no neighborhood nav/footer/home links
- no neighborhood wizard requirement
- no neighborhood key in filter store/query sync
```

- [ ] **Step 2: Run smoke tests for primary flows**

Run: `npm test -- __tests__/unit/components/SearchBar.test.tsx __tests__/unit/components/FilterPanel.test.tsx __tests__/unit/pages/auth-pages.test.tsx`  
Expected: PASS.

- [ ] **Step 3: Run final status check**

Run: `git status --short`  
Expected: clean working tree.

- [ ] **Step 4: Commit any final corrective edits**

```bash
git add .
git commit -m "chore: complete frontend neighborhood hard-removal acceptance sweep"
```

- [ ] **Step 5: Prepare merge note**

```txt
Document explicit breaking behavior: old /neighborhoods URLs intentionally removed with no redirects.
```

## Self-Review

### 1) Spec coverage

- Search/filter neighborhood removal: covered by Task 1.
- Route deletion and link removal: covered by Task 2.
- Listing wizard/form removal: covered by Task 3.
- Contracts/hooks/types cleanup: covered by Task 4.
- Test and verification closure: covered by Tasks 5 and 6.

### 2) Placeholder scan

- No TBD/TODO placeholders remain.
- Each task includes specific files, commands, and expected outputs.

### 3) Type consistency

- Consistent naming used across tasks: `selectApiFilters`, `mapListingCardDto`, `step1Schema`, and keyword-only search behavior.

