import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getListing } from "@/lib/api/client";
import { notFound } from "next/navigation";
import { adminApproveListing, adminRejectListing } from "@/lib/api/client";

export const metadata: Metadata = { title: "Review Listing | Admin" };

type Props = { params: Promise<{ id: string }> };

export default async function AdminListingReviewPage({ params }: Props) {
  const { id } = await params;
  const res = await getListing(id);
  if (!res.data) notFound();
  const listing = res.data;

  return (
    <div>
      <Link href="/admin/listings" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to queue
      </Link>
      <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
      <p className="text-muted-foreground mb-6">Review this listing before approving or rejecting.</p>
      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm whitespace-pre-wrap">{listing.description}</p>
      </div>
    </div>
  );
}
