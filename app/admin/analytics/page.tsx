"use client";
import { useQuery } from "@tanstack/react-query";
import { adminGetAnalytics } from "@/lib/api/client";
import { BarChart2 } from "lucide-react";

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const res = await adminGetAnalytics();
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
  });

  const stats = data ? [
    { label: "Total Listings", value: data.total_listings },
    { label: "Active Listings", value: data.active_listings },
    { label: "Pending Review", value: data.pending_listings },
    { label: "Total Users", value: data.total_users },
    { label: "Total Inquiries", value: data.total_inquiries },
    { label: "Total Views", value: data.total_views },
  ] : [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Analytics</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{Array.from({length:6}).map((_,i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <p className="text-2xl font-bold">{s.value?.toLocaleString() ?? "—"}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
