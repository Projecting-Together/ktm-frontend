import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BulkActionBarProps {
  selectedCount: number;
  actions?: ReactNode;
  onClear?: () => void;
  className?: string;
}

export function BulkActionBar({ selectedCount, actions, onClear, className }: BulkActionBarProps) {
  if (selectedCount <= 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3", className)}>
      <p className="text-sm font-medium text-foreground">{selectedCount} selected</p>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="ml-auto rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
