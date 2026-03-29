"use client";

import dynamic from "next/dynamic";
import { useEffect, useCallback, useState, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { LayoutGrid, List, Loader2, Map as MapIcon, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/ListingCard";
import { FilterPanel } from "@/components/search/FilterPanel";
import { SearchBar } from "@/components/search/SearchBar";
import { useFilterStore, selectApiFilters } from "@/lib/stores/filterStore";
import { useListings } from "@/lib/hooks/useListings";
import { cn } from "@/lib/utils";

const SearchMapDynamic = dynamic(
  () => import("@/components/map/SearchMap").then((m) => m.SearchMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[min(70vh,560px)] w-full items-center justify-center rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  },
);

const SORT_OPTIONS = [
  { value: "created_at:desc", label: "Newest first" },
  { value: "price:asc", label: "Price: low to high" },
  { value: "price:desc", label: "Price: high to low" },
  { value: "area_sqft:desc", label: "Largest first" },
];

// Custom sort dropdown using buttons — works reliably with Playwright and React
function SortDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative" data-testid="sort-dropdown">
      <button
        data-testid="sort-trigger"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current.label}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-[600] mt-1 min-w-[180px] rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              data-testid={`sort-option-${opt.value.replace(":", "-")}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                "flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-muted",
                opt.value === value && "text-accent font-medium"
              )}
            >
              {opt.value === value && <Check className="h-3.5 w-3.5 shrink-0" />}
              {opt.value !== value && <span className="h-3.5 w-3.5 shrink-0" />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const store = useFilterStore();

  // Hydrate store from URL on mount
  useEffect(() => {
    const params: Record<string, unknown> = {};
    searchParams.forEach((value, key) => {
      if (
        [
          "page",
          "limit",
          "min_price",
          "max_price",
          "bedrooms",
          "min_lat",
          "max_lat",
          "min_lng",
          "max_lng",
          "lat",
          "lng",
          "radius_km",
        ].includes(key)
      )
        params[key] = Number(value);
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
    store.amenities, store.available_from, store.sort_by, store.sort_order, store.page,
    store.min_lat, store.max_lat, store.min_lng, store.max_lng, store.lat, store.lng, store.radius_km,
    syncUrl,
  ]);

  const filters = selectApiFilters(store as never);
  const { data, isPending, isError, error, refetch, isFetching } = useListings(filters);
  const listings = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 1;

  const [showSlowLoadHint, setShowSlowLoadHint] = useState(false);
  useEffect(() => {
    if (!isFetching) {
      setShowSlowLoadHint(false);
      return;
    }
    const t = window.setTimeout(() => setShowSlowLoadHint(true), 7000);
    return () => {
      window.clearTimeout(t);
      setShowSlowLoadHint(false);
    };
  }, [isFetching]);

  const errorMessage = error instanceof Error ? error.message : "Something went wrong.";

  return (
    <div className="container py-6">
      <div className="mb-4 md:hidden">
        <SearchBar size="sm" defaultValue={store.search ?? ""} defaultLocation={store.neighborhood ?? ""}
          onSearch={(q, loc) => store.setFilters({ search: q || undefined, neighborhood: loc || undefined })} />
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-xl font-bold">
            {isPending ? (
              <>
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-accent" aria-hidden />
                Searching…
              </>
            ) : (
              `${total.toLocaleString()} Properties`
            )}
          </h1>
          {showSlowLoadHint && isFetching && !isError && (
            <p className="mt-1 text-sm text-muted-foreground">
              Still loading — the API may be slow, or your connection may be unstable. Requests time out after about 25 seconds; then you&apos;ll see an error with a retry option.
            </p>
          )}
          {store.neighborhood && (
            <p className="text-sm text-muted-foreground capitalize">in {store.neighborhood.replace(",", ", ")}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={store.toggleFilterPanel}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <SortDropdown
            value={`${store.sort_by ?? "created_at"}:${store.sort_order ?? "desc"}`}
            onChange={(val) => { const [by, ord] = val.split(":"); store.setFilters({ sort_by: by, sort_order: ord as "asc"|"desc" }); }}
          />
          <div
            className="flex shrink-0 items-center rounded-lg border border-border bg-card"
            role="group"
            aria-label="Result layout"
          >
            {(["grid", "list", "map"] as const).map((v) => (
              <button
                key={v}
                type="button"
                data-testid={`view-${v}`}
                onClick={() => store.setView(v)}
                className={cn(
                  "flex min-h-10 min-w-10 items-center justify-center transition-colors sm:h-9 sm:w-9",
                  store.view === v ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
                )}
                aria-pressed={store.view === v}
                aria-label={v === "grid" ? "Grid view" : v === "list" ? "List view" : "Map view"}
              >
                {v === "grid" ? <LayoutGrid className="h-4 w-4" /> : v === "list" ? <List className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="hidden w-64 shrink-0 md:block"><FilterPanel mode="sidebar" /></div>

        {store.isFilterPanelOpen && (
          <div className="fixed inset-0 z-[2000] md:hidden">
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
          {isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
              <p className="text-sm font-semibold text-destructive">Couldn&apos;t load listings</p>
              <p className="mt-2 text-sm text-destructive/90">{errorMessage}</p>
              <button type="button" onClick={() => void refetch()} className="btn-primary mt-4">
                Try again
              </button>
            </div>
          ) : isPending ? (
            store.view === "map" ? (
              <div className="flex min-h-[min(70vh,560px)] w-full items-center justify-center rounded-xl border border-border bg-muted/20 text-sm text-muted-foreground">
                Loading map…
              </div>
            ) : (
              <div className={cn("grid gap-5", store.view === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <ListingCardSkeleton key={i} variant={store.view === "list" ? "list" : "grid"} />
                ))}
              </div>
            )
          ) : store.view === "map" ? (
            <SearchMapDynamic listings={listings} className="w-full" />
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
              <p className="text-4xl">🏠</p>
              <h3 className="mt-4 text-lg font-semibold">No listings found</h3>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or searching in a different neighborhood.</p>
              <button type="button" onClick={store.resetFilters} className="btn-primary mt-4">Clear all filters</button>
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
