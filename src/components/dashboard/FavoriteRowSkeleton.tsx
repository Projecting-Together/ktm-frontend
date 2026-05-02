/**
 * Row-shaped placeholder matching the dashboard favorites list item layout
 * (56×56 thumb + title + meta line).
 */
export function FavoriteRowSkeleton() {
  return (
    <div
      className="flex animate-pulse items-center gap-3 rounded-lg border border-border bg-card p-3"
      aria-hidden
    >
      <div className="h-14 w-14 shrink-0 rounded-md bg-muted" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 max-w-[14rem] rounded bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </div>
    </div>
  );
}
