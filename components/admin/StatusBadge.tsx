import { cn } from "@/lib/utils";

export type AdminStatus = "pending" | "approved" | "active" | "inactive" | "rejected" | "draft" | "archived";

const STATUS_STYLES: Record<AdminStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  inactive: "border-slate-200 bg-slate-50 text-slate-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  draft: "border-zinc-200 bg-zinc-50 text-zinc-700",
  archived: "border-gray-200 bg-gray-50 text-gray-700",
};

const STATUS_LABELS: Record<AdminStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  active: "Active",
  inactive: "Inactive",
  rejected: "Rejected",
  draft: "Draft",
  archived: "Archived",
};

interface StatusBadgeProps {
  status: AdminStatus;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className
      )}
    >
      {label ?? STATUS_LABELS[status]}
    </span>
  );
}
