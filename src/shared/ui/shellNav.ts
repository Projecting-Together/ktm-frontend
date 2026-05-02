export type ShellNavItemDef = {
  id: string;
  href: string;
  label: string;
  exact?: boolean;
};

export const DASHBOARD_SHELL_SECTION_TITLE = "Renter Dashboard";

export const DASHBOARD_SHELL_NAV: ReadonlyArray<ShellNavItemDef> = [
  { id: "overview", href: "/dashboard", label: "Overview", exact: true },
  { id: "favorites", href: "/dashboard/favorites", label: "Saved" },
  { id: "recent", href: "/dashboard/recently-viewed", label: "Recently Viewed" },
  { id: "inquiries", href: "/dashboard/inquiries", label: "Inquiries" },
  { id: "visits", href: "/dashboard/visits", label: "Visit Requests" },
  { id: "compare", href: "/compare", label: "Compare" },
  { id: "settings", href: "/dashboard/settings", label: "Settings" },
];

export const ADMIN_SHELL_SECTION_TITLE = "Admin Panel";

export const ADMIN_SHELL_NAV: ReadonlyArray<ShellNavItemDef> = [
  { id: "dash", href: "/admin", label: "Dashboard", exact: true },
  { id: "listings", href: "/admin/listings", label: "Listing Management" },
  { id: "transactions", href: "/admin/transactions", label: "Transactions" },
  { id: "users", href: "/admin/users", label: "User Management" },
  { id: "analytics", href: "/admin/analytics", label: "Analytics" },
];

export const MANAGE_SHELL_SECTION_TITLE = "Owner / Agent";
export const MANAGE_NEW_LISTING_CTA = "New Listing";

export const MANAGE_SHELL_NAV: ReadonlyArray<ShellNavItemDef> = [
  { id: "overview", href: "/manage", label: "Overview", exact: true },
  { id: "listings", href: "/manage/listings", label: "My Listings" },
  { id: "inquiries", href: "/manage/inquiries", label: "Inquiries" },
  { id: "visits", href: "/manage/visits", label: "Visit Requests" },
  { id: "analytics", href: "/manage/analytics", label: "Analytics" },
];
