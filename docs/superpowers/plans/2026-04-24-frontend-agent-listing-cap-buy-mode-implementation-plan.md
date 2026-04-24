# Frontend Agent Upgrade, Listing Cap, and Buy Mode Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a unified marketplace flow where normal users can list rent/sale properties up to 2 active listings, can self-upgrade to agent when capped, and buy mode has complete cross-surface behavior with richer sale mock data.

**Architecture:** Keep `purpose=rent|sale` as the single intent signal across route/query/store. Add a centralized listing-cap capability resolver and a single role-upgrade facade so UI components stay thin. Expand mock sale ecosystem in the existing mock factory and wire usage through existing API/client contracts.

**Tech Stack:** Next.js App Router, React, TypeScript, Zustand, TanStack Query, Jest, Playwright, existing MSW/mock API setup.

---

## File Structure and Responsibilities

- Modify: `test-utils/mockData.ts`
  - Expand sale listings, sale lead/inquiry coverage, and sale-oriented analytics counts.
- Modify: `lib/api/types.ts`
  - Confirm listing/user capability typings include fields needed by cap and upgrade flows.
- Modify: `lib/api/client.ts`
  - Add/extend helper endpoints for listing count capability and role upgrade facade.
- Create: `lib/capabilities/listingCapabilities.ts`
  - Single resolver for `activeListingCount`, `canCreateWithoutUpgrade`, and `requiresAgentUpgrade`.
- Modify: `lib/stores/authStore.ts`
  - Add `upgradeToAgent` action and post-upgrade state synchronization.
- Modify: `components/layout/Navbar.tsx`
  - Gate create-listing entry with cap check and upgrade modal trigger.
- Create: `components/listings/AgentUpgradeModal.tsx`
  - Confirmation UX for cap-reached upgrade flow.
- Modify: `app/manage/listings/new/page.tsx`
  - Preserve purpose preselect and protect direct entry via capability checks.
- Modify: `components/search/SearchPageClient.tsx`
  - Ensure purpose mode consistency and buy-focused listing grouping behavior.
- Modify: `app/(public)/page.tsx`
  - Keep homepage modules purpose-aware (`rent` vs `sale`).
- Modify: `components/listings/ListingDetailClient.tsx`
  - Keep related listings purpose-consistent and buy-aware copy.
- Test files:
  - Unit: `__tests__/unit/capabilities/listingCapabilities.test.ts`
  - Unit: `__tests__/unit/stores/authStore.test.ts`
  - Unit: `__tests__/unit/components/SearchPageClient.test.tsx`
  - Unit: `__tests__/unit/components/ListingDetailClient.test.tsx`
  - Integration: `__tests__/integration/api/listings.test.ts`
  - Integration: `__tests__/integration/api/inquiries.test.ts`
  - E2E: `__tests__/e2e/listing-wizard.spec.ts`
  - E2E: `__tests__/e2e/home.spec.ts`
  - E2E: `__tests__/e2e/search-filters.spec.ts`

---

### Task 1: Build Listing Capability Resolver (2-active cap logic)

**Files:**
- Create: `lib/capabilities/listingCapabilities.ts`
- Test: `__tests__/unit/capabilities/listingCapabilities.test.ts`

- [ ] **Step 1: Write failing unit tests for cap boundaries**

```ts
import { describe, expect, it } from "@jest/globals";
import { resolveListingCapabilities } from "@/lib/capabilities/listingCapabilities";

describe("resolveListingCapabilities", () => {
  it("allows normal user when active listing count is below 2", () => {
    const result = resolveListingCapabilities({ role: "owner", activeListingCount: 1 });
    expect(result.canCreateWithoutUpgrade).toBe(true);
    expect(result.requiresAgentUpgrade).toBe(false);
  });

  it("requires upgrade for normal user at 2 active listings", () => {
    const result = resolveListingCapabilities({ role: "owner", activeListingCount: 2 });
    expect(result.canCreateWithoutUpgrade).toBe(false);
    expect(result.requiresAgentUpgrade).toBe(true);
  });

  it("allows agent regardless of count", () => {
    const result = resolveListingCapabilities({ role: "agent", activeListingCount: 99 });
    expect(result.canCreateWithoutUpgrade).toBe(true);
    expect(result.requiresAgentUpgrade).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:
`npx pnpm@10.4.1 exec jest __tests__/unit/capabilities/listingCapabilities.test.ts --runInBand`

Expected:
- FAIL because resolver file/function does not exist yet

- [ ] **Step 3: Implement minimal resolver**

```ts
export type CapabilityRole = "renter" | "owner" | "agent" | "admin" | "moderator";

export function resolveListingCapabilities(input: { role: CapabilityRole; activeListingCount: number }) {
  const isUnlimitedRole = input.role === "agent" || input.role === "admin";
  const requiresAgentUpgrade = !isUnlimitedRole && input.activeListingCount >= 2;

  return {
    activeListingCount: input.activeListingCount,
    canCreateWithoutUpgrade: isUnlimitedRole || input.activeListingCount < 2,
    requiresAgentUpgrade,
  };
}
```

- [ ] **Step 4: Re-run tests**

Run:
`npx pnpm@10.4.1 exec jest __tests__/unit/capabilities/listingCapabilities.test.ts --runInBand`

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add lib/capabilities/listingCapabilities.ts __tests__/unit/capabilities/listingCapabilities.test.ts
git commit -m "feat: add listing capability resolver with active cap rules"
```

---

### Task 2: Add Self-Serve Agent Upgrade in Auth/Client Layer

**Files:**
- Modify: `lib/api/client.ts`
- Modify: `lib/stores/authStore.ts`
- Test: `__tests__/unit/stores/authStore.test.ts`

- [ ] **Step 1: Write failing auth-store tests for upgrade flow**

```ts
it("upgrades current user role to agent on success", async () => {
  mockUpgradeToAgentApi.mockResolvedValue({ data: { id: "usr-1", role: "agent" } });
  await useAuthStore.getState().upgradeToAgent();
  expect(useAuthStore.getState().user?.role).toBe("agent");
});

it("keeps existing role when upgrade fails", async () => {
  useAuthStore.setState({ user: { id: "usr-1", role: "owner" } as any, isAuthenticated: true });
  mockUpgradeToAgentApi.mockResolvedValue({ error: { message: "failed" } });
  await expect(useAuthStore.getState().upgradeToAgent()).rejects.toThrow("failed");
  expect(useAuthStore.getState().user?.role).toBe("owner");
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:
`npx pnpm@10.4.1 exec jest __tests__/unit/stores/authStore.test.ts --runInBand`

Expected:
- FAIL because `upgradeToAgent` action is missing

- [ ] **Step 3: Implement API helper and store action**

```ts
// lib/api/client.ts (excerpt)
export async function upgradeCurrentUserToAgent() {
  return request<User>("/auth/upgrade-agent", { method: "POST" });
}
```

```ts
// lib/stores/authStore.ts (excerpt)
upgradeToAgent: async () => {
  const res = await upgradeCurrentUserToAgent();
  if (res.error || !res.data) throw new Error(res.error?.message ?? "Agent upgrade failed");
  set((state) => ({ ...state, user: res.data, isAuthenticated: true }));
},
```

- [ ] **Step 4: Re-run tests**

Run:
`npx pnpm@10.4.1 exec jest __tests__/unit/stores/authStore.test.ts --runInBand`

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add lib/api/client.ts lib/stores/authStore.ts __tests__/unit/stores/authStore.test.ts
git commit -m "feat: add self-serve agent upgrade action in auth flow"
```

---

### Task 3: Gate Create Listing Entry With Upgrade Modal

**Files:**
- Create: `components/listings/AgentUpgradeModal.tsx`
- Modify: `components/layout/Navbar.tsx`
- Modify: `app/manage/listings/new/page.tsx`
- Test: `__tests__/unit/components/Navbar.test.tsx`
- Test: `__tests__/e2e/listing-wizard.spec.ts`

- [ ] **Step 1: Write failing tests for cap-hit behavior**

```tsx
it("shows become-agent modal when normal user is at cap", async () => {
  render(<Navbar />, { preloadedAuthRole: "owner", activeListingCount: 2 });
  await userEvent.click(screen.getByRole("link", { name: /create listing/i }));
  expect(screen.getByText(/become an agent/i)).toBeInTheDocument();
});
```

```ts
test("cap reached prompts upgrade and can continue after confirm", async ({ page }) => {
  await page.goto("/manage/listings/new");
  await expect(page.getByText(/become an agent/i)).toBeVisible();
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:
`npx pnpm@10.4.1 exec jest __tests__/unit/components/Navbar.test.tsx --runInBand`

Run:
`npx pnpm@10.4.1 exec playwright test __tests__/e2e/listing-wizard.spec.ts --project chromium`

Expected:
- FAIL on missing modal and gating behavior

- [ ] **Step 3: Implement modal + entry gating**

```tsx
// AgentUpgradeModal.tsx (excerpt)
export function AgentUpgradeModal({ open, onConfirm, onCancel, activeCount }: Props) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true">
      <h2>Become an Agent</h2>
      <p>You currently have {activeCount} active listings. Upgrade to continue listing without limits.</p>
      <button onClick={onCancel}>Not now</button>
      <button onClick={onConfirm}>Become Agent</button>
    </div>
  );
}
```

```tsx
// Navbar.tsx (excerpt)
const caps = resolveListingCapabilities({ role: user.role, activeListingCount });
if (caps.requiresAgentUpgrade) {
  setUpgradeModalOpen(true);
  return;
}
router.push("/manage/listings/new");
```

- [ ] **Step 4: Re-run tests**

Run:
`npx pnpm@10.4.1 exec jest __tests__/unit/components/Navbar.test.tsx --runInBand`

Run:
`npx pnpm@10.4.1 exec playwright test __tests__/e2e/listing-wizard.spec.ts --project chromium`

Expected:
- PASS (or documented auth-gated skips in existing suite)

- [ ] **Step 5: Commit**

```bash
git add components/listings/AgentUpgradeModal.tsx components/layout/Navbar.tsx app/manage/listings/new/page.tsx __tests__/unit/components/Navbar.test.tsx __tests__/e2e/listing-wizard.spec.ts
git commit -m "feat: gate create listing with agent upgrade modal"
```

---

### Task 4: Expand Buy Mock Ecosystem (Listings, Leads, Analytics)

**Files:**
- Modify: `test-utils/mockData.ts`
- Modify: `lib/api/types.ts`
- Test: `__tests__/integration/api/listings.test.ts`
- Test: `__tests__/integration/api/inquiries.test.ts`

- [ ] **Step 1: Write failing integration tests for sale dataset coverage**

```ts
it("returns multiple sale listings in buy mode", async () => {
  const res = await getListings({ purpose: "sale" });
  expect(res.data?.items.length).toBeGreaterThanOrEqual(8);
});

it("includes sale-linked inquiries for seller lead views", async () => {
  const res = await getMyInquiries();
  expect(res.data?.items.some((i) => i.listing?.purpose === "sale")).toBe(true);
});
```

- [ ] **Step 2: Run integration tests and verify failure**

Run:
`npx pnpm@10.4.1 exec jest __tests__/integration/api/listings.test.ts __tests__/integration/api/inquiries.test.ts --runInBand`

Expected:
- FAIL because current mock sale volume/coverage is lower than expected

- [ ] **Step 3: Implement mock expansions**

```ts
// test-utils/mockData.ts (excerpt guidance)
// - add 8-12 new `purpose: "sale"` listings with realistic city/price diversity
// - add sale entries in featured/recent bucket derivations
// - add sale-purpose inquiries mapped to sale listings
// - update analytics counters so sale activity is represented
```

- [ ] **Step 4: Re-run integration tests**

Run:
`npx pnpm@10.4.1 exec jest __tests__/integration/api/listings.test.ts __tests__/integration/api/inquiries.test.ts --runInBand`

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add test-utils/mockData.ts lib/api/types.ts __tests__/integration/api/listings.test.ts __tests__/integration/api/inquiries.test.ts
git commit -m "feat: expand buy-mode mock listings, leads, and analytics coverage"
```

---

### Task 5: Enforce Purpose Consistency Across Apartments, Home, and Detail

**Files:**
- Modify: `components/search/SearchPageClient.tsx`
- Modify: `app/(public)/page.tsx`
- Modify: `components/listings/ListingDetailClient.tsx`
- Test: `__tests__/unit/components/SearchPageClient.test.tsx`
- Test: `__tests__/unit/components/ListingDetailClient.test.tsx`
- Test: `__tests__/e2e/home.spec.ts`
- Test: `__tests__/e2e/search-filters.spec.ts`

- [ ] **Step 1: Write failing tests for cross-surface purpose consistency**

```tsx
it("keeps buy mode purpose=sale in apartments filters and cards", async () => {
  render(<SearchPageClient />);
  await userEvent.click(screen.getByRole("button", { name: /buy/i }));
  expect(screen.getAllByText(/for sale/i).length).toBeGreaterThan(0);
});
```

```ts
test("homepage and apartments show sale-context listings in buy mode", async ({ page }) => {
  await page.goto("/apartments?purpose=sale");
  await expect(page.getByText(/for sale/i).first()).toBeVisible();
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:
`npx pnpm@10.4.1 exec jest __tests__/unit/components/SearchPageClient.test.tsx __tests__/unit/components/ListingDetailClient.test.tsx --runInBand`

Run:
`npx pnpm@10.4.1 exec playwright test __tests__/e2e/home.spec.ts __tests__/e2e/search-filters.spec.ts --project chromium`

Expected:
- FAIL on one or more surfaces not honoring purpose consistently

- [ ] **Step 3: Implement purpose propagation fixes**

```tsx
// Search/Home/Detail excerpts
// - always read current `purpose` from query/store
// - request data with explicit purpose
// - render purpose-aware cards/related modules using same filter key
```

- [ ] **Step 4: Re-run tests**

Run:
`npx pnpm@10.4.1 exec jest __tests__/unit/components/SearchPageClient.test.tsx __tests__/unit/components/ListingDetailClient.test.tsx --runInBand`

Run:
`npx pnpm@10.4.1 exec playwright test __tests__/e2e/home.spec.ts __tests__/e2e/search-filters.spec.ts --project chromium`

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add components/search/SearchPageClient.tsx app/(public)/page.tsx components/listings/ListingDetailClient.tsx __tests__/unit/components/SearchPageClient.test.tsx __tests__/unit/components/ListingDetailClient.test.tsx __tests__/e2e/home.spec.ts __tests__/e2e/search-filters.spec.ts
git commit -m "feat: enforce buy mode consistency across apartments home and detail"
```

---

### Task 6: End-to-End Validation and Regression Sweep

**Files:**
- Modify (if needed): `__tests__/e2e/listing-wizard.spec.ts`
- Modify (if needed): `__tests__/e2e/home.spec.ts`
- Modify (if needed): `__tests__/e2e/search-filters.spec.ts`
- Modify (if needed): `__tests__/unit/*` for flake fixes

- [ ] **Step 1: Add final failing E2E for capped-user upgrade continuation**

```ts
test("normal user at cap can continue to listing wizard after upgrade confirm", async ({ page }) => {
  await page.goto("/manage/listings/new");
  await page.getByRole("button", { name: /become agent/i }).click();
  await expect(page.getByText(/create a new listing/i)).toBeVisible();
});
```

- [ ] **Step 2: Run targeted E2E first**

Run:
`npx pnpm@10.4.1 exec playwright test __tests__/e2e/listing-wizard.spec.ts --project chromium`

Expected:
- PASS for cap + upgrade continuation path

- [ ] **Step 3: Run full quality checks**

Run:
`npx pnpm@10.4.1 check`

Run:
`npx pnpm@10.4.1 test`

Run:
`npx pnpm@10.4.1 exec playwright test __tests__/e2e/home.spec.ts __tests__/e2e/search-filters.spec.ts __tests__/e2e/listing-wizard.spec.ts --project chromium`

Expected:
- All targeted checks pass; any intentional skips are documented

- [ ] **Step 4: Final cleanup for flaky assertions (if required)**

```ts
// tighten selectors to role-based queries and deterministic text
// remove timing-dependent assertions; prefer explicit waits for visible UI states
```

- [ ] **Step 5: Commit**

```bash
git add __tests__/e2e/listing-wizard.spec.ts __tests__/e2e/home.spec.ts __tests__/e2e/search-filters.spec.ts
git commit -m "test: verify agent cap upgrade flow and buy mode regressions"
```

---

## Spec Coverage Check

- Role/capability model (normal capped, agent unlimited): Task 1 + Task 2 + Task 3
- Auto-prompt upgrade at cap with confirm-to-continue: Task 3 + Task 6
- Buy mock ecosystem expansion: Task 4
- Purpose consistency across apartments/home/detail: Task 5
- Error/resilience verification and regressions: Task 6

No uncovered spec requirements remain.

## Placeholder Scan

- No `TBD`/`TODO` placeholders present.
- Each task includes explicit files, commands, expected outcomes, and commit actions.

## Type and Naming Consistency Check

- Consistent use of `purpose` values: `rent | sale`
- Consistent capability names: `activeListingCount`, `canCreateWithoutUpgrade`, `requiresAgentUpgrade`
- Role transition method consistently named `upgradeToAgent` in store and flow references
