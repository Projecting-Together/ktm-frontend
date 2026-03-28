"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getListing, initializeAuth, Listing } from "@/lib/api/client";

export default function ListingDetailClient({ listingId }: { listingId: string }) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const res = await getListing(listingId);
      if (cancelled) return;
      if (res.error) {
        setError(res.error.message);
        setListing(null);
      } else {
        setListing(res.data ?? null);
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  if (loading) {
    return <p className="container py-8">Loading...</p>;
  }
  if (error || !listing) {
    return (
      <main className="container py-8">
        <p className="text-red-600">{error ?? "Listing not found."}</p>
        <Link href="/apartments" className="mt-4 inline-block text-sm underline">
          Back to search
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-8">
      <Link href="/apartments" className="text-sm text-slate-600 underline">
        ← Back to search
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">{listing.title}</h1>
      <p className="mt-2 text-slate-600">
        {listing.location?.city ?? "—"} · {listing.bedrooms ?? 0} bed · {listing.bathrooms ?? 0} bath
      </p>
      <p className="mt-4 text-lg">
        {listing.currency ?? "NPR"} {listing.price ?? "—"}
        {listing.price_period ? ` / ${listing.price_period}` : ""}
      </p>
      {listing.description ? <p className="mt-6 whitespace-pre-wrap">{listing.description}</p> : null}
      {listing.amenities?.length ? (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Amenities</h2>
          <ul className="mt-2 list-inside list-disc text-sm text-slate-700">
            {listing.amenities.map((a) => (
              <li key={a.id}>{a.name}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </main>
  );
}
