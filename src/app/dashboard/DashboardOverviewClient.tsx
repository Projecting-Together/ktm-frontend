"use client";
import Link from "next/link";
import { Heart, MessageCircle, Calendar, Eye, Clock3 } from "lucide-react";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useAuthStore } from "@/lib/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { getMyListings } from "@/lib/api/client";

export default function DashboardOverviewClient() {
  const { user } = useAuthStore();
  const { data: favorites } = useFavorites();
  const { data: expiredTotal } = useQuery({
    queryKey: ["dashboard", "listings", "my-expired-total"],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const res = await getMyListings({ status: "archived", skip: 0, limit: 1 });
      if (res.error) return 0;
      return res.data?.total ?? 0;
    },
  });

  // Server maps `archived` to stored `expired`; total is owner-scoped via my-listings.
  const expiredListingsCount = expiredTotal ?? 0;

  const stats = [
    { label: "Saved Listings", value: favorites?.length ?? 0, icon: Heart, href: "/dashboard/favorites" },
    { label: "Active Inquiries", value: 0, icon: MessageCircle, href: "/dashboard/inquiries" },
    { label: "Visit Requests", value: 0, icon: Calendar, href: "/dashboard/visits" },
    { label: "Expired Listings", value: expiredListingsCount, icon: Clock3, href: "/manage/listings?status=archived" },
    { label: "Recently Viewed", value: 0, icon: Eye, href: "/dashboard/recently-viewed" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Welcome back{user?.profile?.first_name ? `, ${user.profile.first_name}` : ""}!
      </h1>
      <p className="mt-1 text-muted-foreground">{"Here's your rental activity overview."}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}
              className="rounded-xl border border-border bg-card p-5 transition-all hover:border-accent hover:shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-4xl mb-3">🏠</p>
        <h3 className="font-semibold">Start your search</h3>
        <p className="mt-1 text-sm text-muted-foreground">Browse thousands of verified listings across Kathmandu.</p>
        <Link href="/listings" className="btn-primary mt-4 inline-flex">Browse listings</Link>
      </div>
    </div>
  );
}
