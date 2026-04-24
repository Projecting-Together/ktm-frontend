import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getMarketListingDetail } from "@/lib/api/client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getMarketListingDetail(slug);

  if (result.error && result.error.status !== 404) {
    return {
      title: "Market Listing Unavailable | KTM Apartments",
      description: "Market listing detail is temporarily unavailable.",
    };
  }

  if (!result.data || result.data.status !== "published") {
    return {
      title: "Market Listing Not Found | KTM Apartments",
      description: "The requested market listing was not found.",
    };
  }

  return {
    title: `${result.data.title} | KTM Apartments`,
    description: result.data.description,
  };
}

export const revalidate = 60;

export default async function PublicMarketListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getMarketListingDetail(slug);

  if (result.error && result.error.status !== 404) {
    return (
      <main className="container py-10">
        <div className="mx-auto max-w-2xl rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-rose-700">Market listing temporarily unavailable</h1>
          <p className="mt-3 text-sm text-rose-700/90">
            We could not load this market listing right now. Please try again shortly.
          </p>
          <Link href="/market-listing" className="mt-4 inline-flex text-sm font-medium text-rose-700 underline">
            Back to market listings
          </Link>
        </div>
      </main>
    );
  }

  if (!result.data || result.data.status !== "published") {
    notFound();
  }

  return (
    <main className="container py-10">
      <Link
        href="/market-listing"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to market listings
      </Link>

      <article className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 md:p-8">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {result.data.published_at
            ? new Date(result.data.published_at).toLocaleDateString("en-US", { dateStyle: "medium" })
            : "Published"}
        </p>
        <h1 className="mt-2">{result.data.title}</h1>
        <p className="mt-3 text-muted-foreground">{result.data.description}</p>
        <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-border bg-background p-4 sm:grid-cols-2">
          <p className="text-sm text-muted-foreground">
            Location: <span className="font-medium text-foreground">{result.data.location}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Type: <span className="font-medium capitalize text-foreground">{result.data.property_type}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Price:{" "}
            <span className="font-medium text-foreground">
              {result.data.currency} {result.data.price.toLocaleString("en-US")}
            </span>
          </p>
        </div>
      </article>
    </main>
  );
}
