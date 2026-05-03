"use client";
import Link from "next/link";
import { Heart, MessageCircle, Calendar, Eye, Clock3, Building2, BarChart2, Plus } from "lucide-react";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useAuthStore } from "@/lib/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { getMyListings } from "@/lib/api/client";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/ListingCard";

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

  const { data: ownerListings, isLoading: ownerListingsLoading } = useQuery({
    queryKey: ["dashboard", "owner-listings", "overview-preview"],
    queryFn: async () => {
      const res = await getMyListings({ skip: 0, limit: 6 });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
  });

  const expiredListingsCount = expiredTotal ?? 0;

  const activityStats = [
    { label: "Saved listings", value: favorites?.length ?? 0, icon: Heart, href: "/dashboard/favorites" },
    { label: "Active inquiries", value: 0, icon: MessageCircle, href: "/dashboard/inquiries" },
    { label: "My visits", value: 0, icon: Calendar, href: "/dashboard/visits" },
    { label: "Expired listings", value: expiredListingsCount, icon: Clock3, href: "/dashboard/listings?status=archived" },
    { label: "Recently viewed", value: 0, icon: Eye, href: "/dashboard/recently-viewed" },
  ];

  const ownerStats = [
    { label: "Total listings", value: String(ownerListings?.total ?? 0), icon: Building2, href: "/dashboard/listings" },
    { label: "Lead inbox", value: "0", icon: MessageCircle, href: "/dashboard/leads/inquiries" },
    { label: "Visit requests", value: "0", icon: Calendar, href: "/dashboard/leads/visits" },
    { label: "Analytics", value: "—", icon: BarChart2, href: "/dashboard/analytics" },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back{user?.profile?.first_name ? `, ${user.profile.first_name}` : ""}!
          </h1>
          <p className="mt-1 text-muted-foreground">Your rental activity and listing tools in one place.</p>
        </div>
        <Link href="/dashboard/listings/new" className="btn-primary inline-flex shrink-0 gap-1.5 self-start">
          <Plus className="h-4 w-4" /> New listing
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Activity</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {activityStats.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.label}
                href={s.href}
                className="rounded-xl border border-border bg-card p-5 transition-all hover:border-accent hover:shadow-sm"
              >
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
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Listings & leads</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {ownerStats.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.label}
                href={s.href}
                className="rounded-xl border border-border bg-card p-5 transition-all hover:border-accent hover:shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 mb-3">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent listings</h2>
          <Link href="/dashboard/listings" className="text-sm text-accent hover:underline">
            View all
          </Link>
        </div>
        {ownerListingsLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        ) : ownerListings?.items?.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ownerListings.items.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold">No listings yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first listing to start receiving inquiries.</p>
            <Link href="/dashboard/listings/new" className="btn-primary mt-4 inline-flex gap-1.5">
              <Plus className="h-4 w-4" /> Create listing
            </Link>
          </div>
        )}
      </section>

      <div className="mt-10 rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-4xl mb-3">🏠</p>
        <h3 className="font-semibold">Start your search</h3>
        <p className="mt-1 text-sm text-muted-foreground">Browse thousands of verified listings across Kathmandu.</p>
        <Link href="/listings" className="btn-primary mt-4 inline-flex">
          Browse listings
        </Link>
      </div>
    </div>
  );
}
