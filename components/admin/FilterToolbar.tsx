import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FilterToolbarProps {
  search?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function FilterToolbar({ search, filters, actions, className }: FilterToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-3 md:flex-row md:items-center", className)}>
      <div className="min-w-0 flex-1">{search}</div>
      {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
      {actions ? <div className="flex items-center gap-2 md:ml-auto">{actions}</div> : null}
    </div>
  );
}
