"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { adminGetAnalytics } from "@/lib/api/client";
import { Building2, Users, Flag, BarChart2 } from "lucide-react";

export default function AdminPage() {
  const { data: analytics } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const res = await adminGetAnalytics();
      if (res.error) throw new Error(res.error.message);
      return res.data!;
    },
  });

  const stats = [
    { label: "Total Listings", value: analytics?.total_listings ?? "—", icon: Building2, href: "/admin/listings" },
    { label: "Total Users", value: analytics?.total_users ?? "—", icon: Users, href: "/admin/users" },
    { label: "Pending Review", value: analytics?.pending_listings ?? "—", icon: Flag, href: "/admin/listings?status=pending" },
    { label: "Active Listings", value: analytics?.active_listings ?? "—", icon: BarChart2, href: "/admin/analytics" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">Platform overview and moderation queue.</p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}
              className="rounded-xl border border-border bg-card p-5 transition-all hover:border-accent hover:shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 mb-3">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <p className="text-2xl font-bold">{String(s.value)}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="font-semibold text-amber-800 mb-2">Moderation Queue</h3>
        <p className="text-sm text-amber-700">Review pending listings in the <Link href="/admin/listings" className="underline">Listings</Link> section.</p>
      </div>
    </div>
  );
}
