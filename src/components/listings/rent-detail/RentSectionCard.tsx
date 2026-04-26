import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface RentSectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function RentSectionCard({ title, children, className }: RentSectionCardProps) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-4 sm:p-5", className)}>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}
