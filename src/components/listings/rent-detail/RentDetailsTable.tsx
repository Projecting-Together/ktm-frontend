import type { RentDetailRow } from "./types";

import { cn } from "@/lib/utils";

interface RentDetailsTableProps {
  rows: RentDetailRow[];
  className?: string;
}

export function RentDetailsTable({ rows, className }: RentDetailsTableProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {rows.map((row) => (
        <div
          key={row.key}
          data-testid="rent-detail-row"
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 rounded-lg border border-border/70 px-3 py-2 text-sm"
        >
          <span className="text-muted-foreground">{row.key}</span>
          <span className="text-right font-medium text-foreground">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
