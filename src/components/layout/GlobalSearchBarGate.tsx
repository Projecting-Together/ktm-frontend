"use client";

import { usePathname } from "next/navigation";
import { GlobalSearchBar } from "@/components/layout/GlobalSearchBar";

const HIDE_PATHS = new Set(["/", "/listings"]);

/** Sticky under-nav search: omit on home and listings (those pages provide contextual search). */
export function GlobalSearchBarGate() {
  const pathname = usePathname();
  const normalized = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
  if (HIDE_PATHS.has(normalized)) return null;
  return <GlobalSearchBar />;
}
