import { cn } from "@/lib/utils";

interface ModeratedBadgeProps {
  /** Overlay chip on cards uses `sm`; detail gallery uses `md`. */
  size?: "sm" | "md";
  className?: string;
}

export function ModeratedBadge({ size = "sm", className }: ModeratedBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      role="status"
      aria-label="Moderated listing"
      className={cn(
        "inline-flex items-center rounded-full bg-card/85 font-semibold uppercase tracking-wide text-foreground backdrop-blur-sm",
        sizeClasses[size],
        className,
      )}
    >
      Moderated
    </span>
  );
}
