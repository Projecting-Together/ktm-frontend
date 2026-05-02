"use client";

import Link from "next/link";
import { GitCompare } from "lucide-react";
import { CompareColumns } from "@/components/compare/CompareColumns";
import { useCompareStore } from "@/lib/stores/compareStore";

export default function ComparePage() {
  const entries = useCompareStore((s) => s.entries);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);

  if (entries.length === 0) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold">Compare properties</h1>
        <p className="mt-1 text-muted-foreground">Select up to five listings to compare side by side.</p>
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <GitCompare className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <h2 className="font-semibold">No listings to compare yet</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Use <strong className="text-foreground">Add to compare</strong> on search results or a property page, then open the compare drawer or come back here.
          </p>
          <Link href="/listings" className="btn-primary mt-6">
            Browse listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compare properties</h1>
          <p className="mt-1 text-muted-foreground">
            {entries.length} of 5 listings · Drag insight: prices and key facts update from when you added each listing.
          </p>
          {entries.length === 1 ? (
            <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
              Add at least one more listing for a side-by-side comparison.
            </p>
          ) : null}
        </div>
        <button type="button" onClick={() => clear()} className="btn-secondary self-start text-sm">
          Clear all
        </button>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card p-4 shadow-sm">
        <CompareColumns entries={entries} onRemove={remove} />
      </div>
    </div>
  );
}
