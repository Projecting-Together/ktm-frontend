"use client";

import { GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompareSnapshot } from "@/lib/compare/listingToCompareSnapshot";
import { useCompareStore, useIsInCompare } from "@/lib/stores/compareStore";

type Props = {
  snapshot: CompareSnapshot;
  className?: string;
  size?: "sm" | "md";
  onClick?: (e: React.MouseEvent) => void;
};

export function AddToCompareButton({ snapshot, className, size = "sm", onClick }: Props) {
  const toggle = useCompareStore((s) => s.toggle);
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
        toggle(snapshot);
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
