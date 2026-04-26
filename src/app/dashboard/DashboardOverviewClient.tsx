"use client";
import Link from "next/link";
import { Heart, MessageCircle, Calendar, Eye, Clock3 } from "lucide-react";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useAuthStore } from "@/lib/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { getListings } from "@/lib/api/client";

export default function DashboardOverviewClient() {
  const { user } = useAuthStore();
  const { data: favorites } = useFavorites();
  const { data: listingData } = useQuery({
    queryKey: ["dashboard", "listings", "expired-metric"],
    queryFn: async () => {
      const pageSize = 100;
      let page = 1;
      let archivedCount = 0;
      let totalPages = 1;

      do {
        const res = await getListings({ limit: pageSize, page });
        if (res.error) throw new Error(res.error.message);
        const pageData = res.data;
        if (!pageData) break;

        archivedCount += pageData.items.filter((listing) => listing.status === "archived").length;
        totalPages = pageData.total_pages || 1;
        page += 1;
      } while (page <= totalPages);

      return archivedCount;
    },
  });

  // Backend does not expose an explicit "expired" status; archived listings are the closest stable proxy.
  const expiredListingsCount = listingData ?? 0;

  const stats = [
    { label: "Saved Listings", value: favorites?.length ?? 0, icon: Heart, href: "/dashboard/favorites" },
    { label: "Active Inquiries", value: 0, icon: MessageCircle, href: "/dashboard/inquiries" },
    { label: "Visit Requests", value: 0, icon: Calendar, href: "/dashboard/visits" },
    { label: "Expired Listings", value: expiredListingsCount, icon: Clock3, href: "/dashboard/favorites" },
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
        <p className="mt-1 text-sm text-muted-foreground">Browse thousands of verified apartments across Kathmandu.</p>
        <Link href="/apartments" className="btn-primary mt-4 inline-flex">Browse Apartments</Link>
      </div>
    </div>
  );
}
