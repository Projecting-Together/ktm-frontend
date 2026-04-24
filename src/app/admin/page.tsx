"use client";
import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { adminService } from "@/lib/admin/service";

const KPI_NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const ACTIVITY_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export default function AdminPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "dashboard-summary"],
    queryFn: () => adminService.getDashboardSummary(),
  });

  const kpis = data?.kpis ?? [];
  const activities = data?.activities ?? [];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-1">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor key platform signals at a glance.</p>
      </section>

      {isError ? (
        <section className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
          <h2 className="font-semibold">Dashboard data unavailable</h2>
          <p className="text-sm">Unable to load summary right now. Please try again.</p>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }, (_, index) => (
              <div key={`kpi-skeleton-${index}`} className="rounded-xl border border-border bg-card p-4 shadow-sm animate-pulse">
                <div className="mb-3 h-3 w-24 rounded bg-muted" />
                <div className="mb-2 h-8 w-16 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
            ))
          : kpis.map((kpi) => (
              <StatCard
                key={kpi.key}
                title={kpi.label}
                value={KPI_NUMBER_FORMATTER.format(kpi.value)}
                description="vs last period"
                trend={
                  <span className={kpi.deltaPercent >= 0 ? "text-emerald-600" : "text-rose-600"}>
                    {kpi.deltaPercent >= 0 ? "+" : ""}
                    {kpi.deltaPercent.toFixed(1)}%
                  </span>
                }
                icon={
                  kpi.deltaPercent >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-rose-600" />
                  )
                }
              />
            ))}
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {isLoading ? (
            <div className="rounded-lg border border-border/60 p-3 animate-pulse">
              <div className="mb-2 h-4 w-48 rounded bg-muted" />
              <div className="h-3 w-64 rounded bg-muted" />
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <Activity className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.actor} • {ACTIVITY_TIME_FORMATTER.format(new Date(activity.createdAt))}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
