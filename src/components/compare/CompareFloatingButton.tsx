"use client";

import { GitCompare } from "lucide-react";
import { useCompareStore } from "@/lib/stores/compareStore";

export function CompareFloatingButton() {
  const count = useCompareStore((s) => s.entries.length);
  const openDrawer = useCompareStore((s) => s.openDrawer);

  if (count < 1) return null;

  return (
    <button
      type="button"
      onClick={() => openDrawer()}
      className="fixed bottom-24 right-4 z-[90] flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium shadow-lg transition-colors hover:border-accent hover:bg-accent/10 md:bottom-6 md:right-6"
      aria-label={`Open compare (${count})`}
    >
      <GitCompare className="h-4 w-4 text-accent" aria-hidden />
      <span>Compare</span>
      <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-accent-foreground">
        {count}
      </span>
    </button>
  );
}
