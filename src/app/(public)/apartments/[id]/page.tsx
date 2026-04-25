import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPublicListingDetail } from "@/lib/api/server-public-listings";
import ListingDetailClient from "@/components/listings/ListingDetailClient";

export const revalidate = 60;
const USE_MSW_IN_BROWSER = process.env.NEXT_PUBLIC_USE_MSW === "true";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (USE_MSW_IN_BROWSER) {
    return {
      title: "Property Details | KTM Apartments",
      description: "View this property on KTM Apartments",
    };
  }
  const res = await fetchPublicListingDetail(id, { revalidate: 60 });
  if (!res.data) return { title: "Property Not Found | KTM Apartments" };
  return {
    title: `${res.data.title} | KTM Apartments`,
    description: res.data.description?.slice(0, 160) ?? "View this property on KTM Apartments",
    openGraph: {
      title: res.data.title,
      description: res.data.description?.slice(0, 160) ?? "",
      images: res.data.images?.[0]?.webp_url ? [res.data.images[0].webp_url] : [],
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  if (USE_MSW_IN_BROWSER) {
    return <ListingDetailClient slugOrId={id} />;
  }
  const res = await fetchPublicListingDetail(id, { revalidate: 60 });
  if (!res.data) notFound();
  return <ListingDetailClient listing={res.data} />;
}
