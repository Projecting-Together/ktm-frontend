import type { Metadata } from "next";
import Link from "next/link";
import { getMarketListings } from "@/lib/api/client";

export const metadata: Metadata = {
  title: "Market Listings | KTM Apartments",
  description: "Browse published Kathmandu market listing updates and pricing signals.",
};

export const revalidate = 60;

export default async function PublicMarketListingPage() {
  const result = await getMarketListings({ page: 1, limit: 12 });
  const items = (result.data?.items ?? []).filter((item) => item.status === "published");
  const hasError = Boolean(result.error);

  return (
    <main className="container py-10">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Public Market Feed</p>
        <h1 className="mt-2">Market Listings</h1>
        <p className="mt-3 text-muted-foreground">Published pricing and neighborhood signals from KTM Apartments market contributors.</p>
      </div>

      {hasError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-10 text-center">
          <h2 className="text-lg font-semibold text-rose-700">Market listings are temporarily unavailable</h2>
          <p className="mt-2 text-sm text-rose-700/90">
            We could not load published market listings right now. Please try again shortly.
          </p>
        </div>
      ) : !items.length ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <h2 className="text-lg font-semibold">No published listings yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Please check back soon for fresh neighborhood market updates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {item.published_at ? new Date(item.published_at).toLocaleDateString("en-US", { dateStyle: "medium" }) : "Published"}
              </p>
              <h2 className="mt-2 text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              <Link
                href={`/market-listing/${item.slug}`}
                className="mt-4 inline-flex text-sm font-medium text-accent hover:underline"
              >
                View listing
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
