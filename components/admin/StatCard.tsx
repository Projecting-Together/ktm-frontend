import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: ReactNode;
  description?: ReactNode;
  trend?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ title, value, description, trend, icon, className }: StatCardProps) {
  return (
    <section className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
        </div>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </div>
      {(description || trend) && (
        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">{description}</span>
          {trend ? <span className="font-medium text-foreground">{trend}</span> : null}
        </div>
      )}
    </section>
  );
}
