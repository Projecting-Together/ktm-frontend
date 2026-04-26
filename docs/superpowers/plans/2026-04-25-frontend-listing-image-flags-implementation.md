# Listing Image Flags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add pet-friendly and moderated flags to listing card images while preserving current verified badge behavior and adding coverage for all flag combinations.

**Architecture:** Keep `ListingCard` as the single owner of image-overlay presentation logic. Extend listing DTO normalization with a new optional `is_moderated` boolean so UI rendering can stay purely declarative (`pets_allowed` + `is_moderated`). Implement with TDD: tests first for contract mapping, then tests first for UI rendering, then minimal component changes.

**Tech Stack:** Next.js App Router, React, TypeScript, Lucide React icons, Jest + Testing Library

---

## File structure and responsibilities

- `src/lib/api/types.ts`
  - API/domain type source for `ListingListItem`; add `is_moderated` to listing types used by UI.
- `src/lib/contracts/listing.ts`
  - DTO normalization layer; map `is_moderated` from incoming listing DTO to normalized listing item.
- `tests/unit/contracts/adapters.test.ts`
  - Contract-level test coverage for `adaptListingsForSearch` normalization behavior.
- `src/components/listings/ListingCard.tsx`
  - Listing image overlay UI; render right-side pet icon badge and moderated flag without changing verified badge behavior.
- `tests/unit/components/ListingCard.test.tsx`
  - Component render coverage for pet/moderated/verified combinations.

---

### Task 1: Add moderated flag to listing contract normalization

**Files:**
- Modify: `tests/unit/contracts/adapters.test.ts`
- Modify: `src/lib/api/types.ts`
- Modify: `src/lib/contracts/listing.ts`
- Test: `tests/unit/contracts/adapters.test.ts`

- [ ] **Step 1: Write the failing contract test for moderated mapping**

Add this test to `tests/unit/contracts/adapters.test.ts`:

```ts
it("preserves is_moderated from listing DTOs", () => {
  const [moderatedListing, defaultListing] = adaptListingsForSearch([
    {
      id: "listing-moderated-1",
      slug: "listing-moderated-1",
      title: "Moderated listing",
      currency: "NPR",
      status: "active",
      created_at: "2026-01-01T00:00:00Z",
      is_moderated: true,
    },
    {
      id: "listing-moderated-2",
      slug: "listing-moderated-2",
      title: "Default listing",
      currency: "NPR",
      status: "active",
      created_at: "2026-01-02T00:00:00Z",
    },
  ]);

  expect(moderatedListing.is_moderated).toBe(true);
  expect(defaultListing.is_moderated).toBe(false);
});
```

- [ ] **Step 2: Run the contract test to verify it fails**

Run:

```bash
npm run test:unit -- tests/unit/contracts/adapters.test.ts -t "preserves is_moderated from listing DTOs"
```

Expected: FAIL because `is_moderated` does not exist yet in normalized listing type/object.

- [ ] **Step 3: Add minimal type + mapper implementation**

In `src/lib/api/types.ts`, update both listing interfaces:

```ts
export interface ListingListItem {
  // ...existing fields...
  is_verified?: boolean;
  is_moderated?: boolean;
  pets_allowed?: boolean | null;
  // ...existing fields...
}

export interface Listing {
  // ...existing fields...
  is_verified?: boolean;
  is_moderated?: boolean;
  pets_allowed?: boolean | null;
  // ...existing fields...
}
```

In `src/lib/contracts/listing.ts`, extend normalized mapping:

```ts
export function mapListingDto(dto: ListingDto): ListingListItem {
  const title = trimText(dto.title) || "Untitled listing";

  return {
    id: dto.id,
    slug: dto.slug,
    title,
    // ...existing fields...
    status: dto.status ?? DEFAULT_STATUS,
    is_verified: dto.is_verified ?? false,
    is_moderated: dto.is_moderated ?? false,
    pets_allowed: dto.pets_allowed ?? null,
    // ...existing fields...
  };
}
```

- [ ] **Step 4: Run the contract test to verify it passes**

Run:

```bash
npm run test:unit -- tests/unit/contracts/adapters.test.ts -t "preserves is_moderated from listing DTOs"
```

Expected: PASS.

- [ ] **Step 5: Commit contract changes**

```bash
git add src/lib/api/types.ts src/lib/contracts/listing.ts tests/unit/contracts/adapters.test.ts
git commit -m "feat(listings): add moderated flag to listing normalization"
```

---

### Task 2: Add failing ListingCard tests for new image flags

**Files:**
- Modify: `tests/unit/components/ListingCard.test.tsx`
- Test: `tests/unit/components/ListingCard.test.tsx`

- [ ] **Step 1: Write failing UI tests for pet and moderated overlays**

Add these tests to `tests/unit/components/ListingCard.test.tsx`:

```tsx
it("renders pet-friendly image badge when pets are allowed", () => {
  render(<ListingCard listing={{ ...listing, pets_allowed: true, is_moderated: false }} />);
  expect(screen.getByTestId("listing-pet-friendly-badge")).toBeInTheDocument();
});

it("renders moderated image badge when listing is moderated", () => {
  render(<ListingCard listing={{ ...listing, is_moderated: true, pets_allowed: false }} />);
  expect(screen.getByText("Moderated")).toBeInTheDocument();
});

it("renders both pet-friendly and moderated badges together", () => {
  render(<ListingCard listing={{ ...listing, pets_allowed: true, is_moderated: true }} />);
  expect(screen.getByTestId("listing-pet-friendly-badge")).toBeInTheDocument();
  expect(screen.getByText("Moderated")).toBeInTheDocument();
});

it("does not render pet-friendly or moderated badges when both are false", () => {
  render(<ListingCard listing={{ ...listing, pets_allowed: false, is_moderated: false }} />);
  expect(screen.queryByTestId("listing-pet-friendly-badge")).not.toBeInTheDocument();
  expect(screen.queryByText("Moderated")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run ListingCard tests to verify failures**

Run:

```bash
npm run test:unit -- tests/unit/components/ListingCard.test.tsx -t "renders pet-friendly image badge when pets are allowed"
```

Expected: FAIL because badge markup is not implemented yet.

- [ ] **Step 3: Commit failing tests only**

```bash
git add tests/unit/components/ListingCard.test.tsx
git commit -m "test(listings): add coverage for pet and moderated image badges"
```

---

### Task 3: Implement ListingCard image overlay badges

**Files:**
- Modify: `src/components/listings/ListingCard.tsx`
- Modify: `tests/unit/components/ListingCard.test.tsx` (only if selectors/assertions need alignment)
- Test: `tests/unit/components/ListingCard.test.tsx`

- [ ] **Step 1: Add minimal badge rendering in grid image overlay**

Update `src/components/listings/ListingCard.tsx` with:

```tsx
import { Heart, MapPin, Bed, Bath, Square, PawPrint } from "lucide-react";

// inside ListingCard component, before return:
const showPetFriendlyBadge = listing.pets_allowed === true;
const showModeratedBadge = listing.is_moderated === true;
```

In the grid image block, keep current favorite button and add a right-side stack:

```tsx
<div className="absolute right-3 top-12 flex flex-col items-end gap-1.5">
  {showPetFriendlyBadge && (
    <span
      data-testid="listing-pet-friendly-badge"
      aria-label="Pets allowed"
      className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/95 text-black shadow-sm"
    >
      <PawPrint className="h-3.5 w-3.5" />
    </span>
  )}
  {showModeratedBadge && (
    <span className="rounded-full bg-emerald-700/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
      Moderated
    </span>
  )}
</div>
```

- [ ] **Step 2: Add the same badge logic for list variant image block**

In the list variant image container (`relative h-36...` block), add:

```tsx
<div className="absolute right-2 top-2 flex flex-col items-end gap-1.5">
  {showPetFriendlyBadge && (
    <span
      data-testid="listing-pet-friendly-badge"
      aria-label="Pets allowed"
      className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/95 text-black shadow-sm"
    >
      <PawPrint className="h-3.5 w-3.5" />
    </span>
  )}
  {showModeratedBadge && (
    <span className="rounded-full bg-emerald-700/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
      Moderated
    </span>
  )}
</div>
```

- [ ] **Step 3: Run focused ListingCard tests**

Run:

```bash
npm run test:unit -- tests/unit/components/ListingCard.test.tsx
```

Expected: PASS for all `ListingCard` tests, including new badge cases.

- [ ] **Step 4: Run adapter and ListingCard tests together**

Run:

```bash
npm run test:unit -- tests/unit/contracts/adapters.test.ts tests/unit/components/ListingCard.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit UI implementation**

```bash
git add src/components/listings/ListingCard.tsx tests/unit/components/ListingCard.test.tsx
git commit -m "feat(listings): render pet and moderated flags on listing images"
```

---

### Task 4: Final validation and docs sync

**Files:**
- Modify: `docs/superpowers/specs/2026-04-25-frontend-listing-image-flags-design.md` (only if wording needs implementation notes)
- Test: `tests/unit/contracts/adapters.test.ts`
- Test: `tests/unit/components/ListingCard.test.tsx`

- [ ] **Step 1: Run final targeted verification**

Run:

```bash
npm run test:unit -- tests/unit/contracts/adapters.test.ts tests/unit/components/ListingCard.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run lint on touched files**

Run:

```bash
npm run lint -- src/components/listings/ListingCard.tsx src/lib/contracts/listing.ts src/lib/api/types.ts tests/unit/components/ListingCard.test.tsx tests/unit/contracts/adapters.test.ts
```

Expected: PASS or only pre-existing warnings outside touched changes.

- [ ] **Step 3: Commit validation/doc adjustments**

```bash
git add docs/superpowers/specs/2026-04-25-frontend-listing-image-flags-design.md
git commit -m "docs(listings): align spec notes with implemented image flags"
```

---

## Spec-to-plan coverage check

- Pet-friendly icon-only badge with black paw on green background -> Task 3, Step 1/2.
- Moderated text flag driven by backend boolean field -> Task 1 + Task 3.
- Verified badge unchanged -> Task 3 preserves existing verified code path; Task 2 retains verified test.
- Show both pet + moderated together -> Task 2 explicit test and Task 3 conditional rendering.
- Graceful fallback when field missing -> Task 1 default mapping and test.
- Test coverage for combinations and mapping -> Task 1 + Task 2 + Task 3 + Task 4.

## Placeholder and consistency check

- No `TODO`/`TBD` placeholders used.
- Type/property names are consistent (`is_moderated`, `pets_allowed`, `is_verified`).
- All referenced files and commands are explicit.
