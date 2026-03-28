"use client";
import { useState } from "react";
import { useAdminPendingListings, useAdminApproveListing, useAdminRejectListing } from "@/lib/hooks/useListings";
import { formatRelativeTime } from "@/lib/utils";
import { CheckCircle, XCircle, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminListingsPage() {
  const [page, setPage] = useState(1);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const { data, isLoading } = useAdminPendingListings(page);
  const { mutate: approve } = useAdminApproveListing();
  const { mutate: reject } = useAdminRejectListing();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Listing Moderation</h1>
      <p className="text-muted-foreground mb-6">Review and approve or reject submitted listings.</p>

      {isLoading ? (
        <div className="space-y-3">{Array.from({length:4}).map((_,i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : !data?.items?.length ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-semibold">All caught up!</h3>
          <p className="text-sm text-muted-foreground">No listings pending review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.items.map((listing) => (
            <div key={listing.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-semibold">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Submitted {formatRelativeTime(listing.created_at)}</p>
                </div>
                <Link href={`/apartments/${listing.slug}`} target="_blank"
                  className="flex items-center gap-1 text-xs text-accent hover:underline shrink-0">
                  <Eye className="h-3.5 w-3.5" /> Preview
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => approve(listing.id)}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200">
                  <CheckCircle className="h-3.5 w-3.5" /> Approve
                </button>
                <button onClick={() => reject({ id: listing.id, reason: rejectReason[listing.id] ?? "Does not meet listing standards" })}
                  className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200">
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
                <input value={rejectReason[listing.id] ?? ""} onChange={(e) => setRejectReason(p => ({...p, [listing.id]: e.target.value}))}
                  placeholder="Rejection reason..." className="flex-1 h-8 rounded-lg border border-border bg-background px-2 text-xs focus:border-accent focus:outline-none" />
              </div>
            </div>
          ))}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Previous</button>
              <span className="text-sm text-muted-foreground">Page {page} of {data.total_pages}</span>
              <button disabled={page >= data.total_pages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
