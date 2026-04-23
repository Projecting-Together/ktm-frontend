"use client";

import { SearchBar } from "@/components/search/SearchBar";

export function GlobalSearchBar() {
  return (
    <section
      role="search"
      aria-label="Global apartment search"
      className="sticky top-16 z-30 w-full border-b border-border bg-card/95 backdrop-blur-sm"
    >
      <div className="container py-3">
        <SearchBar size="sm" />
      </div>
    </section>
  );
}
