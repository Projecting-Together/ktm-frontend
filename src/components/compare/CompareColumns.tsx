"use client";

import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import type { CompareSnapshot } from "@/lib/compare/listingToCompareSnapshot";
import { formatPrice, cn } from "@/lib/utils";

type Props = {
  entries: CompareSnapshot[];
  onRemove: (id: string) => void;
  compact?: boolean;
};

export function CompareColumns({ entries, onRemove, compact }: Props) {
  if (entries.length === 0) return null;

  return (
    <div
      className={cn(
        "flex gap-3 overflow-x-auto pb-2 pt-1",
        compact ? "max-h-[70vh]" : "",
      )}
    >
      {entries.map((item) => (
        <article
          key={item.id}
          className={cn(
            "relative flex min-w-[148px] max-w-[180px] shrink-0 flex-col rounded-xl border border-border bg-card shadow-sm",
            compact ? "text-xs" : "text-sm",
          )}
        >
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Remove ${item.title} from compare`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className={cn("relative w-full overflow-hidden rounded-t-xl bg-muted", compact ? "aspect-[4/3]" : "aspect-[5/4]")}>
            {item.cover_url ? (
              <Image
                src={item.cover_url}
                alt=""
                fill
                className="object-cover"
                sizes="180px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">No photo</div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1 p-2.5">
            <Link
              href={`/listings/${item.slug}`}
              className="line-clamp-2 font-medium leading-snug text-foreground hover:text-accent"
            >
              {item.title}
            </Link>
            <p className="font-semibold text-accent">
              {formatPrice(item.price, item.currency, item.price_period ?? undefined)}
            </p>
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
              {item.bedrooms != null && <span>{item.bedrooms} bd</span>}
              {item.bathrooms != null && <span>{item.bathrooms} ba</span>}
              {item.area_m2 != null && <span>{item.area_m2} m²</span>}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
