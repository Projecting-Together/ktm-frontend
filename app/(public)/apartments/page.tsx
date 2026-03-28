import { Suspense } from "react";
import type { Metadata } from "next";
import SearchPageClient from "@/components/search/SearchPageClient";

export const metadata: Metadata = {
  title: "Apartments for Rent in Kathmandu | KTM Apartments",
  description: "Search verified apartments, rooms, and houses for rent across Kathmandu. Filter by neighborhood, price, bedrooms, and amenities.",
};

export default function ApartmentsPage() {
  return (
    <Suspense fallback={<div className="container py-8"><div className="skeleton h-8 w-48 mb-4" /><div className="grid grid-cols-3 gap-5">{Array.from({length:6}).map((_,i)=><div key={i} className="skeleton aspect-[4/3] rounded-xl" />)}</div></div>}>
      <SearchPageClient />
    </Suspense>
  );
}
