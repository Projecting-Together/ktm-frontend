export type ShellNavItemDef = {
  id: string;
  href: string;
  label: string;
  exact?: boolean;
};

/** Dashboard nav may include Compare, which opens the global compare drawer instead of routing. */
export type DashboardShellNavItem =
  | ShellNavItemDef
  | { id: string; label: string; behavior: "compare-drawer" };

export const DASHBOARD_MEMBER_HUB_TITLE = "Member dashboard";

export const DASHBOARD_NEW_LISTING_LABEL = "New listing";

/**
 * Dashboard IA glossary (member account — one user identity):
 * - **Inquiries sent** → `/dashboard/inquiries` — messages you sent to listing contacts as a renter/buyer.
 * - **My visits** → `/dashboard/visits` — visits you scheduled on listings.
 * - **Lead inbox** → `/dashboard/leads/inquiries` — inquiries renters sent about **your** listings.
 * - **Visit requests** → `/dashboard/leads/visits` — visit requests from renters on **your** listings.
 */
export const DASHBOARD_NAV_GROUPS: ReadonlyArray<{
  title: string;
  items: ReadonlyArray<DashboardShellNavItem>;
}> = [
  {
    title: "Activity",
    items: [
      { id: "overview", href: "/dashboard", label: "Overview", exact: true },
      { id: "favorites", href: "/dashboard/favorites", label: "Saved" },
      { id: "recent", href: "/dashboard/recently-viewed", label: "Recently viewed" },
      { id: "inquiries-sent", href: "/dashboard/inquiries", label: "Inquiries sent" },
      { id: "visits-mine", href: "/dashboard/visits", label: "My visits" },
      { id: "compare", label: "Compare", behavior: "compare-drawer" },
      { id: "settings", href: "/dashboard/settings", label: "Settings" },
    ],
  },
  {
    title: "Listings & leads",
    items: [
      { id: "my-listings", href: "/dashboard/listings", label: "My listings" },
      { id: "lead-inbox", href: "/dashboard/leads/inquiries", label: "Lead inbox" },
      { id: "lead-visits", href: "/dashboard/leads/visits", label: "Visit requests" },
      { id: "news", href: "/dashboard/news", label: "News" },
      { id: "analytics", href: "/dashboard/analytics", label: "Analytics" },
    ],
  },
];

export const ADMIN_SHELL_SECTION_TITLE = "Admin Panel";

export const ADMIN_SHELL_NAV: ReadonlyArray<ShellNavItemDef> = [
  { id: "dash", href: "/admin", label: "Dashboard", exact: true },
  { id: "listings", href: "/admin/listings", label: "Listing Management" },
  { id: "transactions", href: "/admin/transactions", label: "Transactions" },
  { id: "users", href: "/admin/users", label: "User Management" },
  { id: "analytics", href: "/admin/analytics", label: "Analytics" },
];
