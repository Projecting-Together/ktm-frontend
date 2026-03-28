import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getNeighborhood, getListings } from "@/lib/api/client";
import { ListingCard } from "@/components/listings/ListingCard";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getNeighborhood(slug);
  if (!res.data) return { title: "Neighborhood Not Found | KTM Apartments" };
  return {
    title: `${res.data.name} Apartments for Rent | KTM Apartments`,
    description: `Find verified apartments and rooms for rent in ${res.data.name}, Kathmandu.`,
  };
}

export default async function NeighborhoodDetailPage({ params }: Props) {
  const { slug } = await params;
  const [nRes, listingsRes] = await Promise.allSettled([
    getNeighborhood(slug),
    getListings({ neighborhood: slug, limit: 6, verified: true }),
  ]);

  const neighborhood = nRes.status === "fulfilled" ? nRes.value.data : null;
  if (!neighborhood) notFound();

  const listings = listingsRes.status === "fulfilled" ? (listingsRes.value.data?.items ?? []) : [];
  const metaDescription = typeof (neighborhood.meta_data as Record<string, unknown>)?.description === "string"
    ? (neighborhood.meta_data as Record<string, string>).description
    : null;

  return (
    <div className="container py-10">
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/neighborhoods" className="hover:text-accent">Neighborhoods</Link>
        <span>/</span>
        <span className="text-foreground">{neighborhood.name}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-2xl">🏙️</div>
          <div>
            <h1>{neighborhood.name}</h1>
            <p className="text-muted-foreground">{neighborhood.name_ne} · Kathmandu</p>
          </div>
        </div>
        {metaDescription && (
          <p className="mt-4 max-w-2xl text-muted-foreground">{metaDescription}</p>
        )}
      </div>

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

      <div className="mt-8 text-center">
        <Link href={`/apartments?neighborhood=${slug}`} className="btn-primary inline-flex gap-2">
          See All Listings in {neighborhood.name} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
