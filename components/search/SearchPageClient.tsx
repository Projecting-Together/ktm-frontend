"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getListings, initializeAuth, ListingFilters, ListingListItem } from "@/lib/api/client";

const SearchMap = dynamic(() => import("@/components/map/SearchMap").then((m) => m.SearchMap), { ssr: false });

function asNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ListingListItem[]>([]);
  const [total, setTotal] = useState(0);

  const queryState = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      listing_type: searchParams.get("listing_type") ?? "rent",
      city: searchParams.get("city") ?? "",
      min_price: asNumber(searchParams.get("min_price"), 0),
      max_price: asNumber(searchParams.get("max_price"), 0),
      page: Math.max(asNumber(searchParams.get("page"), 1), 1),
      limit: Math.max(asNumber(searchParams.get("limit"), 20), 1),
      view: (searchParams.get("view") === "map" ? "map" : "list") as "list" | "map",
      sort_by: searchParams.get("sort_by") || "created_at",
      sort_order: (searchParams.get("sort_order") === "asc" ? "asc" : "desc") as "asc" | "desc",
    }),
    [searchParams],
  );

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      const filters: ListingFilters = {
        search: queryState.search || undefined,
        listing_type: queryState.listing_type || undefined,
        city: queryState.city || undefined,
        min_price: queryState.min_price > 0 ? queryState.min_price : undefined,
        max_price: queryState.max_price > 0 ? queryState.max_price : undefined,
        skip: (queryState.page - 1) * queryState.limit,
        limit: queryState.limit,
        sort_by: queryState.sort_by,
        sort_order: queryState.sort_order,
      };

      const response = await getListings(filters);
      if (response.error) {
        setError(response.error.message);
        setItems([]);
        setTotal(0);
      } else {
        const page = response.data;
        setItems(page?.items ?? []);
        setTotal(response.meta?.total ?? page?.total ?? 0);
      }
      setLoading(false);
    }
    fetchData();
  }, [queryState]);

  function updateQuery(next: Record<string, string | number>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value === "" || value === 0) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    if (!("page" in next)) {
      params.set("page", "1");
    }
    router.replace(`/apartments?${params.toString()}`);
  }

  function setView(view: "list" | "map") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.replace(`/apartments?${params.toString()}`);
  }

  const totalPages = Math.max(Math.ceil(total / queryState.limit), 1);

  return (
    <main className="container py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1>Apartments Search</h1>
          <p className="text-sm text-slate-600">URL-driven filters with backend contract integration.</p>
        </div>
        <nav className="flex gap-2 text-sm">
          <button
            type="button"
            className={queryState.view === "list" ? "font-semibold underline" : ""}
            onClick={() => setView("list")}
          >
            List
          </button>
          <span className="text-slate-400">|</span>
          <button
            type="button"
            className={queryState.view === "map" ? "font-semibold underline" : ""}
            onClick={() => setView("map")}
          >
            Map
          </button>
          <Link href="/login">Login</Link>
        </nav>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          value={queryState.search}
          onChange={(e) => updateQuery({ search: e.target.value })}
          placeholder="Search keyword"
          className="rounded border px-3 py-2"
        />
        <input
          value={queryState.city}
          onChange={(e) => updateQuery({ city: e.target.value })}
          placeholder="City"
          className="rounded border px-3 py-2"
        />
        <select
          value={queryState.listing_type}
          onChange={(e) => updateQuery({ listing_type: e.target.value })}
          className="rounded border px-3 py-2"
        >
          <option value="rent">Rent</option>
          <option value="sale">Sale</option>
        </select>
        <input
          value={queryState.min_price || ""}
          onChange={(e) => updateQuery({ min_price: Number(e.target.value || 0) })}
          type="number"
          placeholder="Min price"
          className="rounded border px-3 py-2"
        />
        <input
          value={queryState.max_price || ""}
          onChange={(e) => updateQuery({ max_price: Number(e.target.value || 0) })}
          type="number"
          placeholder="Max price"
          className="rounded border px-3 py-2"
        />
        <input
          value={queryState.limit}
          onChange={(e) => updateQuery({ limit: Number(e.target.value || 20) })}
          type="number"
          min={1}
          max={100}
          className="rounded border px-3 py-2"
        />
        <select
          value={queryState.sort_by}
          onChange={(e) => updateQuery({ sort_by: e.target.value })}
          className="rounded border px-3 py-2"
        >
          <option value="created_at">Newest</option>
          <option value="price">Price</option>
          <option value="area_sqft">Area</option>
          <option value="bedrooms">Bedrooms</option>
        </select>
        <select
          value={queryState.sort_order}
          onChange={(e) => updateQuery({ sort_order: e.target.value })}
          className="rounded border px-3 py-2"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </section>

      {loading ? <p>Loading listings...</p> : null}
      {error ? <p className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">{error}</p> : null}

      {queryState.view === "map" ? (
        <section className="mb-6">
          <SearchMap listings={items} />
        </section>
      ) : null}

      <section className="space-y-3">
        {items.map((listing) => (
          <article key={listing.id} className="rounded border p-4">
            <h2 className="text-lg font-semibold">
              <Link href={`/apartments/${listing.id}`} className="hover:underline">
                {listing.title}
              </Link>
            </h2>
            <p className="text-sm text-slate-600">
              {listing.location?.city ?? "Unknown city"} · {listing.bedrooms ?? 0} bed · {listing.bathrooms ?? 0} bath
            </p>
            <p className="mt-2 text-sm">
              {listing.currency ?? "NPR"} {listing.price ?? "—"}
            </p>
          </article>
        ))}
      </section>

      <footer className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Total: {total} · Page {queryState.page} / {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
            disabled={queryState.page <= 1}
            onClick={() => updateQuery({ page: queryState.page - 1 })}
          >
            Previous
          </button>
          <button
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
            disabled={queryState.page >= totalPages}
            onClick={() => updateQuery({ page: queryState.page + 1 })}
          >
            Next
          </button>
        </div>
      </footer>
    </main>
  );
}
