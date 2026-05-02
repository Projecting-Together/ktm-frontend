"use client";
import { useQuery } from "@tanstack/react-query";
import { getMyVisitRequests } from "@/lib/api/client";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Calendar } from "lucide-react";

export default function VisitsPage() {
  const { data: visits, isLoading } = useQuery({
    queryKey: ["visits", "my"],
    queryFn: async () => {
      const res = await getMyVisitRequests();
      if (res.error) throw new Error(res.error.message);
      return res.data ?? [];
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Visit Requests</h1>
      <p className="text-muted-foreground mb-6">Your scheduled property visits.</p>

      {isLoading ? (
        <div className="space-y-3">{Array.from({length:3}).map((_,i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : !visits?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold">No visit requests yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Schedule a visit from any property detail page.</p>
          <Link href="/listings" className="btn-primary mt-4">Browse listings</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((v) => (
            <div key={v.id} className="rounded-xl border border-border bg-card p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">Visit Request</p>
                <p className="text-sm text-muted-foreground">Preferred: {formatDate(v.preferred_date)}</p>
                {v.confirmed_date && <p className="text-sm text-emerald-600">Confirmed: {formatDate(v.confirmed_date)}</p>}
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                v.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                v.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
              }`}>{v.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
