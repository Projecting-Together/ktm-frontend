import type { Metadata } from "next";
import { ListingForm } from "@/components/listings/ListingForm";

export const metadata: Metadata = {
  title: "Create New Listing | KTM Apartments",
};

type NewListingPageProps = {
  searchParams?: Promise<{
    purpose?: string | string[];
  }>;
};

export default async function NewListingPage({ searchParams }: NewListingPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawPurpose = Array.isArray(resolvedSearchParams?.purpose)
    ? resolvedSearchParams?.purpose[0]
    : resolvedSearchParams?.purpose;
  const initialPurpose = rawPurpose === "sale" ? "sale" : "rent";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Create a New Listing</h1>
        <p className="text-muted-foreground mt-1">Fill in the details to list your property on KTM Apartments.</p>
      </div>
      <ListingForm initialPurpose={initialPurpose} />
    </div>
  );
}
