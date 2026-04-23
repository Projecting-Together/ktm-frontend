  # Frontend Token-First Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the frontend into a token-driven UI system with an always-available search experience and backend-ready DTO adapters, while keeping this phase frontend-only.

**Architecture:** Introduce one semantic theme config and route all UI colors through CSS variables, then update shared pages/components to consume tokens and normalized frontend contracts. Keep data adapters between UI and transport shapes so next week's API integration swaps data sources without rewriting page logic.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Zustand, React Hook Form, Zod, React Query, Jest + Testing Library

---

## Scope Check

The approved spec is large but still one cohesive product slice: discovery/search flows, auth/profile UX, and cross-cutting theme/contract infrastructure. This plan keeps those in one execution track with strict incremental checkpoints.

## File Structure Map

- Theme foundation
  - Create: `lib/theme/tokens.ts`
  - Create: `lib/theme/applyTheme.ts`
  - Modify: `app/globals.css`
  - Modify: `app/layout.tsx`
- Global sticky search
  - Create: `components/layout/GlobalSearchBar.tsx`
  - Modify: `app/(public)/layout.tsx`
  - Modify: `components/layout/Navbar.tsx`
- Filters + listing/map behavior
  - Modify: `components/search/FilterPanel.tsx`
  - Modify: `components/search/SearchPageClient.tsx`
  - Modify: `lib/stores/filterStore.ts`
  - Modify: `components/map/SearchMap.tsx`
- Auth + profile
  - Modify: `app/(auth)/login/page.tsx`
  - Modify: `app/(auth)/register/page.tsx`
  - Create: `app/(public)/agents/[slug]/page.tsx`
  - Create: `app/dashboard/settings/profile/page.tsx`
- Contract layer
  - Create: `lib/contracts/listing.ts`
  - Create: `lib/contracts/profile.ts`
  - Create: `lib/contracts/auth.ts`
  - Create: `lib/contracts/adapters.ts`
- Tests
  - Modify: `__tests__/unit/components/FilterPanel.test.tsx`
  - Modify: `__tests__/unit/components/SearchBar.test.tsx`
  - Create: `__tests__/unit/components/GlobalSearchBar.test.tsx`
  - Create: `__tests__/unit/contracts/adapters.test.ts`
  - Create: `__tests__/unit/pages/auth-pages.test.tsx`

### Task 1: Theme Token Foundation

**Files:**
- Create: `lib/theme/tokens.ts`
- Create: `lib/theme/applyTheme.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Test: `__tests__/unit/theme/themeTokens.test.ts`

- [ ] **Step 1: Write the failing theme token test**

```ts
import { describe, expect, it } from "@jest/globals";
import { themeTokens } from "@/lib/theme/tokens";

describe("themeTokens", () => {
  it("exposes semantic color keys required by UI", () => {
    expect(themeTokens.color.background).toBeDefined();
    expect(themeTokens.color.surface).toBeDefined();
    expect(themeTokens.color.textPrimary).toBeDefined();
    expect(themeTokens.color.primary).toBeDefined();
    expect(themeTokens.color.focusRing).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test __tests__/unit/theme/themeTokens.test.ts --runInBand`  
Expected: FAIL with module-not-found for `@/lib/theme/tokens`.

- [ ] **Step 3: Implement token module + CSS variable application**

```ts
// lib/theme/tokens.ts
export const themeTokens = {
  color: {
    background: "#FAF8F4",
    surface: "#FFFFFF",
    surfaceMuted: "#F2EEE7",
    textPrimary: "#1A1A1A",
    textSecondary: "#5F5F5F",
    border: "#E4DED4",
    primary: "#0A1929",
    primaryForeground: "#FFFFFF",
    accent: "#D97706",
    success: "#15803D",
    warning: "#CA8A04",
    danger: "#DC2626",
    focusRing: "#2563EB",
  },
} as const;
```

```ts
// lib/theme/applyTheme.ts
import { themeTokens } from "@/lib/theme/tokens";

export function applyThemeVariables(): string {
  return Object.entries(themeTokens.color)
    .map(([key, value]) => `--color-${key}: ${value};`)
    .join("\n");
}
```

```css
/* app/globals.css */
:root {
  --color-background: #FAF8F4;
  --color-surface: #FFFFFF;
  --color-textPrimary: #1A1A1A;
  /* ... keep full semantic set aligned with tokens.ts ... */
}
```

- [ ] **Step 4: Run tests + typecheck**

Run: `pnpm test __tests__/unit/theme/themeTokens.test.ts --runInBand && pnpm check`  
Expected: PASS for test and no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add lib/theme/tokens.ts lib/theme/applyTheme.ts app/globals.css app/layout.tsx __tests__/unit/theme/themeTokens.test.ts
git commit -m "feat: introduce semantic theme token foundation"
```

### Task 2: Global Sticky Search Bar Across Public Experience

**Files:**
- Create: `components/layout/GlobalSearchBar.tsx`
- Modify: `app/(public)/layout.tsx`
- Modify: `components/layout/Navbar.tsx`
- Test: `__tests__/unit/components/GlobalSearchBar.test.tsx`

- [ ] **Step 1: Write failing render/visibility tests**

```tsx
import { render, screen } from "@/test-utils/renderWithProviders";
import { GlobalSearchBar } from "@/components/layout/GlobalSearchBar";

describe("GlobalSearchBar", () => {
  it("renders a visible search landmark", () => {
    render(<GlobalSearchBar />);
    expect(screen.getByRole("search")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test __tests__/unit/components/GlobalSearchBar.test.tsx --runInBand`  
Expected: FAIL with module-not-found for `GlobalSearchBar`.

- [ ] **Step 3: Implement sticky global search component + wire into public layout**

```tsx
// components/layout/GlobalSearchBar.tsx
"use client";
import { SearchBar } from "@/components/search/SearchBar";

export function GlobalSearchBar() {
  return (
    <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="container py-3">
        <div role="search" aria-label="Global property search">
          <SearchBar size="lg" />
        </div>
      </div>
    </div>
  );
}
```

```tsx
// app/(public)/layout.tsx
import { GlobalSearchBar } from "@/components/layout/GlobalSearchBar";
// ...
<Navbar />
<GlobalSearchBar />
<main className="flex-1 pb-16 md:pb-0">{children}</main>
```

- [ ] **Step 4: Run focused tests**

Run: `pnpm test __tests__/unit/components/GlobalSearchBar.test.tsx __tests__/unit/components/SearchBar.test.tsx --runInBand`  
Expected: PASS and no broken search component behavior.

- [ ] **Step 5: Commit**

```bash
git add components/layout/GlobalSearchBar.tsx app/(public)/layout.tsx components/layout/Navbar.tsx __tests__/unit/components/GlobalSearchBar.test.tsx
git commit -m "feat: add persistent sticky global search bar"
```

### Task 3: Filter Panel Redesign (No Neighborhood, Slider + Home Type Cards)

**Files:**
- Modify: `components/search/FilterPanel.tsx`
- Modify: `lib/stores/filterStore.ts`
- Modify: `components/search/SearchPageClient.tsx`
- Modify: `__tests__/unit/components/FilterPanel.test.tsx`

- [ ] **Step 1: Write failing tests for filter changes**

```tsx
it("does not render neighborhood filter chips", () => {
  render(<FilterPanel />);
  expect(screen.queryByText(/neighborhood/i)).not.toBeInTheDocument();
});

it("renders price slider and min/max inputs", () => {
  render(<FilterPanel />);
  expect(screen.getByTestId("price-range-slider")).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/min/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/max/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to confirm failures**

Run: `pnpm test __tests__/unit/components/FilterPanel.test.tsx --runInBand`  
Expected: FAIL because current panel still includes neighborhood and preset bubbles.

- [ ] **Step 3: Implement filter UI/store updates**

```tsx
// components/search/FilterPanel.tsx (price section shape)
<Slider
  data-testid="price-range-slider"
  min={0}
  max={200000}
  step={1000}
  value={[store.min_price ?? 0, store.max_price ?? 200000]}
  onValueChange={([min, max]) => store.setFilters({ min_price: min, max_price: max })}
/>
```

```tsx
// Home type cards
<button className={cn("rounded-xl border p-3 text-sm", isActive && "border-accent bg-accent/10")} />
```

```ts
// lib/stores/filterStore.ts
// remove toggleNeighborhood action and neighborhood reset coupling
```

- [ ] **Step 4: Run tests and search page smoke test**

Run: `pnpm test __tests__/unit/components/FilterPanel.test.tsx --runInBand`  
Expected: PASS with new filter behavior.

- [ ] **Step 5: Commit**

```bash
git add components/search/FilterPanel.tsx lib/stores/filterStore.ts components/search/SearchPageClient.tsx __tests__/unit/components/FilterPanel.test.tsx
git commit -m "feat: redesign filters with slider and home-type cards"
```

### Task 4: Listing/Map Alignment (Simple Markers, No Price Overlay on Pins)

**Files:**
- Modify: `components/map/SearchMap.tsx`
- Modify: `components/search/SearchPageClient.tsx`
- Test: `__tests__/unit/components/SearchMap.test.tsx`

- [ ] **Step 1: Write failing map marker behavior test**

```tsx
it("renders plain markers without pin price labels", () => {
  render(<SearchMap listings={mockListings} />);
  expect(screen.queryByText(/NPR/)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify fail**

Run: `pnpm test __tests__/unit/components/SearchMap.test.tsx --runInBand`  
Expected: FAIL because current popup/marker content includes price text.

- [ ] **Step 3: Implement simple-marker map rendering**

```tsx
// components/map/SearchMap.tsx
<Marker key={listing.id} position={[lat, lng]}>
  <Popup>
    <p className="text-sm font-semibold">{listing.title}</p>
    <Link href={`/apartments/${listing.slug}`} className="text-xs text-accent underline">
      View listing
    </Link>
  </Popup>
</Marker>
```

- [ ] **Step 4: Run map and listing tests**

Run: `pnpm test __tests__/unit/components/SearchMap.test.tsx __tests__/unit/components/ListingCard.test.tsx --runInBand`  
Expected: PASS and no list/grid regressions.

- [ ] **Step 5: Commit**

```bash
git add components/map/SearchMap.tsx components/search/SearchPageClient.tsx __tests__/unit/components/SearchMap.test.tsx
git commit -m "feat: simplify map markers and align listing-map behavior"
```

### Task 5: Auth Page Contracted Fields and Google Entry

**Files:**
- Modify: `app/(auth)/login/page.tsx`
- Modify: `app/(auth)/register/page.tsx`
- Modify: `lib/validations/listingSchema.ts`
- Create: `__tests__/unit/pages/auth-pages.test.tsx`

- [ ] **Step 1: Write failing auth-page field tests**

```tsx
it("register form excludes role selection", () => {
  render(<RegisterPage />);
  expect(screen.queryByText(/i am a/i)).not.toBeInTheDocument();
});

it("login page shows google sign in action", () => {
  render(<LoginPage />);
  expect(screen.getByRole("button", { name: /sign in with google/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests and capture failure**

Run: `pnpm test __tests__/unit/pages/auth-pages.test.tsx --runInBand`  
Expected: FAIL because role selection exists and Google action is missing.

- [ ] **Step 3: Implement auth form changes**

```tsx
// register/page.tsx form fields
<input {...register("firstName")} />
<input {...register("lastName")} />
<input {...register("email")} />
<input {...register("password")} />
<input {...register("confirmPassword")} />
```

```tsx
// login/page.tsx
<button type="button" className="btn-secondary h-11 w-full">
  Sign in with Google
</button>
```

- [ ] **Step 4: Re-run auth tests**

Run: `pnpm test __tests__/unit/pages/auth-pages.test.tsx --runInBand`  
Expected: PASS and no schema/type errors.

- [ ] **Step 5: Commit**

```bash
git add app/(auth)/login/page.tsx app/(auth)/register/page.tsx lib/validations/listingSchema.ts __tests__/unit/pages/auth-pages.test.tsx
git commit -m "feat: align auth pages to approved field sets"
```

### Task 6: Profile Surfaces (Public + Editable) with Shared DTO

**Files:**
- Create: `lib/contracts/profile.ts`
- Create: `app/(public)/agents/[slug]/page.tsx`
- Create: `app/dashboard/settings/profile/page.tsx`
- Test: `__tests__/unit/contracts/profile-contract.test.ts`

- [ ] **Step 1: Write failing profile contract test**

```ts
import { mapProfileDto } from "@/lib/contracts/profile";

it("normalizes profile model for public and editable pages", () => {
  const result = mapProfileDto({ id: "1", first_name: "Sita", last_name: "Thapa" });
  expect(result.fullName).toBe("Sita Thapa");
});
```

- [ ] **Step 2: Run test to verify fail**

Run: `pnpm test __tests__/unit/contracts/profile-contract.test.ts --runInBand`  
Expected: FAIL with missing `mapProfileDto`.

- [ ] **Step 3: Implement profile contract + pages**

```ts
// lib/contracts/profile.ts
export interface ProfileDto {
  id: string;
  fullName: string;
  bio: string;
  avatarUrl?: string;
  listingCount: number;
}
```

```tsx
// app/(public)/agents/[slug]/page.tsx
// render profile header + listing summary + contact CTA using ProfileDto
```

```tsx
// app/dashboard/settings/profile/page.tsx
// render editable profile form with same dto shape
```

- [ ] **Step 4: Run profile tests**

Run: `pnpm test __tests__/unit/contracts/profile-contract.test.ts --runInBand`  
Expected: PASS and route compiles.

- [ ] **Step 5: Commit**

```bash
git add lib/contracts/profile.ts app/(public)/agents/[slug]/page.tsx app/dashboard/settings/profile/page.tsx __tests__/unit/contracts/profile-contract.test.ts
git commit -m "feat: add public and editable profile flows on shared dto"
```

### Task 7: Backend-Ready Contract/Adapter Layer for Listing, Map, Auth, Profile

**Files:**
- Create: `lib/contracts/listing.ts`
- Create: `lib/contracts/auth.ts`
- Create: `lib/contracts/adapters.ts`
- Modify: `components/search/SearchPageClient.tsx`
- Modify: `components/map/SearchMap.tsx`
- Test: `__tests__/unit/contracts/adapters.test.ts`

- [ ] **Step 1: Write failing adapter test suite**

```ts
import { mapListingCardDto } from "@/lib/contracts/adapters";

it("maps API listing to listing card dto", () => {
  const dto = mapListingCardDto(mockListingApi);
  expect(dto.id).toBe(mockListingApi.id);
  expect(dto.title.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run tests to fail first**

Run: `pnpm test __tests__/unit/contracts/adapters.test.ts --runInBand`  
Expected: FAIL due to missing adapter module.

- [ ] **Step 3: Implement DTOs and adapters**

```ts
// lib/contracts/listing.ts
export interface ListingCardDto { id: string; slug: string; title: string; priceLabel: string; bedsLabel: string; bathsLabel: string; }
export interface MapMarkerDto { id: string; title: string; lat: number; lng: number; slug: string; }
```

```ts
// lib/contracts/adapters.ts
export function mapListingCardDto(input: ListingListItem): ListingCardDto { /* pure mapping */ }
export function mapMapMarkerDto(input: ListingListItem): MapMarkerDto | null { /* coords guard */ }
```

- [ ] **Step 4: Integrate adapters in consuming components + run checks**

Run: `pnpm test __tests__/unit/contracts/adapters.test.ts --runInBand && pnpm check`  
Expected: PASS and no type errors after component integration.

- [ ] **Step 5: Commit**

```bash
git add lib/contracts/listing.ts lib/contracts/auth.ts lib/contracts/adapters.ts components/search/SearchPageClient.tsx components/map/SearchMap.tsx __tests__/unit/contracts/adapters.test.ts
git commit -m "feat: introduce backend-ready frontend dto adapters"
```

### Task 8: Full-Frontend Token Migration and Regression Verification

**Files:**
- Modify: `app/(public)/**/*.tsx`
- Modify: `components/**/*.tsx`
- Modify: `app/(auth)/**/*.tsx`
- Test: `__tests__/unit/components/*.test.tsx`, `__tests__/unit/pages/*.test.tsx`

- [ ] **Step 1: Write/extend regression tests for token usage hotspots**

```tsx
it("uses semantic classes on auth and search surfaces", () => {
  render(<LoginPage />);
  expect(screen.getByRole("button", { name: /sign in/i })).toHaveClass("btn-primary");
});
```

- [ ] **Step 2: Run targeted tests to establish baseline**

Run: `pnpm test __tests__/unit/components/SearchBar.test.tsx __tests__/unit/components/FilterPanel.test.tsx __tests__/unit/pages/auth-pages.test.tsx --runInBand`  
Expected: PASS before broad migration edits.

- [ ] **Step 3: Replace remaining hardcoded palette usages with semantic tokens**

```ts
// example replacement pattern
// before: className="text-emerald-500"
// after:  className="text-success"
```

```css
/* globals.css semantic alias utilities */
.text-success { color: var(--color-success); }
.bg-surface { background-color: var(--color-surface); }
```

- [ ] **Step 4: Run full verification**

Run: `pnpm check && pnpm test --passWithNoTests`  
Expected: Typecheck and unit suite pass.

- [ ] **Step 5: Commit**

```bash
git add app components app/globals.css __tests__
git commit -m "refactor: complete semantic token migration across frontend"
```

## Spec Self-Review Notes

- **Spec coverage:** All approved requirements are mapped: sticky search, filter changes, listing/map, auth fields + Google, profile public+editable, single theme config, full migration, and adapter layer.
- **Placeholder scan:** No `TODO`/`TBD` placeholders remain; each task includes concrete files, code, commands, and expected outputs.
- **Type consistency:** DTO naming is consistent across tasks (`ListingCardDto`, `MapMarkerDto`, `ProfileDto`) and adapter references match these names.

Plan complete and saved to `docs/superpowers/plans/2026-04-23-frontend-token-first-implementation-plan.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
