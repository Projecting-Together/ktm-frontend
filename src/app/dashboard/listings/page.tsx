"use client";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMyListings } from "@/lib/api/client";
import { formatListingPrice, formatRelativeTime, getStatusColor, formatListingStatusLabel, cn } from "@/lib/utils";
import { useDeleteListing, usePublishListing } from "@/lib/hooks/useListings";
import { Suspense } from "react";

function MyListingsContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");

  const filterKey = statusFilter === "archived" ? "archived" : "all";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "owner-listings", filterKey],
    queryFn: async () => {
      const res =
        filterKey === "archived"
          ? await getMyListings({ status: "archived", skip: 0, limit: 100 })
          : await getMyListings({ skip: 0, limit: 100 });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
  });

  const { mutate: deleteListing } = useDeleteListing();
  const { mutate: publishListing } = usePublishListing();

  const items = data?.items ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Link href="/dashboard/listings/new" className="btn-primary gap-1.5">
          <Plus className="h-4 w-4" /> New Listing
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <h3 className="font-semibold text-destructive">Could not load listings</h3>
          <p className="mt-1 text-sm text-muted-foreground">Sign in as an owner and try again.</p>
        </div>
      ) : items.length === 0 ? (
        statusFilter === "archived" ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <h3 className="font-semibold">No expired listings</h3>
            <p className="mt-1 text-sm text-muted-foreground">Listings past their period appear here.</p>
            <Link href="/dashboard/listings" className="btn-primary mt-4 inline-flex">
              View all listings
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <h3 className="font-semibold">No listings yet</h3>
            <Link href="/dashboard/listings/new" className="btn-primary mt-4 inline-flex">
              Create your first listing
            </Link>
          </div>
        )
      ) : (
        <div className="space-y-3">
          {items.map((listing) => (
            <div key={listing.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold shrink-0", getStatusColor(listing.status))}>
                    {formatListingStatusLabel(listing.status)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{formatListingPrice(listing)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(listing.created_at)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/listings/${listing.slug}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-accent hover:border-accent"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/dashboard/listings/${listing.id}/edit`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-accent hover:border-accent"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Link>
                {listing.status === "draft" && (
                  <button onClick={() => publishListing(listing.id)} className="text-xs font-medium text-accent hover:underline px-2">
                    Publish
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm("Delete this listing?")) deleteListing(listing.id);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      }
    >
      <MyListingsContent />
    </Suspense>
  );
}
