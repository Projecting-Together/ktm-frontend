"use client";

import { GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompareSnapshot } from "@/lib/compare/listingToCompareSnapshot";
import { useCompareStore, useIsInCompare } from "@/lib/stores/compareStore";

type Props = {
  snapshot: CompareSnapshot;
  className?: string;
  size?: "sm" | "md";
  /** When true (default), opens the compare drawer after adding a listing. */
  openDrawerOnAdd?: boolean;
  onClick?: (e: React.MouseEvent) => void;
};

export function AddToCompareButton({
  snapshot,
  className,
  size = "sm",
  openDrawerOnAdd = true,
  onClick,
}: Props) {
  const toggle = useCompareStore((s) => s.toggle);
  const openDrawer = useCompareStore((s) => s.openDrawer);
  const inCompare = useIsInCompare(snapshot.id);
  const iconClass = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  const boxClass =
    size === "md" ? "h-9 w-9" : "h-8 w-8";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.(e);
        const wasInCompare = inCompare;
        toggle(snapshot);
        if (!wasInCompare && openDrawerOnAdd) {
          const added = useCompareStore.getState().entries.some((entry) => entry.id === snapshot.id);
          if (added) openDrawer();
        }
      }}
      className={cn(
        "flex items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-accent hover:text-accent",
        inCompare && "border-accent bg-accent/10 text-accent",
        boxClass,
        className,
      )}
      aria-label={inCompare ? "Remove from compare" : "Add to compare"}
      aria-pressed={inCompare}
    >
      <GitCompare className={cn(iconClass, inCompare && "text-accent")} />
    </button>
  );
}
