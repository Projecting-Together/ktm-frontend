import type { RentStatusRow } from "./types";

import { cn } from "@/lib/utils";

interface RentStatusChipsProps {
  rows: RentStatusRow[];
  className?: string;
}

const toneClasses: Record<RentStatusRow["tone"], string> = {
  positive: "border-verified/30 bg-verified/10 text-verified",
  neutral: "border-border bg-muted/40 text-muted-foreground",
  warning: "border-warning/30 bg-warning/10 text-warning",
};

export function RentStatusChips({ rows, className }: RentStatusChipsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {rows.map((row) => (
        <div
          key={row.label}
          data-testid={`rent-status-chip-${row.label}`}
          className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium", toneClasses[row.tone])}
        >
          <span>{row.label}</span>
          <span className="text-foreground/80">-</span>
          <span>{row.status}</span>
        </div>
      ))}
    </div>
  );
}
