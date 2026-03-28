import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin, TrendingUp, Users, Building2 } from "lucide-react";
import { getNeighborhood, getListings } from "@/lib/api/client";
import { ListingCard } from "@/components/listings/ListingCard";
import type { Neighborhood, ListingListItem } from "@/lib/api/types";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

// ── Static fallback data for the 5 core Kathmandu neighborhoods ──────────────
// Used when the backend is not yet available (dev / CI / staging without API)
type NeighborhoodDisplay = {
  id: string;
  name: string;
  name_ne: string;
  slug: string;
  lat: number;
  lng: number;
  description: string;
  highlights: string[];
  listing_count?: number;
  avg_price?: number | null;
  meta_data?: Record<string, unknown> | null;
};

const STATIC_NEIGHBORHOODS: Record<string, NeighborhoodDisplay> = {
  thamel: {
    id: "static-thamel",
    name: "Thamel",
    name_ne: "थमेल",
    slug: "thamel",
    lat: 27.7149,
    lng: 85.3123,
    description:
      "Thamel is Kathmandu's vibrant tourist hub and one of the most sought-after rental neighbourhoods. Known for its bustling streets, international restaurants, trekking shops, and lively nightlife, it offers excellent connectivity and a cosmopolitan atmosphere.",
    highlights: [
      "Walking distance to Durbar Square",
      "International restaurants & cafés",
      "Excellent public transport links",
      "Vibrant nightlife & shopping",
      "Popular with expats & digital nomads",
    ],
  },
  lazimpat: {
    id: "static-lazimpat",
    name: "Lazimpat",
    name_ne: "लाजिम्पाट",
    slug: "lazimpat",
    lat: 27.7225,
    lng: 85.3192,
    description:
      "Lazimpat is an upscale diplomatic enclave north of Thamel, home to numerous embassies, luxury hotels, and high-end residences. It offers a quieter, more refined living experience while remaining close to the city centre.",
    highlights: [
      "Diplomatic quarter — safe & secure",
      "Luxury apartments & villas",
      "Close to Narayanhiti Palace Museum",
      "Upscale restaurants & boutiques",
      "Excellent road connectivity",
    ],
  },
  patan: {
    id: "static-patan",
    name: "Patan",
    name_ne: "पाटन",
    slug: "patan",
    lat: 27.6710,
    lng: 85.3240,
    description:
      "Patan (Lalitpur) is a UNESCO World Heritage city renowned for its Newari architecture, artisan crafts, and cultural heritage. It offers a more relaxed pace of life than central Kathmandu while providing excellent amenities and a strong expat community.",
    highlights: [
      "UNESCO World Heritage Durbar Square",
      "Strong expat & NGO community",
      "Excellent international schools nearby",
      "Artisan crafts & cultural heritage",
      "Quieter than central Kathmandu",
    ],
  },
  bhaktapur: {
    id: "static-bhaktapur",
    name: "Bhaktapur",
    name_ne: "भक्तपुर",
    slug: "bhaktapur",
    lat: 27.6710,
    lng: 85.4298,
    description:
      "Bhaktapur is the best-preserved of the three Kathmandu Valley kingdoms, offering an authentic Newari living experience. Residents enjoy lower rental prices, clean air, and a strong sense of community, making it ideal for families.",
    highlights: [
      "Best-preserved medieval city in Nepal",
      "Lower rental prices than Kathmandu",
      "Cleaner air & quieter streets",
      "Strong community atmosphere",
      "Famous pottery & weaving traditions",
    ],
  },
  koteshwor: {
    id: "static-koteshwor",
    name: "Koteshwor",
    name_ne: "कोटेश्वर",
    slug: "koteshwor",
    lat: 27.6857,
    lng: 85.3508,
    description:
      "Koteshwor is a rapidly developing residential neighbourhood in eastern Kathmandu, popular with young professionals and families seeking modern apartments at competitive prices. It offers excellent ring-road connectivity and a growing commercial scene.",
    highlights: [
      "Excellent ring-road connectivity",
      "Modern apartment complexes",
      "Competitive rental prices",
      "Growing commercial & dining scene",
      "Popular with young professionals",
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(STATIC_NEIGHBORHOODS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fallback = STATIC_NEIGHBORHOODS[slug];
  try {
    const res = await getNeighborhood(slug);
    if (res.data) {
      return {
        title: `${res.data.name} Apartments for Rent | KTM Apartments`,
        description: `Find verified apartments and rooms for rent in ${res.data.name}, Kathmandu.`,
      };
    }
  } catch {
    // fall through to static
  }
  if (!fallback) return { title: "Neighborhood Not Found | KTM Apartments" };
  return {
    title: `${fallback.name} Apartments for Rent | KTM Apartments`,
    description: `Find verified apartments and rooms for rent in ${fallback.name}, Kathmandu. ${fallback.description}`,
  };
}

export default async function NeighborhoodDetailPage({ params }: Props) {
  const { slug } = await params;

  // Try live API first; fall back to static data gracefully
  let neighborhood: NeighborhoodDisplay | null = null;
  let listings: ListingListItem[] = [];

  try {
    const [nRes, listingsRes] = await Promise.allSettled([
      getNeighborhood(slug),
      getListings({ neighborhood: slug, limit: 6, verified: true }),
    ]);
    if (nRes.status === "fulfilled" && nRes.value.data) {
      const n = nRes.value.data;
      neighborhood = {
        id: n.id,
        name: n.name ?? "",
        name_ne: n.name_ne ?? "",
        slug: n.slug ?? slug,
        lat: n.lat ?? 0,
        lng: n.lng ?? 0,
        listing_count: n.listing_count,
        avg_price: n.avg_price,
        meta_data: n.meta_data as Record<string, unknown> | null,
        description: typeof (n.meta_data as Record<string, unknown>)?.description === "string"
          ? (n.meta_data as Record<string, string>).description
          : STATIC_NEIGHBORHOODS[slug]?.description ?? "",
        highlights: STATIC_NEIGHBORHOODS[slug]?.highlights ?? [],
      };
    }
    if (listingsRes.status === "fulfilled" && listingsRes.value.data?.items) {
      listings = listingsRes.value.data.items as ListingListItem[];
    }
  } catch {
    // API unavailable — use static fallback below
  }

  // Fall back to static data if API returned nothing
  if (!neighborhood) {
    const fallback = STATIC_NEIGHBORHOODS[slug];
    if (!fallback) notFound();
    neighborhood = fallback;
  }

  const description = neighborhood.description;
  const highlights = neighborhood.highlights ?? [];

  return (
    <div className="container py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/neighborhoods" className="hover:text-accent">Neighborhoods</Link>
        <span>/</span>
        <span className="text-foreground">{neighborhood.name}</span>
      </nav>

      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-2xl">🏙️</div>
          <div>
            <h1 className="text-3xl font-bold">{neighborhood.name}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {neighborhood.name_ne} · Kathmandu Valley
            </p>
          </div>
        </div>
        {description && (
          <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-card p-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Building2 className="h-3 w-3" />
              </div>
              <span className="text-sm text-foreground">{h}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick stats */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <TrendingUp className="mx-auto mb-1 h-5 w-5 text-accent" />
          <p className="text-xs text-muted-foreground">Avg. Rent</p>
          <p className="font-semibold text-foreground">NPR 25,000–60,000</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Users className="mx-auto mb-1 h-5 w-5 text-accent" />
          <p className="text-xs text-muted-foreground">Popular With</p>
          <p className="font-semibold text-foreground">Expats & Professionals</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <MapPin className="mx-auto mb-1 h-5 w-5 text-accent" />
          <p className="text-xs text-muted-foreground">Location</p>
          <p className="font-semibold text-foreground">Kathmandu Valley</p>
        </div>
      </div>

      {/* Live listings (only shown when backend is available) */}
      {listings.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-5">
            <h2 className="text-xl font-semibold">Available in {neighborhood.name}</h2>
            <Link href={`/apartments?neighborhood=${slug}`} className="flex items-center gap-1 text-sm text-accent hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link href={`/apartments?neighborhood=${slug}`} className="btn-primary inline-flex gap-2">
          See All Listings in {neighborhood.name} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
