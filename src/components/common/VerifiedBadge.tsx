import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
  ariaLabel?: string;
}

export function VerifiedBadge({ size = "md", className, showLabel = true, ariaLabel }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "gap-0.5 px-1.5 py-0.5 text-[10px]",
    md: "gap-1 px-2 py-0.5 text-xs",
    lg: "gap-1.5 px-3 py-1 text-sm",
  };

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <span
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center rounded-full bg-verified/15 font-semibold text-verified",
        sizeClasses[size],
        className
      )}
    >
      <ShieldCheck className={cn("shrink-0", iconSizes[size])} />
      {showLabel && <span>Verified</span>}
    </span>
  );
}
