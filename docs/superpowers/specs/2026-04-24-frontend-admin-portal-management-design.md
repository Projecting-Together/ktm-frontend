# Frontend Admin Portal Management Design

Date: 2026-04-24
Status: Proposed and user-validated (brainstorming)
Owner: Frontend Team

## 1) Goal

Upgrade the existing admin portal UI to provide complete operational control over platform listings, transactions, users, and analytics, while staying frontend-first with mock data for rapid iteration.

## 2) Scope

### In scope (V1)

- Upgrade existing `/admin` route family (no separate admin v2 namespace)
- Deliver five admin modules:
  - Dashboard
  - Listing Management
  - Transactions
  - User Management
  - Analytics
- Use UI-first implementation backed by mock data and API-ready service contracts
- Add reusable admin UI building blocks to avoid page-by-page duplication
- Ensure all critical admin actions are represented in the interface (with mock behavior)

### Out of scope (V1)

- Production backend integration for new admin workflows
- Replacing entire global design system/theme
- Fine-grained permission matrix per admin role
- Real financial reconciliation logic

## 3) Product Decisions (Validated)

- Architecture choice: **Approach 1 — route upgrade with shared admin components**
- Delivery mode: **UI-first with mock data**
- Listing Management capabilities: **full controls + bulk actions**
- Transactions capabilities: **status updates + CSV export**
- User Management capabilities: **full controls (activate/deactivate, role changes, suspend, force reset, delete)**
- Analytics capabilities: **cards + charts + filters + downloadable reports**

## 4) Information Architecture

Keep the existing admin namespace and align naming to operational language:

- `/admin` => Dashboard
- `/admin/listings` => Listing Management
- `/admin/transactions` => Transactions (new route)
- `/admin/users` => User Management
- `/admin/analytics` => Analytics

Sidebar and page labels should match this naming set for consistency.

## 5) UI and Component Design

### 5.1 Shared admin components

Create reusable primitives under `components/admin/`:

- `AdminShell`: sidebar + topbar + page header layout
- `StatCard`: KPI cards for dashboard and analytics
- `FilterToolbar`: search + select filters + date range + reset
- `DataTable`: standardized table container with pagination/empty states
- `BulkActionBar`: contextual action strip for selected rows
- `StatusBadge`: consistent status chips across all entities

### 5.2 Dashboard

- High-level KPI cards
- Pending approvals and actionable queue callouts
- Recent platform activity feed

### 5.3 Listing Management

- Search + filters (type, status, city, date)
- Row-level actions:
  - View
  - Edit
  - Delete
  - Approve / Reject
- Bulk actions:
  - Bulk approve
  - Bulk delete
- Selection controls:
  - row checkbox
  - select page
  - clear selection

### 5.4 Transactions

- Transaction table with status, amount, user, listing, date, and payment method
- Row action to update status (`paid`, `refunded`, `failed`, etc.)
- CSV export for current filtered result set

### 5.5 User Management

- Search + filters (role, status, verification state)
- Row-level admin actions:
  - Activate / deactivate
  - Change role
  - Suspend
  - Force password reset
  - Delete user
- Destructive actions require explicit confirmation

### 5.6 Analytics

- KPI cards (listings, users, transactions, revenue summary)
- Trend charts (listing growth, user growth, revenue trajectory)
- Filter controls:
  - Date range
  - City
  - Listing type
- Report export actions:
  - CSV
  - PDF

## 6) Data Flow and State

### 6.1 Frontend data contract approach

- Add admin mock datasets under `lib/mocks/admin/`:
  - `dashboard.ts`
  - `listings.ts`
  - `transactions.ts`
  - `users.ts`
  - `analytics.ts`
- Define shared admin domain types in `lib/admin/types.ts`
- Add API-ready facade in `lib/admin/service.ts` that currently resolves from mocks

### 6.2 State model

- URL query params store table/discovery state:
  - `q`, `page`, `status`, `type`, `city`, `from`, `to`, etc.
- Row selection for bulk actions stays in local page state
- Service methods return consistent shapes regardless of data source (mock or API)

### 6.3 API readiness

- All page-level data reads and writes go through `lib/admin/service.ts`
- Swapping to backend requires changing service internals, not page components

## 7) Error Handling and UX Resilience

- Every module supports:
  - loading skeleton
  - empty state
  - recoverable error state with retry action
- Action feedback:
  - success toasts for completed actions
  - clear error toasts/messages for failures
- Destructive operations (delete, suspend, bulk delete) use confirmation prompts
- Export actions show in-progress disabled state and completion feedback

## 8) Testing Strategy

### 8.1 Unit tests

- `StatusBadge` mapping consistency
- Filter/query serialization and hydration logic
- Bulk selection state transitions

### 8.2 Integration tests

- Listing bulk approve/delete flow
- Transaction status update and export trigger behavior
- User management action flows (suspend, role change, force reset, delete)

### 8.3 Route smoke tests

- Verify render and baseline interactions for:
  - `/admin`
  - `/admin/listings`
  - `/admin/transactions`
  - `/admin/users`
  - `/admin/analytics`

## 9) Risks and Mitigations

- Risk: UI logic tightly coupled to mock shape
  - Mitigation: centralize contracts in `lib/admin/types.ts` + service facade
- Risk: Inconsistent interaction patterns across modules
  - Mitigation: enforce shared admin component primitives
- Risk: Over-scoping v1 UX polish delays delivery
  - Mitigation: prioritize functional admin actions first, polish second

## 10) Acceptance Criteria

- Existing admin route family is upgraded with consistent navigation and labels
- Five modules are available and navigable:
  - Dashboard
  - Listing Management
  - Transactions
  - User Management
  - Analytics
- Listing Management includes row and bulk moderation/management actions
- Transactions supports status updates and CSV export from filtered view
- User Management supports all selected control actions with confirmation for destructive operations
- Analytics includes KPI cards, charts, filters, and CSV/PDF export controls
- UI runs end-to-end using mock data through an API-ready service layer
