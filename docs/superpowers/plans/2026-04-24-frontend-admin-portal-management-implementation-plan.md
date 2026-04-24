# Frontend Admin Portal Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade existing admin routes into a consistent, mock-driven admin portal with Dashboard, Listing Management, Transactions, User Management, and Analytics.

**Architecture:** Keep the current `app/admin` route family and introduce reusable `components/admin` UI primitives plus an API-ready `lib/admin/service.ts` abstraction backed by mock datasets. Route pages consume only the service layer and shared components so backend integration later is isolated to the service and adapters.

**Tech Stack:** Next.js App Router, React, TypeScript, TanStack Query, Jest + Testing Library, existing utility classes/components.

---

## Planned File Structure

### Create
- `lib/admin/types.ts`
- `lib/admin/service.ts`
- `lib/mocks/admin/dashboard.ts`
- `lib/mocks/admin/listings.ts`
- `lib/mocks/admin/transactions.ts`
- `lib/mocks/admin/users.ts`
- `lib/mocks/admin/analytics.ts`
- `components/admin/StatCard.tsx`
- `components/admin/StatusBadge.tsx`
- `components/admin/FilterToolbar.tsx`
- `components/admin/DataTable.tsx`
- `components/admin/BulkActionBar.tsx`
- `app/admin/transactions/page.tsx`
- `__tests__/unit/components/admin/StatusBadge.test.tsx`
- `__tests__/unit/lib/admin/service.test.ts`
- `__tests__/integration/admin/listings-bulk-actions.test.tsx`
- `__tests__/integration/admin/transactions-page.test.tsx`
- `__tests__/integration/admin/users-page-actions.test.tsx`
- `__tests__/integration/admin/routes-smoke.test.tsx`

### Modify
- `app/admin/layout.tsx`
- `app/admin/page.tsx`
- `app/admin/listings/page.tsx`
- `app/admin/users/page.tsx`
- `app/admin/analytics/page.tsx`

---

### Task 1: Establish Admin Domain Types and Mock Data

**Files:**
- Create: `lib/admin/types.ts`
- Create: `lib/mocks/admin/dashboard.ts`
- Create: `lib/mocks/admin/listings.ts`
- Create: `lib/mocks/admin/transactions.ts`
- Create: `lib/mocks/admin/users.ts`
- Create: `lib/mocks/admin/analytics.ts`
- Test: `__tests__/unit/lib/admin/service.test.ts`

- [ ] **Step 1: Write the failing type-contract test**

```ts
import { describe, expect, it } from "@jest/globals";
import type { AdminListing, AdminTransaction, AdminUser } from "@/lib/admin/types";

describe("admin type contracts", () => {
  it("supports statuses required by management UI", () => {
    const listing: AdminListing = { id: "l1", title: "Sample", type: "apartment", status: "pending", city: "Kathmandu", priceNpr: 45000000, createdAt: "2026-04-24T00:00:00.000Z" };
    const transaction: AdminTransaction = { id: "t1", userId: "u1", listingId: "l1", amountNpr: 50000, status: "paid", paymentMethod: "wallet", createdAt: "2026-04-24T00:00:00.000Z" };
    const user: AdminUser = { id: "u1", email: "admin@test.com", role: "user", status: "active", joinedAt: "2026-04-24T00:00:00.000Z" };
    expect([listing.status, transaction.status, user.status]).toEqual(["pending", "paid", "active"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/unit/lib/admin/service.test.ts -t "admin type contracts"`
Expected: FAIL with missing `@/lib/admin/types` exports.

- [ ] **Step 3: Implement minimal types and mock datasets**

```ts
// lib/admin/types.ts
export type ListingStatus = "pending" | "active" | "sold" | "rejected";
export type TransactionStatus = "paid" | "pending" | "refunded" | "failed";
export type UserStatus = "active" | "inactive" | "suspended";
export type UserRole = "user" | "agent" | "admin";

export interface AdminListing { id: string; title: string; type: "apartment" | "house" | "land"; status: ListingStatus; city: string; priceNpr: number; createdAt: string; }
export interface AdminTransaction { id: string; userId: string; listingId: string; amountNpr: number; status: TransactionStatus; paymentMethod: "card" | "bank" | "wallet"; createdAt: string; }
export interface AdminUser { id: string; email: string; role: UserRole; status: UserStatus; joinedAt: string; }
```

```ts
// lib/mocks/admin/listings.ts (sample)
import type { AdminListing } from "@/lib/admin/types";
export const mockAdminListings: AdminListing[] = [
  { id: "l1", title: "Skyline Heights Apt 4B", type: "apartment", status: "active", city: "Lalitpur", priceNpr: 45000000, createdAt: "2026-04-01T09:00:00.000Z" },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- __tests__/unit/lib/admin/service.test.ts -t "admin type contracts"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/admin/types.ts lib/mocks/admin/*.ts __tests__/unit/lib/admin/service.test.ts
git commit -m "feat: add admin domain types and mock datasets"
```

### Task 2: Build API-Ready Admin Service Layer

**Files:**
- Create: `lib/admin/service.ts`
- Modify: `__tests__/unit/lib/admin/service.test.ts`

- [ ] **Step 1: Write failing service behavior tests**

```ts
import { describe, expect, it } from "@jest/globals";
import { adminService } from "@/lib/admin/service";

describe("adminService", () => {
  it("filters listings by status and query", async () => {
    const result = await adminService.getListings({ status: "pending", q: "plot", page: 1 });
    expect(result.items.every((item) => item.status === "pending")).toBe(true);
  });

  it("updates transaction status", async () => {
    const updated = await adminService.updateTransactionStatus("t1", "refunded");
    expect(updated.status).toBe("refunded");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/unit/lib/admin/service.test.ts -t "adminService"`
Expected: FAIL because `adminService` is undefined.

- [ ] **Step 3: Implement minimal service facade**

```ts
// lib/admin/service.ts
export const adminService = {
  async getListings(params) { /* filter + paginate mockAdminListings */ },
  async bulkUpdateListingStatus(ids, status) { /* return updated rows */ },
  async bulkDeleteListings(ids) { /* return count */ },
  async getTransactions(params) { /* filter + paginate */ },
  async updateTransactionStatus(id, status) { /* update one row */ },
  async getUsers(params) { /* filter + paginate */ },
  async updateUser(id, patch) { /* role/status updates */ },
  async deleteUser(id) { /* remove mock row */ },
  async getDashboardSummary() { /* cards + activity */ },
  async getAnalytics(params) { /* KPI + chart series + export payload */ },
};
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npm test -- __tests__/unit/lib/admin/service.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/admin/service.ts __tests__/unit/lib/admin/service.test.ts
git commit -m "feat: add admin service facade backed by mock data"
```

### Task 3: Implement Shared Admin UI Primitives

**Files:**
- Create: `components/admin/StatCard.tsx`
- Create: `components/admin/StatusBadge.tsx`
- Create: `components/admin/FilterToolbar.tsx`
- Create: `components/admin/DataTable.tsx`
- Create: `components/admin/BulkActionBar.tsx`
- Create: `__tests__/unit/components/admin/StatusBadge.test.tsx`

- [ ] **Step 1: Write failing `StatusBadge` mapping test**

```tsx
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/admin/StatusBadge";

it("renders pending status with readable label", () => {
  render(<StatusBadge status="pending" />);
  expect(screen.getByText("Pending")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/unit/components/admin/StatusBadge.test.tsx`
Expected: FAIL due to missing component.

- [ ] **Step 3: Implement shared components**

```tsx
// components/admin/StatusBadge.tsx
const STATUS_MAP = {
  pending: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  sold: "bg-slate-200 text-slate-800",
  failed: "bg-rose-100 text-rose-800",
};

export function StatusBadge({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const className = STATUS_MAP[status as keyof typeof STATUS_MAP] ?? "bg-muted text-foreground";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>{label}</span>;
}
```

- [ ] **Step 4: Run component tests**

Run: `npm test -- __tests__/unit/components/admin/StatusBadge.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/admin/*.tsx __tests__/unit/components/admin/StatusBadge.test.tsx
git commit -m "feat: add reusable admin UI primitives"
```

### Task 4: Upgrade Admin Layout Navigation and Labels

**Files:**
- Modify: `app/admin/layout.tsx`
- Test: `__tests__/integration/admin/routes-smoke.test.tsx`

- [ ] **Step 1: Write failing nav smoke test**

```tsx
import { render, screen } from "@testing-library/react";
import AdminLayout from "@/app/admin/layout";

it("shows required admin navigation labels", () => {
  render(<AdminLayout><div>Child</div></AdminLayout>);
  expect(screen.getByText("Dashboard")).toBeInTheDocument();
  expect(screen.getByText("Listing Management")).toBeInTheDocument();
  expect(screen.getByText("Transactions")).toBeInTheDocument();
  expect(screen.getByText("User Management")).toBeInTheDocument();
  expect(screen.getByText("Analytics")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/integration/admin/routes-smoke.test.tsx -t "required admin navigation labels"`
Expected: FAIL because labels/routes differ.

- [ ] **Step 3: Update admin nav config**

```tsx
const NAV = [
  { href: "/admin", label: "Dashboard", exact: true, icon: LayoutDashboard },
  { href: "/admin/listings", label: "Listing Management", icon: Building2 },
  { href: "/admin/transactions", label: "Transactions", icon: Receipt },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
];
```

- [ ] **Step 4: Run smoke test**

Run: `npm test -- __tests__/integration/admin/routes-smoke.test.tsx -t "required admin navigation labels"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/admin/layout.tsx __tests__/integration/admin/routes-smoke.test.tsx
git commit -m "feat: align admin layout navigation with portal modules"
```

### Task 5: Rebuild Dashboard Page with Shared Cards + Activity

**Files:**
- Modify: `app/admin/page.tsx`
- Modify: `__tests__/integration/admin/routes-smoke.test.tsx`

- [ ] **Step 1: Add failing dashboard assertions**

```tsx
it("renders dashboard summary and activity sections", async () => {
  // render /admin page
  expect(await screen.findByText("Dashboard Overview")).toBeInTheDocument();
  expect(screen.getByText("Recent Activity")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/integration/admin/routes-smoke.test.tsx -t "dashboard summary and activity"`
Expected: FAIL (old headings/content).

- [ ] **Step 3: Implement dashboard using `StatCard` + service**

```tsx
const { data } = useQuery({ queryKey: ["admin", "dashboard"], queryFn: adminService.getDashboardSummary });
return (
  <>
    <h1>Dashboard Overview</h1>
    <section>{/* StatCard grid */}</section>
    <section aria-label="Recent Activity">{/* activity list */}</section>
  </>
);
```

- [ ] **Step 4: Run dashboard tests**

Run: `npm test -- __tests__/integration/admin/routes-smoke.test.tsx -t "dashboard summary and activity"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/admin/page.tsx __tests__/integration/admin/routes-smoke.test.tsx
git commit -m "feat: upgrade admin dashboard overview UI"
```

### Task 6: Upgrade Listing Management for Full + Bulk Actions

**Files:**
- Modify: `app/admin/listings/page.tsx`
- Create: `__tests__/integration/admin/listings-bulk-actions.test.tsx`

- [ ] **Step 1: Write failing integration test for bulk actions**

```tsx
it("selects rows and performs bulk approve", async () => {
  // render listings page
  await user.click(screen.getByLabelText("Select listing l1"));
  await user.click(screen.getByRole("button", { name: "Bulk Approve" }));
  expect(await screen.findByText("1 listing approved")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/integration/admin/listings-bulk-actions.test.tsx`
Expected: FAIL due to missing selection toolbar/actions.

- [ ] **Step 3: Implement table, filters, and bulk actions**

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);
// use FilterToolbar + DataTable + BulkActionBar
// row actions: View, Edit, Delete, Approve, Reject
// bulk actions: approve/delete via adminService
```

- [ ] **Step 4: Run integration test**

Run: `npm test -- __tests__/integration/admin/listings-bulk-actions.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/admin/listings/page.tsx __tests__/integration/admin/listings-bulk-actions.test.tsx
git commit -m "feat: implement listing management with row and bulk controls"
```

### Task 7: Add Transactions Page with Status Update + CSV Export

**Files:**
- Create: `app/admin/transactions/page.tsx`
- Create: `__tests__/integration/admin/transactions-page.test.tsx`

- [ ] **Step 1: Write failing transactions integration test**

```tsx
it("updates transaction status and exposes csv export", async () => {
  expect(screen.getByRole("button", { name: "Export CSV" })).toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText("Status for t1"), "refunded");
  expect(await screen.findByText("Transaction status updated")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/integration/admin/transactions-page.test.tsx`
Expected: FAIL because `/admin/transactions` page does not exist.

- [ ] **Step 3: Implement transactions page**

```tsx
// app/admin/transactions/page.tsx
// render FilterToolbar + DataTable
// per-row status select -> adminService.updateTransactionStatus
// Export CSV button -> build CSV from current filtered rows
```

- [ ] **Step 4: Run integration test**

Run: `npm test -- __tests__/integration/admin/transactions-page.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/admin/transactions/page.tsx __tests__/integration/admin/transactions-page.test.tsx
git commit -m "feat: add admin transactions management page"
```

### Task 8: Upgrade User Management to Full Action Set

**Files:**
- Modify: `app/admin/users/page.tsx`
- Create: `__tests__/integration/admin/users-page-actions.test.tsx`

- [ ] **Step 1: Write failing user action tests**

```tsx
it("supports role change, suspend, force reset, and delete", async () => {
  await user.selectOptions(screen.getByLabelText("Role for u1"), "admin");
  await user.click(screen.getByRole("button", { name: "Suspend" }));
  await user.click(screen.getByRole("button", { name: "Force Password Reset" }));
  await user.click(screen.getByRole("button", { name: "Delete User" }));
  expect(await screen.findByText("User deleted")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/integration/admin/users-page-actions.test.tsx`
Expected: FAIL with missing controls.

- [ ] **Step 3: Implement full user management UI actions**

```tsx
// include role select, activate/deactivate toggle, suspend action
// add force reset action button with confirmation
// add delete action button with destructive confirmation
// wire each to adminService.updateUser/deleteUser and toast feedback
```

- [ ] **Step 4: Run integration test**

Run: `npm test -- __tests__/integration/admin/users-page-actions.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/admin/users/page.tsx __tests__/integration/admin/users-page-actions.test.tsx
git commit -m "feat: expand admin user management controls"
```

### Task 9: Upgrade Analytics with Charts, Filters, and Exports

**Files:**
- Modify: `app/admin/analytics/page.tsx`
- Modify: `__tests__/integration/admin/routes-smoke.test.tsx`

- [ ] **Step 1: Write failing analytics feature test**

```tsx
it("renders charts and report export actions", async () => {
  expect(await screen.findByText("Analytics Overview")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Export CSV" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Export PDF" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- __tests__/integration/admin/routes-smoke.test.tsx -t "charts and report export actions"`
Expected: FAIL because page currently has cards only.

- [ ] **Step 3: Implement analytics page enhancements**

```tsx
// heading: Analytics Overview
// FilterToolbar with date/city/type controls
// KPI StatCards
// chart sections for listing/user/revenue trends using existing chart approach in repo
// Export CSV/PDF buttons using service-provided export payload
```

- [ ] **Step 4: Run analytics tests**

Run: `npm test -- __tests__/integration/admin/routes-smoke.test.tsx -t "charts and report export actions"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/admin/analytics/page.tsx __tests__/integration/admin/routes-smoke.test.tsx
git commit -m "feat: upgrade admin analytics with filters charts and exports"
```

### Task 10: Full Verification Pass and Documentation Sync

**Files:**
- Modify (if needed): `docs/superpowers/specs/2026-04-24-frontend-admin-portal-management-design.md`
- Modify (if needed): changed files from tasks 1-9

- [ ] **Step 1: Run complete targeted test suite**

Run: `npm test -- __tests__/unit/components/admin/StatusBadge.test.tsx __tests__/unit/lib/admin/service.test.ts __tests__/integration/admin/routes-smoke.test.tsx __tests__/integration/admin/listings-bulk-actions.test.tsx __tests__/integration/admin/transactions-page.test.tsx __tests__/integration/admin/users-page-actions.test.tsx`
Expected: PASS for all admin-focused tests.

- [ ] **Step 2: Run lint/type checks**

Run: `npm run lint`
Expected: no new lint errors in admin files.

Run: `npm run test -- --runInBand`
Expected: no regressions introduced by admin changes.

- [ ] **Step 3: Validate acceptance criteria against spec**

```md
- [x] Five pages available in admin nav
- [x] Listing row + bulk actions
- [x] Transaction status update + CSV export
- [x] User management full action set
- [x] Analytics cards + charts + filters + CSV/PDF export
- [x] Service abstraction isolates data source
```

- [ ] **Step 4: Prepare final delivery commit**

```bash
git add app/admin components/admin lib/admin lib/mocks/admin __tests__/integration/admin __tests__/unit/components/admin __tests__/unit/lib/admin docs/superpowers/specs/2026-04-24-frontend-admin-portal-management-design.md
git commit -m "feat: deliver ui-first admin portal management upgrade"
```

---

## Self-Review Checklist

### 1) Spec coverage check
- Goal and scope covered by Tasks 1-10.
- Information architecture covered by Tasks 4-9.
- Shared components covered by Task 3.
- Data flow/service abstraction covered by Tasks 1-2.
- Error handling and resilience covered by Tasks 6-9 and verification in Task 10.
- Testing strategy covered by Tasks 1-10.

No uncovered spec requirements found.

### 2) Placeholder scan
- No `TBD`, `TODO`, or deferred placeholders.
- Each task contains concrete file paths, commands, and expected outcomes.

### 3) Type consistency
- Status and role naming is consistent across `lib/admin/types.ts`, service methods, and page-level actions.
- Service method names referenced in UI tasks match definitions in Task 2.

