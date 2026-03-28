"use client";
import { useQuery } from "@tanstack/react-query";
import { getMyInquiries } from "@/lib/api/client";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function InquiriesPage() {
  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["inquiries", "sent"],
    queryFn: async () => {
      const res = await getMyInquiries();
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">My Inquiries</h1>
      <p className="text-muted-foreground mb-6">Messages you've sent to property owners.</p>

      {isLoading ? (
        <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : !inquiries?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold">No inquiries yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Find a listing you like and send an inquiry to the owner.</p>
          <Link href="/apartments" className="btn-primary mt-4">Browse Apartments</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div key={inq.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Link href={`/apartments/${inq.listing_id}`} className="font-semibold hover:text-accent text-sm">
                    View Property
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{inq.message}</p>
                  {inq.owner_reply && (
                    <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                      <p className="text-xs font-semibold text-accent mb-1">Owner replied:</p>
                      <p className="text-muted-foreground">{inq.owner_reply}</p>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                    inq.status === "replied" ? "bg-emerald-100 text-emerald-700" :
                    inq.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                  }`}>{inq.status}</span>
                  <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(inq.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
