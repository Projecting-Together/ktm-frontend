"use client";

import { useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/ListingCard";
import { FilterPanel } from "@/components/search/FilterPanel";
import { SearchBar } from "@/components/search/SearchBar";
import { useFilterStore, selectApiFilters } from "@/lib/stores/filterStore";
import { useListings } from "@/lib/hooks/useListings";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "created_at:desc", label: "Newest first" },
  { value: "price:asc", label: "Price: low to high" },
  { value: "price:desc", label: "Price: high to low" },
  { value: "area_sqft:desc", label: "Largest first" },
];

export default function SearchPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const store = useFilterStore();

  // Hydrate store from URL on mount
  useEffect(() => {
    const params: Record<string, unknown> = {};
    searchParams.forEach((value, key) => {
      if (["page", "limit", "min_price", "max_price", "bedrooms"].includes(key)) params[key] = Number(value);
      else if (["verified", "parking", "pets_allowed"].includes(key)) params[key] = value === "true";
      else if (key === "amenities") {
        const existing = params[key] as string[] | undefined;
        params[key] = existing ? [...existing, value] : [value];
      } else params[key] = value;
    });
    store.setFilters(params as never);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncUrl = useCallback(() => {
    const filters = selectApiFilters(store as never);
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(filters)) {
      if (val === undefined || val === null || val === "") continue;
      if (Array.isArray(val)) val.forEach((v) => params.append(key, String(v)));
      else params.set(key, String(val));
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [store, router, pathname]);

  useEffect(() => { syncUrl(); }, [
    store.search, store.neighborhood, store.listing_type, store.min_price, store.max_price,
    store.bedrooms, store.furnishing, store.parking, store.pets_allowed, store.verified,
    store.amenities, store.available_from, store.sort_by, store.sort_order, store.page, syncUrl,
  ]);

  const filters = selectApiFilters(store as never);
  const { data, isLoading, isError } = useListings(filters);
  const listings = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 1;

  return (
    <div className="container py-6">
      <div className="mb-4 md:hidden">
        <SearchBar size="sm" defaultValue={store.search ?? ""} defaultLocation={store.neighborhood ?? ""}
          onSearch={(q, loc) => store.setFilters({ search: q || undefined, neighborhood: loc || undefined })} />
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{isLoading ? "Searching..." : `${total.toLocaleString()} Properties`}</h1>
          {store.neighborhood && <p className="text-sm text-muted-foreground capitalize">in {store.neighborhood.replace(",", ", ")}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={store.toggleFilterPanel}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted md:hidden">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <select value={`${store.sort_by ?? "created_at"}:${store.sort_order ?? "desc"}`}
            onChange={(e) => { const [by, ord] = e.target.value.split(":"); store.setFilters({ sort_by: by, sort_order: ord as "asc"|"desc" }); }}
            className="h-9 rounded-lg border border-border bg-card px-2 text-sm focus:border-accent focus:outline-none">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="hidden items-center rounded-lg border border-border bg-card sm:flex">
            {(["grid", "list"] as const).map((v) => (
              <button key={v} onClick={() => store.setView(v)}
                className={cn("flex h-9 w-9 items-center justify-center transition-colors",
                  store.view === v ? "bg-accent text-white" : "text-muted-foreground hover:text-foreground")}>
                {v === "grid" ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="hidden w-64 shrink-0 md:block"><FilterPanel mode="sidebar" /></div>

        {store.isFilterPanelOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={store.toggleFilterPanel} />
            <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card">
              <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-4">
                <h3 className="font-semibold">Filters</h3>
                <button onClick={store.toggleFilterPanel} className="text-muted-foreground">✕</button>
              </div>
              <FilterPanel mode="drawer" />
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {isError && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive">Failed to load listings. Please try again.</div>}
          {isLoading ? (
            <div className={cn("grid gap-5", store.view === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
              {Array.from({ length: 9 }).map((_, i) => <ListingCardSkeleton key={i} variant={store.view === "list" ? "list" : "grid"} />)}
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
              <p className="text-4xl">🏠</p>
              <h3 className="mt-4 text-lg font-semibold">No listings found</h3>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or searching in a different neighborhood.</p>
              <button onClick={store.resetFilters} className="btn-primary mt-4">Clear all filters</button>
            </div>
          ) : (
            <div className={cn("grid gap-5", store.view === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
              {listings.map((listing) => <ListingCard key={listing.id} listing={listing} variant={store.view === "list" ? "list" : "grid"} />)}
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button disabled={store.page === 1} onClick={() => store.setFilter("page", (store.page ?? 1) - 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Previous</button>
              <span className="text-sm text-muted-foreground">Page {store.page ?? 1} of {totalPages}</span>
              <button disabled={(store.page ?? 1) >= totalPages} onClick={() => store.setFilter("page", (store.page ?? 1) + 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
