import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, MapPin, ShieldCheck } from "lucide-react";
import { AnimatedMetric } from "@/components/common/AnimatedMetric";
import { HomeHeroBackdrop } from "@/components/home/HomeHeroBackdrop";
import { HomeCtaBackdrop } from "@/components/home/HomeCtaBackdrop";
import { HomeHeroSearch } from "@/components/home/HomeHeroSearch";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/ListingCard";
import { fetchPublicListings } from "@/lib/api/server-public-listings";

export const revalidate = 300; // ISR — 5 minutes

export const metadata: Metadata = {
  title: "KTM Apartments — Find Your Home in Kathmandu",
  description:
    "Discover verified apartments, rooms, and houses for rent across Kathmandu. Search by price, layout, and amenities.",
};

const HOME_BACKGROUND_IMAGES = {
  hero:
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=2000&q=80",
  cta:
    "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=2000&q=80",
} as const;

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified Listings",
    desc: "Every listing goes through our verification process — no fake ads, no surprises.",
  },
  {
    icon: MapPin,
    title: "Sub-second Search",
    desc: "Optimized for Nepal's mobile networks. Fast results even on 3G connections.",
  },
  {
    icon: Building2,
    title: "Market Insights",
    desc: "Real-time pricing data and rental trends across Kathmandu.",
  },
];

export default async function HomePage() {
  // Fetch purpose-aware featured listings (ISR)
  const [featuredRentRes, featuredSaleRes] = await Promise.allSettled([
    fetchPublicListings(
      { limit: 8, sort_by: "created_at", sort_order: "desc", verified: true, purpose: "rent" },
      { revalidate: 300 }
    ),
    fetchPublicListings(
      { limit: 8, sort_by: "created_at", sort_order: "desc", verified: true, purpose: "sale" },
      { revalidate: 300 }
    ),
  ]);

  const rentOk = featuredRentRes.status === "fulfilled";
  const saleOk = featuredSaleRes.status === "fulfilled";
  const featuredRent =
    rentOk ? (featuredRentRes.value.data?.items ?? []) : [];
  const featuredSale =
    saleOk ? (featuredSaleRes.value.data?.items ?? []) : [];
  const featuredListingCount = featuredRent.length + featuredSale.length;
  const verifiedFeaturedCount = [...featuredRent, ...featuredSale].filter((listing) => listing.is_verified).length;
  const yearsServingRenters = Math.max(1, new Date().getUTCFullYear() - 2021);
  const stats = [
    { label: "Active Listings", value: 2400 + featuredListingCount, suffix: "+" },
    { label: "Verified Properties", value: 1800 + verifiedFeaturedCount, suffix: "+" },
    { label: "Years Serving Renters", value: yearsServingRenters, suffix: "+" },
    { label: "Happy Renters", value: 5000 + featuredListingCount * 2, suffix: "+" },
  ];

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary py-16 md:py-24 lg:py-32">
        <HomeHeroBackdrop staticFallback={HOME_BACKGROUND_IMAGES.hero} />
        <div
          data-testid="hero-image-overlay"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-primary/80"
        />
        <div className="pointer-events-none absolute inset-0 opacity-15">
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
              Discover verified apartments, rooms, and houses for rent in Kathmandu — without broker markups or hidden fees.
            </p>
          </div>

          <HomeHeroSearch />
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card">
        <div className="container py-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="price text-2xl font-bold text-accent md:text-3xl">
                  <AnimatedMetric
                    value={stat.value}
                    suffix={stat.suffix}
                    data-testid={`home-metric-${stat.label}`}
                  />
                </p>
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
              href="/listings?purpose=rent"
              className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {!rentOk ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))
            ) : featuredRent.length === 0 ? (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                No listings available. Check back soon.
              </p>
            ) : (
              featuredRent.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </div>

          <div className="mt-10 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-accent">
                Buy Mode
              </p>
              <h2 className="mt-1">Latest Verified Sale Listings</h2>
            </div>
            <Link
              href="/listings?purpose=sale"
              className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              View buy listings <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {!saleOk ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ListingCardSkeleton key={`sale-${i}`} />
              ))
            ) : featuredSale.length === 0 ? (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                No listings available. Check back soon.
              </p>
            ) : (
              featuredSale.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
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

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-accent" aria-hidden />
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
      <section className="section relative overflow-hidden bg-accent">
        <HomeCtaBackdrop staticFallback={HOME_BACKGROUND_IMAGES.cta} />
        <div
          data-testid="cta-image-overlay"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-black/30"
        />
        <div className="container text-center">
          <h2 className="text-white">Have a Property to List?</h2>
          <p className="mt-3 text-white/80">
            Post for rent or sale and reach thousands of verified buyers and renters in Kathmandu.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard/listings/new?purpose=rent"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-accent shadow-sm transition-all hover:bg-white/90 active:scale-95"
            >
              Post for Rent
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/listings/new?purpose=sale"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
            >
              Post for Sale
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
