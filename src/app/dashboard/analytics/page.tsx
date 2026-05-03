"use client";
import { BarChart2 } from "lucide-react";

export default function DashboardAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Analytics</h1>
      <p className="text-muted-foreground mb-2">
        Understand how your listings perform: traffic, saves, and leads over time. Numbers reflect real activity when your
        backend feeds them; until then this area stays in preview.
      </p>
      <p className="text-muted-foreground mb-6 text-sm">
        Data freshness depends on event ingestion — treat charts as directional, not accounting-grade, until we publish a
        SLA.
      </p>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <BarChart2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="font-semibold">Analytics coming soon</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Detailed view counts, inquiry rates, and conversion metrics will appear here as the pipeline goes live.
        </p>
      </div>
    </div>
  );
}
