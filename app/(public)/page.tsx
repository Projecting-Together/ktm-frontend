import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, MapPin, TrendingUp } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/ListingCard";
import { getListings } from "@/lib/api/client";

export const revalidate = 300; // ISR — 5 minutes

export const metadata: Metadata = {
  title: "KTM Apartments — Find Your Home in Kathmandu",
  description:
    "Discover verified apartments, rooms, and houses for rent across Kathmandu. Thamel, Lazimpat, Patan, Bhaktapur, and more.",
};

const STATS = [
  { label: "Active Listings", value: "2,400+" },
  { label: "Verified Properties", value: "1,800+" },
  { label: "Neighborhoods", value: "25+" },
  { label: "Happy Renters", value: "5,000+" },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified Listings",
    desc: "Every listing goes through our verification process — no fake ads, no surprises.",
  },
  {
    icon: Zap,
    title: "Sub-second Search",
    desc: "Optimized for Nepal's mobile networks. Fast results even on 3G connections.",
  },
  {
    icon: MapPin,
    title: "Neighborhood Guides",
    desc: "Detailed area guides for every major Kathmandu neighborhood.",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    desc: "Real-time pricing data and rental trends across Kathmandu.",
  },
];

export default async function HomePage() {
  // Fetch featured listings (ISR)
  const featuredRes = await Promise.allSettled([
    getListings({ limit: 8, sort_by: "created_at", sort_order: "desc", verified: true }),
  ]);
  const featured =
    featuredRes[0].status === "fulfilled"
      ? (featuredRes[0].value.data?.items ?? [])
      : [];

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary py-16 md:py-24 lg:py-32">
        {/* Background pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_#E85D25_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_#10B981_0%,_transparent_50%)]" />
        </div>

        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent">
              <ShieldCheck className="h-4 w-4" />
              Nepal&apos;s Most Trusted Property Platform
            </p>
            <h1 className="text-primary-foreground">
              Find Your Perfect Home in{" "}
              <span className="text-accent">Kathmandu</span>
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/70 md:text-xl">
              Discover verified apartments, rooms, and houses across Thamel, Lazimpat, Patan, and beyond.
              No brokers. No hidden fees.
            </p>
          </div>

          {/* Search bar */}
          <div className="mx-auto mt-10 max-w-2xl">
            <SearchBar size="lg" />
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card">
        <div className="container py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="price text-2xl font-bold text-accent md:text-3xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Listings ─────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-accent">
                Fresh Listings
              </p>
              <h2 className="mt-1">Latest Verified Properties</h2>
            </div>
            <Link
              href="/apartments"
              className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.length > 0
              ? featured.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))
              : Array.from({ length: 8 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
          </div>
        </div>
      </section>

      {/* ── Why KTM Apartments ────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">
              Why Choose Us
            </p>
            <h2 className="mt-1">Built for Kathmandu</h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="section bg-accent">
        <div className="container text-center">
          <h2 className="text-white">Have a Property to Rent?</h2>
          <p className="mt-3 text-white/80">
            List your apartment or room for free. Reach thousands of verified renters in Kathmandu.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register?role=owner"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-accent shadow-sm transition-all hover:bg-white/90 active:scale-95"
            >
              Post Your Listing Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/agents"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Find an Agent
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
