import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getListing } from "@/lib/api/client";
import ListingDetailClient from "@/components/listings/ListingDetailClient";

export const revalidate = 60;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const res = await getListing(id);
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
  const res = await getListing(id);
  if (!res.data) notFound();
  return <ListingDetailClient listing={res.data} />;
}
