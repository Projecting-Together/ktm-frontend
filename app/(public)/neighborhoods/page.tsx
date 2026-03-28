import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { getNeighborhoods } from "@/lib/api/client";
import { KTM_NEIGHBORHOODS } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kathmandu Neighborhoods | KTM Apartments",
  description: "Explore apartment rental markets across Kathmandu neighborhoods — Thamel, Lazimpat, Patan, Bhaktapur, Koteshwor, and more.",
};

export default async function NeighborhoodsPage() {
  const res = await getNeighborhoods();
  const neighborhoods = res.data ?? KTM_NEIGHBORHOODS.map((n, i) => ({ ...n, id: String(i), listing_count: 0, avg_price: null, meta_data: null }));

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl text-center mb-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">Explore Kathmandu</p>
        <h1 className="mt-2">Neighborhood Guides</h1>
        <p className="mt-3 text-muted-foreground">Discover the character, amenities, and rental market of each Kathmandu neighborhood.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {neighborhoods.map((n) => (
          <Link key={n.slug} href={`/neighborhoods/${n.slug}`}
            className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-2xl">🏙️</div>
            <h2 className="text-lg font-semibold group-hover:text-accent">{n.name}</h2>
            <p className="text-sm text-muted-foreground">{n.name_ne}</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> Kathmandu
              </span>
              <span className="flex items-center gap-1 font-medium text-accent">
                View area <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
