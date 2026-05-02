/** Desktop/tablet header links (no Home—same order as legacy Navbar). */
export const PRIMARY_NAV_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/listings", label: "Listings" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export type MobileNavItemId = "home" | "search" | "post" | "saved" | "profile";

export type MobileNavItemDef = {
  id: MobileNavItemId;
  href: string;
  label: string;
  exact?: boolean;
  accent?: boolean;
};

/** Bottom nav metadata; icons remain in `MobileNav.tsx` in this order. */
export const MOBILE_NAV_ITEMS: ReadonlyArray<MobileNavItemDef> = [
  { id: "home", href: "/", label: "Home", exact: true },
  { id: "search", href: "/listings", label: "Search" },
  { id: "post", href: "/manage/listings/new", label: "Post", accent: true },
  { id: "saved", href: "/dashboard/favorites", label: "Saved" },
  { id: "profile", href: "/dashboard", label: "Profile" },
];
