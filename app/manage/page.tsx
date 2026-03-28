"use client";
import Link from "next/link";
import { Building2, MessageCircle, Calendar, BarChart2, Plus, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getListings } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/authStore";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/ListingCard";

export default function ManagePage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ["manage", "listings"],
    queryFn: async () => {
      const res = await getListings({ limit: 6 });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
  });

  const stats = [
    { label: "Total Listings", value: data?.total ?? 0, icon: Building2, href: "/manage/listings" },
    { label: "Pending Inquiries", value: 0, icon: MessageCircle, href: "/manage/inquiries" },
    { label: "Visit Requests", value: 0, icon: Calendar, href: "/manage/visits" },
    { label: "Total Views", value: 0, icon: Eye, href: "/manage/analytics" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your property listings and inquiries.</p>
        </div>
        <Link href="/manage/listings/new" className="btn-primary gap-1.5">
          <Plus className="h-4 w-4" /> New Listing
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}
              className="rounded-xl border border-border bg-card p-5 transition-all hover:border-accent hover:shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 mb-3">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </Link>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Listings</h2>
          <Link href="/manage/listings" className="text-sm text-accent hover:underline">View all</Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({length:3}).map((_,i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : data?.items?.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold">No listings yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first listing to start receiving inquiries.</p>
            <Link href="/manage/listings/new" className="btn-primary mt-4 inline-flex gap-1.5">
              <Plus className="h-4 w-4" /> Create Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
