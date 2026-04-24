"use client";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, FileDown, LineChart } from "lucide-react";
import { FilterToolbar } from "@/components/admin/FilterToolbar";
import { StatCard } from "@/components/admin/StatCard";
import { adminService } from "@/lib/admin/service";

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState("last-30-days");
  const [city, setCity] = useState("all-cities");
  const [listingType, setListingType] = useState("all-types");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "analytics", dateRange, city, listingType],
    queryFn: () => adminService.getAnalytics({ dateRange, city, listingType }),
  });

  const stats = useMemo(
    () => {
      const totals =
        data?.reduce(
          (acc, point) => ({
            listings: acc.listings + point.listings,
            transactions: acc.transactions + point.transactions,
            users: acc.users + point.users,
          }),
          { listings: 0, transactions: 0, users: 0 },
        ) ?? { listings: 0, transactions: 0, users: 0 };

      return [
        { label: "Total Listings", value: totals.listings, description: "Listings in selected period and filters" },
        { label: "Total Users", value: totals.users, description: "Users represented in selected analytics slice" },
        { label: "Transactions", value: totals.transactions, description: "Revenue-related activity signal" },
      ];
    },
    [data],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Analytics Overview</h1>
        <p className="text-muted-foreground">Track platform performance with quick segmentation and export options.</p>
      </div>

      <FilterToolbar
        filters={
          <>
            <select
              aria-label="Filter analytics by date range"
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="last-7-days">Last 7 days</option>
              <option value="last-30-days">Last 30 days</option>
              <option value="last-90-days">Last 90 days</option>
            </select>
            <select
              aria-label="Filter analytics by city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="all-cities">All cities</option>
              <option value="kathmandu">Kathmandu</option>
              <option value="lalitpur">Lalitpur</option>
              <option value="bhaktapur">Bhaktapur</option>
            </select>
            <select
              aria-label="Filter analytics by listing type"
              value={listingType}
              onChange={(event) => setListingType(event.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="all-types">All listing types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="room">Room</option>
              <option value="commercial">Commercial</option>
            </select>
          </>
        }
        actions={
          <>
            <button type="button" className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium">
              Export CSV
            </button>
            <button type="button" className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium">
              Export PDF
            </button>
          </>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`analytics-kpi-skeleton-${index}`} className="h-28 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((s) => (
            <StatCard
              key={s.label}
              title={s.label}
              value={s.value?.toLocaleString() ?? "—"}
              description={s.description}
              trend={
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Stable
                </span>
              }
              icon={<LineChart className="h-4 w-4" />}
            />
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Listings Trend</h2>
          <p className="text-3xl font-bold">
            {(data?.reduce((sum, point) => sum + point.listings, 0) ?? 0).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Total listings tracked in selected filters.</p>
        </section>
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Users Trend</h2>
          <p className="text-3xl font-bold">{(data?.reduce((sum, point) => sum + point.users, 0) ?? 0).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Active and newly registered users.</p>
        </section>
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Revenue Trend</h2>
          <p className="text-3xl font-bold">
            {(data?.reduce((sum, point) => sum + point.transactions, 0) ?? 0).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Proxy revenue signal from transaction volume.</p>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Charts and Reports</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/70 p-3 text-sm">
            <p className="font-medium">Listings chart</p>
            <p className="text-muted-foreground">Daily listing growth and moderation throughput.</p>
          </div>
          <div className="rounded-lg border border-border/70 p-3 text-sm">
            <p className="font-medium">Users chart</p>
            <p className="text-muted-foreground">User growth, churn, and engagement signals.</p>
          </div>
          <div className="rounded-lg border border-border/70 p-3 text-sm">
            <p className="font-medium">Revenue chart</p>
            <p className="text-muted-foreground">Payment and monetization trajectory overview.</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <FileDown className="h-4 w-4" />
          Export reports as CSV or PDF using the actions in the toolbar.
        </div>
      </section>
    </div>
  );
}
