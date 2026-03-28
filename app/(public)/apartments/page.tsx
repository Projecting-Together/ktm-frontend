import { Suspense } from "react";
import SearchPageClient from "@/components/search/SearchPageClient";

export default function ApartmentsPage() {
  return (
    <Suspense fallback={<main className="container py-8">Loading search...</main>}>
      <SearchPageClient />
    </Suspense>
  );
}
