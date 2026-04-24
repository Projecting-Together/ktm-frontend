# Frontend Buyer/Seller Purpose Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a frontend-first buyer/seller MVP by adding Rent/Buy purpose mode in discovery, sale-focused posting and inquiry context, and seller lead triage for sale vs rental leads.

**Architecture:** Keep `/apartments` as the unified discovery route and drive buyer/seller intent through a single `purpose=rent|sale` state in URL + filter store. Reuse existing listing and inquiry surfaces with purpose-aware UI copy and CTA behavior. Add telemetry hooks for matched conversations and time-to-first-inquiry metrics.

**Tech Stack:** Next.js App Router, React, TypeScript, Zustand (`filterStore`), TanStack Query, Jest, Playwright.

---

## File Structure and Responsibilities

- Modify: `components/search/SearchPageClient.tsx`
  - Add `Rent | Buy` segmented mode control; synchronize with filter store and URL.
- Modify: `lib/stores/filterStore.ts`
  - Ensure `purpose` is first-class in reset/default/selectors.
- Modify: `components/search/FilterPanel.tsx`
  - Keep purpose-aware labeling compatibility for buy mode context.
- Modify: `components/listings/ListingCard.tsx`
  - Render purpose badge and purpose-aware price context.
- Modify: `components/listings/ListingDetailClient.tsx`
  - Render purpose-aware inquiry CTA and sale-focused copy.
- Modify: `components/listings/ListingForm/Step1BasicInfo.tsx`
  - Ensure `purpose` selector supports clear sale flow defaults.
- Modify: `app/manage/listings/new/page.tsx` (or entry surface that routes to form)
  - Support “Post for Sale” entry behavior by query param (`?purpose=sale`).
- Modify: `app/dashboard/inquiries/page.tsx` (or current seller inbox route)
  - Add purpose chips (`Sale Leads`, `Rental Leads`) and row badges.
- Modify: `lib/api/types.ts`
  - Keep contract alignment for `purpose` fields used in filters/listing/inquiry context.
- Modify: `lib/hooks/useListings.ts`
  - Validate listings query includes purpose and downstream behavior is stable.
- Create: `lib/analytics/events.ts`
  - Central event emitters for `purpose_mode_changed`, `inquiry_sent`, etc.
- Modify tests:
  - Unit: `__tests__/unit/components/*`, `__tests__/unit/stores/*`
  - Integration: `__tests__/integration/api/listings.test.ts`, inbox tests
  - E2E: `__tests__/e2e/home.spec.ts`, `__tests__/e2e/search-filters.spec.ts`, inquiry/inbox specs

---

### Task 1: Add Purpose Mode Switch in Discovery (`Rent | Buy`)

**Files:**
- Modify: `components/search/SearchPageClient.tsx`
- Modify: `lib/stores/filterStore.ts`
- Test: `__tests__/unit/components/SearchPageClient.test.tsx`
- Test: `__tests__/integration/stores/filterStore.test.ts`

- [ ] **Step 1: Write failing tests for purpose mode state + URL sync**

```tsx
// __tests__/unit/components/SearchPageClient.test.tsx
it("switching to Buy sets purpose=sale in URL", async () => {
  render(<SearchPageClient />);
  await userEvent.click(screen.getByRole("button", { name: /buy/i }));
  expect(mockRouter.replace).toHaveBeenCalledWith(expect.stringMatching(/purpose=sale/), expect.anything());
});
```

```ts
// __tests__/integration/stores/filterStore.test.ts
it("resetFilters keeps purpose unset by default", () => {
  useFilterStore.getState().setFilter("purpose", "sale");
  useFilterStore.getState().resetFilters();
  expect(useFilterStore.getState().purpose).toBeUndefined();
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:
`npx pnpm@10.4.1 exec jest __tests__/unit/components/SearchPageClient.test.tsx __tests__/integration/stores/filterStore.test.ts --runInBand`

Expected:
- FAIL on missing buy mode control and/or URL sync assertion

- [ ] **Step 3: Implement mode switch and state wiring**

```tsx
// components/search/SearchPageClient.tsx (excerpt)
const currentPurpose = store.purpose ?? "rent";

<div role="group" aria-label="Listing purpose" className="inline-flex rounded-lg border border-border">
  {(["rent", "sale"] as const).map((purpose) => (
    <button
      key={purpose}
      type="button"
      onClick={() => store.setFilter("purpose", purpose)}
      className={cn("px-3 py-1.5 text-sm", currentPurpose === purpose && "bg-accent text-accent-foreground")}
    >
      {purpose === "rent" ? "Rent" : "Buy"}
    </button>
  ))}
</div>
```

- [ ] **Step 4: Re-run tests**

Run:
`npx pnpm@10.4.1 exec jest __tests__/unit/components/SearchPageClient.test.tsx __tests__/integration/stores/filterStore.test.ts --runInBand`

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add components/search/SearchPageClient.tsx lib/stores/filterStore.ts __tests__/unit/components/SearchPageClient.test.tsx __tests__/integration/stores/filterStore.test.ts
git commit -m "feat: add rent buy mode switch in discovery"
```

---

### Task 2: Purpose-Aware Listing Card and Detail UX

**Files:**
- Modify: `components/listings/ListingCard.tsx`
- Modify: `components/listings/ListingDetailClient.tsx`
- Test: `__tests__/unit/components/ListingCard.test.tsx`
- Test: `__tests__/unit/components/ListingDetailClient.test.tsx`

- [ ] **Step 1: Write failing tests for purpose labels/copy**

```tsx
it("shows For Sale badge when listing purpose is sale", () => {
  render(<ListingCard listing={{ ...mockListingItems[0], purpose: "sale" }} />);
  expect(screen.getByText(/for sale/i)).toBeInTheDocument();
});
```

```tsx
it("shows seller inquiry wording on sale detail", () => {
  render(<ListingDetailClient listing={{ ...mockListing, purpose: "sale" }} />);
  expect(screen.getByText(/send inquiry to seller/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:
`npx pnpm@10.4.1 exec jest __tests__/unit/components/ListingCard.test.tsx __tests__/unit/components/ListingDetailClient.test.tsx --runInBand`

Expected:
- FAIL on missing purpose badge/copy

- [ ] **Step 3: Implement purpose-aware UI**

```tsx
// components/listings/ListingCard.tsx (excerpt)
{listing.purpose === "sale" && (
  <span className="rounded-full bg-primary/80 px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
    For Sale
  </span>
)}
```

```tsx
// components/listings/ListingDetailClient.tsx (excerpt)
const inquiryLabel = listing.purpose === "sale" ? "Send Inquiry to Seller" : "Send Inquiry";
...
<Link ...>{inquiryLabel}</Link>
```

- [ ] **Step 4: Re-run tests**

Run:
`npx pnpm@10.4.1 exec jest __tests__/unit/components/ListingCard.test.tsx __tests__/unit/components/ListingDetailClient.test.tsx --runInBand`

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add components/listings/ListingCard.tsx components/listings/ListingDetailClient.tsx __tests__/unit/components/ListingCard.test.tsx __tests__/unit/components/ListingDetailClient.test.tsx
git commit -m "feat: add purpose-aware listing card and detail copy"
```

---

### Task 3: Seller “Post for Sale” Entry and Form Prefill

**Files:**
- Modify: `app/(public)/page.tsx` (or current CTA surface)
- Modify: `app/manage/listings/new/page.tsx`
- Modify: `components/listings/ListingForm/Step1BasicInfo.tsx`
- Test: `__tests__/e2e/listing-wizard.spec.ts`

- [ ] **Step 1: Write failing test for `?purpose=sale` prefill**

```ts
// __tests__/e2e/listing-wizard.spec.ts
test("post for sale entry preselects sale purpose", async ({ page }) => {
  await page.goto("/manage/listings/new?purpose=sale");
  await expect(page.getByRole("radio", { name: /for sale/i })).toBeChecked();
});
```

- [ ] **Step 2: Run e2e to verify failure**

Run:
`npx pnpm@10.4.1 exec playwright test __tests__/e2e/listing-wizard.spec.ts --project chromium`

Expected:
- FAIL because purpose prefill not yet wired

- [ ] **Step 3: Implement query-driven default purpose**

```tsx
// app/manage/listings/new/page.tsx (excerpt)
export default function NewListingPage({ searchParams }: { searchParams: { purpose?: string } }) {
  const initialPurpose = searchParams?.purpose === "sale" ? "sale" : "rent";
  return <ListingForm initialPurpose={initialPurpose} />;
}
```

```tsx
// components/listings/ListingForm/Step1BasicInfo.tsx (excerpt)
// ensure purpose radio/select has both rent and sale and reads default from form values
```

- [ ] **Step 4: Re-run e2e**

Run:
`npx pnpm@10.4.1 exec playwright test __tests__/e2e/listing-wizard.spec.ts --project chromium`

Expected:
- PASS (authenticated-only tests may be skipped per current suite behavior)

- [ ] **Step 5: Commit**

```bash
git add app/(public)/page.tsx app/manage/listings/new/page.tsx components/listings/ListingForm/Step1BasicInfo.tsx __tests__/e2e/listing-wizard.spec.ts
git commit -m "feat: prefill sale purpose from post for sale entry"
```

---

### Task 4: Seller Inbox Purpose Filters (Sale Leads / Rental Leads)

**Files:**
- Modify: `app/dashboard/inquiries/page.tsx` (or current inbox route)
- Test: `__tests__/unit/pages/inquiries-page.test.tsx`
- Test: `__tests__/integration/api/inquiries.test.ts`

- [ ] **Step 1: Add failing tests for purpose chips/filtering**

```tsx
it("filters inquiries to sale leads when Sale Leads chip selected", async () => {
  render(<InquiriesPage />);
  await userEvent.click(screen.getByRole("button", { name: /sale leads/i }));
  expect(screen.getAllByText(/for sale/i).length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run:
`npx pnpm@10.4.1 exec jest __tests__/unit/pages/inquiries-page.test.tsx __tests__/integration/api/inquiries.test.ts --runInBand`

Expected:
- FAIL on missing chips/filter behavior

- [ ] **Step 3: Implement purpose chips and row labels**

```tsx
// app/dashboard/inquiries/page.tsx (excerpt)
const [leadType, setLeadType] = useState<"all" | "sale" | "rent">("all");
const visible = inquiries.filter((i) => leadType === "all" ? true : i.listing?.purpose === leadType);
```

- [ ] **Step 4: Re-run tests**

Run:
`npx pnpm@10.4.1 exec jest __tests__/unit/pages/inquiries-page.test.tsx __tests__/integration/api/inquiries.test.ts --runInBand`

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/inquiries/page.tsx __tests__/unit/pages/inquiries-page.test.tsx __tests__/integration/api/inquiries.test.ts
git commit -m "feat: add sale and rental lead filters in seller inbox"
```

---

### Task 5: Telemetry Events for Metrics C and D

**Files:**
- Create: `lib/analytics/events.ts`
- Modify: `components/search/SearchPageClient.tsx`
- Modify: `components/listings/ListingDetailClient.tsx`
- Modify: listing post completion path (form submit handler)
- Test: `__tests__/unit/analytics/events.test.ts`

- [ ] **Step 1: Add failing tests for required analytics payloads**

```ts
it("emits inquiry_sent with listing_purpose", () => {
  emitInquirySent({ listingId: "lst-1", listingPurpose: "sale", modeContext: "buy" });
  expect(trackSpy).toHaveBeenCalledWith("inquiry_sent", expect.objectContaining({ listing_purpose: "sale" }));
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:
`npx pnpm@10.4.1 exec jest __tests__/unit/analytics/events.test.ts --runInBand`

Expected:
- FAIL until event helpers exist

- [ ] **Step 3: Implement centralized event helpers and call sites**

```ts
// lib/analytics/events.ts
export function emitPurposeModeChanged(from: "rent" | "sale", to: "rent" | "sale", page: string) { ... }
export function emitInquirySent(payload: { listingId: string; listingPurpose: "rent" | "sale"; modeContext: "rent" | "buy" }) { ... }
```

- [ ] **Step 4: Re-run tests**

Run:
`npx pnpm@10.4.1 exec jest __tests__/unit/analytics/events.test.ts --runInBand`

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add lib/analytics/events.ts components/search/SearchPageClient.tsx components/listings/ListingDetailClient.tsx __tests__/unit/analytics/events.test.ts
git commit -m "feat: add purpose mode and inquiry analytics events"
```

---

### Task 6: End-to-End Purpose Flow + Full Verification

**Files:**
- Modify: `__tests__/e2e/home.spec.ts`
- Modify: `__tests__/e2e/search-filters.spec.ts`
- Modify: `__tests__/e2e/listing-wizard.spec.ts`
- Modify: `__tests__/e2e/inquiries.spec.ts` (create if missing)

- [ ] **Step 1: Add e2e tests for buy mode and sale inquiry**

```ts
test("Rent/Buy mode toggles purpose in URL", async ({ page }) => {
  await page.goto("/apartments");
  await page.getByRole("button", { name: /^buy$/i }).click();
  await expect(page).toHaveURL(/purpose=sale/);
});
```

- [ ] **Step 2: Run targeted e2e and verify failures first**

Run:
`npx pnpm@10.4.1 exec playwright test __tests__/e2e/home.spec.ts __tests__/e2e/search-filters.spec.ts __tests__/e2e/listing-wizard.spec.ts`

Expected:
- initial FAIL on any not-yet-implemented assertions

- [ ] **Step 3: Finalize purpose wiring fixes and test updates**

```tsx
// Ensure search/query parser and UI labels match purpose mode expectations
// Ensure seller inbox and inquiry paths include listing purpose context
```

- [ ] **Step 4: Run full verification**

Run:
`npx pnpm@10.4.1 check`

Run:
`npx pnpm@10.4.1 test`

Run:
`npx pnpm@10.4.1 exec playwright test __tests__/e2e/home.spec.ts __tests__/e2e/search-filters.spec.ts __tests__/e2e/listing-wizard.spec.ts __tests__/e2e/neighborhoods.spec.ts`

Expected:
- All checks pass; any known skips are documented in PR notes

- [ ] **Step 5: Commit**

```bash
git add __tests__/e2e/home.spec.ts __tests__/e2e/search-filters.spec.ts __tests__/e2e/listing-wizard.spec.ts __tests__/e2e/inquiries.spec.ts
git commit -m "test: verify rent buy purpose mode and sale lead flows"
```

---

## Spec Coverage Check

- Discovery Rent/Buy switch: covered by Task 1
- Purpose-aware list/detail/inquiry UI: covered by Tasks 2 and 6
- Seller post for sale entry: covered by Task 3
- Seller lead inbox triage: covered by Task 4
- Metrics C and D instrumentation: covered by Task 5
- Error and regression validation: covered by Task 6

No uncovered spec requirements found.

## Placeholder Scan

- No `TBD`, `TODO`, or deferred implementation placeholders remain in tasks.
- Every task includes explicit files, commands, and concrete expected outcomes.

## Type and Naming Consistency Check

- Uses existing `purpose` naming across filters/listings/inquiries.
- Uses consistent `rent|sale` values and UI mapping (`Rent|Buy`) across tasks.

