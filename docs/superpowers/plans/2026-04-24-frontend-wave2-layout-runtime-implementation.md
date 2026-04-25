# Frontend Wave 2 — Server Layout Shells and Runtime Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `docs/superpowers/specs/2026-04-24-frontend-wave2-layout-runtime-design.md`: server `layout.tsx` per authenticated segment with `dynamic = "force-dynamic"`, client shells in `*LayoutClient.tsx`, and a linked runtime / invalidation doc with a follow-up table—without changing React Query data flows.

**Architecture:** Each of `dashboard`, `manage`, and `admin` gets a thin **server** `layout.tsx` that only exports `dynamic` and renders one **client** child component holding the **exact** previous layout JSX and hooks. Documentation lives in `docs/superpowers/deployment-runtime-and-invalidation.md` with a link from `docs/superpowers/route-cache-intent.md` (create or update the latter if missing).

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, existing Jest/Playwright (no new suites required by default).

**Approved spec:** `docs/superpowers/specs/2026-04-24-frontend-wave2-layout-runtime-design.md`

---

## File map

| Path | Action |
| --- | --- |
| `src/app/dashboard/DashboardLayoutClient.tsx` | Create — full prior `layout.tsx` content with `"use client"`. |
| `src/app/dashboard/layout.tsx` | Replace — server component, `dynamic`, import client shell. |
| `src/app/manage/ManageLayoutClient.tsx` | Create — full prior `layout.tsx` content with `"use client"`. |
| `src/app/manage/layout.tsx` | Replace — server wrapper. |
| `src/app/admin/AdminLayoutClient.tsx` | Create — full prior `layout.tsx` content with `"use client"`. |
| `src/app/admin/layout.tsx` | Replace — server wrapper. |
| `docs/superpowers/deployment-runtime-and-invalidation.md` | Create — middleware, runtime, revalidation, topology, ticket table. |
| `docs/superpowers/route-cache-intent.md` | Create or update — add “See also” link to runtime doc (if file missing, recreate minimal content from Wave 1 plan § doc + Wave 2 link). |

---

### Task 1: Dashboard — server layout + client shell

**Files:**
- Create: `src/app/dashboard/DashboardLayoutClient.tsx`
- Modify: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Create `DashboardLayoutClient.tsx`** — paste the **entire** current `src/app/dashboard/layout.tsx` into the new file, then rename the default export to `DashboardLayoutClient`:

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Heart, Eye, MessageCircle, Calendar, GitCompare, Settings, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/dashboard/favorites", icon: Heart, label: "Saved" },
  { href: "/dashboard/recently-viewed", icon: Eye, label: "Recently Viewed" },
  { href: "/dashboard/inquiries", icon: MessageCircle, label: "Inquiries" },
  { href: "/dashboard/visits", icon: Calendar, label: "Visit Requests" },
  { href: "/dashboard/compare", icon: GitCompare, label: "Compare" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex flex-1 gap-6 py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-20 flex flex-col gap-1">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Renter Dashboard</p>
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}
                  className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                  <Icon className="h-4 w-4" />{item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `src/app/dashboard/layout.tsx`** with:

```tsx
import DashboardLayoutClient from "./DashboardLayoutClient";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
```

- [ ] **Step 3: Run typecheck**

Run: `npm run check`  
Expected: exit code 0.

- [ ] **Step 4: Manual smoke** — log in as a user with dashboard access, open `/dashboard`, `/dashboard/favorites`, confirm nav active states and layout unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/layout.tsx src/app/dashboard/DashboardLayoutClient.tsx
git commit -m "feat(layout): server dashboard layout with force-dynamic"
```

---

### Task 2: Manage — server layout + client shell

**Files:**
- Create: `src/app/manage/ManageLayoutClient.tsx`
- Modify: `src/app/manage/layout.tsx`

- [ ] **Step 1: Create `ManageLayoutClient.tsx`** — move full current `manage/layout.tsx` into new file; default export name `ManageLayoutClient`; component body unchanged from today’s `ManageLayout` (including `Plus` button block).

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, MessageCircle, Calendar, BarChart2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";

const NAV = [
  { href: "/manage", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/manage/listings", icon: Building2, label: "My Listings" },
  { href: "/manage/inquiries", icon: MessageCircle, label: "Inquiries" },
  { href: "/manage/visits", icon: Calendar, label: "Visit Requests" },
  { href: "/manage/analytics", icon: BarChart2, label: "Analytics" },
];

export default function ManageLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex flex-1 gap-6 py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-20 flex flex-col gap-1">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Owner / Agent</p>
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}
                  className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                  <Icon className="h-4 w-4" />{item.label}
                </Link>
              );
            })}
            <div className="mt-4 border-t border-border pt-4">
              <Link href="/manage/listings/new" className="btn-primary w-full justify-center gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> New Listing
              </Link>
            </div>
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `src/app/manage/layout.tsx`:**

```tsx
import ManageLayoutClient from "./ManageLayoutClient";

export const dynamic = "force-dynamic";

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return <ManageLayoutClient>{children}</ManageLayoutClient>;
}
```

- [ ] **Step 3:** `npm run check` — expect 0.

- [ ] **Step 4:** Manual smoke — `/manage`, `/manage/listings`, `/manage/listings/new` with allowed roles per `src/middleware.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/app/manage/layout.tsx src/app/manage/ManageLayoutClient.tsx
git commit -m "feat(layout): server manage layout with force-dynamic"
```

---

### Task 3: Admin — server layout + client shell

**Files:**
- Create: `src/app/admin/AdminLayoutClient.tsx`
- Modify: `src/app/admin/layout.tsx`

- [ ] **Step 1: Create `AdminLayoutClient.tsx`** — same pattern; full prior admin layout body; export `AdminLayoutClient`.

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Users, ClipboardList, BarChart2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/admin/listings", icon: Building2, label: "Listing Management" },
  { href: "/admin/transactions", icon: ClipboardList, label: "Transactions" },
  { href: "/admin/users", icon: Users, label: "User Management" },
  { href: "/admin/analytics", icon: BarChart2, label: "Analytics" },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container flex flex-1 gap-6 py-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-20 flex flex-col gap-1">
            <div className="mb-2 flex items-center gap-2 px-3">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin Panel</p>
            </div>
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}
                  className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                  <Icon className="h-4 w-4" />{item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `src/app/admin/layout.tsx`:**

```tsx
import AdminLayoutClient from "./AdminLayoutClient";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
```

- [ ] **Step 3:** `npm run check` — expect 0.

- [ ] **Step 4:** Manual smoke — admin user: `/admin`, `/admin/listings`; non-admin must still redirect per middleware.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/layout.tsx src/app/admin/AdminLayoutClient.tsx
git commit -m "feat(layout): server admin layout with force-dynamic"
```

---

### Task 4: Runtime, middleware, and invalidation documentation

**Files:**
- Create: `docs/superpowers/deployment-runtime-and-invalidation.md`
- Create or modify: `docs/superpowers/route-cache-intent.md`

- [ ] **Step 1: Create `deployment-runtime-and-invalidation.md`** with the following Markdown body (adjust only if repository paths differ):

```markdown
# Deployment runtime, middleware, and cache invalidation

Date: 2026-04-24

## Related docs

- Route-level cache intent: `docs/superpowers/route-cache-intent.md`
- Wave 1 program: `docs/superpowers/specs/2026-04-24-frontend-scalability-maintainability-program-design.md`
- Tag helpers: `src/lib/cache/listing-tags.ts`
- Server Action: `src/lib/cache/revalidate-public-listings.ts`

## Middleware (`src/middleware.ts`)

- **Matcher:** `export const config.matcher` runs middleware on all paths except `api`, `_next/static`, `_next/image`, `favicon.ico`, and common static image extensions.
- **Auth gate:** Paths under `/dashboard`, `/manage`, `/admin` require `accessToken` cookie; otherwise redirect to `/login?next=…`.
- **Role checks:** `userRole` cookie: `/admin/*` requires `admin`; `/manage/*` uses `isListingCreationPath` for `/manage/listings/new` vs other manage routes (see source for allowed roles).
- **CSP:** Every response passes through `withCsp` setting `Content-Security-Policy` from `src/lib/csp.ts`.
- **Cost note (SEC-01):** Middleware runs before matched routes; keep logic branchy but **I/O-free**—no external `fetch` here.

## Runtime: Edge vs Node

- **Middleware** in Next.js runs on the **Edge** runtime by default unless you adopt experimental Node middleware (not used in this repo at time of writing).
- **App Router** pages and route handlers in a standard `next build` + `next start` deployment run on the **Node** server process unless a file exports `export const runtime = 'edge'`.
- **Unknown until confirmed:** exact hosting topology (single Node instance vs horizontal scale behind a load balancer). Until confirmed, treat **on-demand `revalidateTag`** as **eventually consistent across instances** and track `W2-INV-1` below.

## On-demand revalidation (Wave 1)

- Public listing fetches use Next `fetch` **tags** (`listings:public`, `listings:detail:<id>`).
- After mutations, `revalidatePublicListingCache` (Server Action) calls `revalidateTag` when `accessToken` cookie is present.

## Follow-up table (replace Issue URL when filed)

| ID | Topic | Owner | Target | Status |
| --- | --- | --- | --- | --- |
| W2-INV-1 | Validate `revalidateTag` behavior when more than one Node instance serves the app | Record assignee in first PR that touches prod deploy | Next planning milestone | Open |
| W2-INV-2 | Confirm Edge middleware + Node RSC split against hosting provider documentation | Record assignee in first PR that touches prod deploy | Next planning milestone | Open |
```

- [ ] **Step 2: Ensure `route-cache-intent.md` exists** with at minimum: link to `deployment-runtime-and-invalidation.md`; public vs app summary; authenticated shells note (server `dynamic` + client shell after Wave 2). If the file was never merged, recreate from Wave 1 doc content in `docs/superpowers/plans/2026-04-24-frontend-scalability-maintainability-wave1.md` Task 6 description plus Wave 2 cross-link.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/deployment-runtime-and-invalidation.md docs/superpowers/route-cache-intent.md
git commit -m "docs: deployment runtime and invalidation follow-ups"
```

---

### Task 5: Closure

- [ ] **Step 1:** `npm test` — all suites pass.

- [ ] **Step 2 (optional):** `npm run test:e2e` — if failures are environmental, document in PR; do not block on flaky infra.

- [ ] **Step 3:** When opening PR, replace table **Owner** cells with real GitHub handles and add issue links for `W2-INV-1` / `W2-INV-2` if created.

---

## Spec coverage (self-review)

| Spec requirement | Task |
| --- | --- |
| Dashboard server `dynamic` + client shell | Task 1 |
| Manage server `dynamic` + client shell | Task 2 |
| Admin server `dynamic` + client shell | Task 3 |
| NEXT-2 / SEC-01 / DEPLOY docs + VERIFY-03 table | Task 4 |
| Linked route-cache doc | Task 4 |
| Testing / CI | Task 5 |

**Placeholder scan:** No `TBD` in executable steps; ticket rows use concrete IDs `W2-INV-1` / `W2-INV-2` and explicit “record assignee in PR” instruction.

---

## Execution handoff

**Plan saved to** `docs/superpowers/plans/2026-04-24-frontend-wave2-layout-runtime-implementation.md`.

**1. Subagent-Driven (recommended)** — Fresh subagent per task; use superpowers:subagent-driven-development.

**2. Inline Execution** — Same session with checkpoints; use superpowers:executing-plans.

**Which approach?**
