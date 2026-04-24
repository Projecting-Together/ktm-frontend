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

function resolveInitialPurpose(rawPurpose: string | undefined) {
  return rawPurpose?.trim().toLowerCase() === "sale" ? "sale" : "rent";
}

export default async function NewListingPage({ searchParams }: NewListingPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawPurpose = Array.isArray(resolvedSearchParams?.purpose)
    ? resolvedSearchParams?.purpose[0]
    : resolvedSearchParams?.purpose;
  const initialPurpose = resolveInitialPurpose(rawPurpose);

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
