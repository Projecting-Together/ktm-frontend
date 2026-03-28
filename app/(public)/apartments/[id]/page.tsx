import { Suspense } from "react";
import ListingDetailClient from "@/components/listings/ListingDetailClient";

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<main className="container py-8">Loading...</main>}>
      <ListingDetailAsync params={params} />
    </Suspense>
  );
}

async function ListingDetailAsync({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListingDetailClient listingId={id} />;
}
