import type { Metadata } from "next";
import { ListingForm } from "@/components/listings/ListingForm";

export const metadata: Metadata = {
  title: "Edit Listing | KTM Apartments",
};

type Props = { params: Promise<{ id: string }> };

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit Listing</h1>
        <p className="text-muted-foreground mt-1">Update your property details.</p>
      </div>
      <ListingForm listingId={id} />
    </div>
  );
}
