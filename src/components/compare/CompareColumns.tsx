"use client";

import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import type { CompareSnapshot } from "@/lib/compare/listingToCompareSnapshot";
import { formatListingPrice, cn } from "@/lib/utils";

type Props = {
  entries: CompareSnapshot[];
  onRemove: (id: string) => void;
  compact?: boolean;
};

function formatPurpose(purpose: CompareSnapshot["purpose"]): string {
  if (!purpose) return "—";
  if (purpose === "rent") return "Rent";
  if (purpose === "sale") return "Sale";
  return String(purpose);
}

function cellValue(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

type RowDef = { label: string; value: (item: CompareSnapshot) => string };

export function CompareColumns({ entries, onRemove, compact }: Props) {
  if (entries.length === 0) return null;

  const rows: RowDef[] = [
    {
      label: "Price",
      value: (item) => formatListingPrice(item),
    },
    { label: "Listing type", value: (item) => formatPurpose(item.purpose) },
    {
      label: "Bedrooms",
      value: (item) => (item.bedrooms != null ? String(item.bedrooms) : "—"),
    },
    {
      label: "Bathrooms",
      value: (item) => (item.bathrooms != null ? String(item.bathrooms) : "—"),
    },
    {
      label: "Floor area",
      value: (item) => (item.area_m2 != null ? `${item.area_m2} m²` : "—"),
    },
  ];

  const cellPad = compact ? "px-2 py-1.5" : "px-3 py-2";
  const labelCol = compact ? "w-[min(7rem,28vw)]" : "w-36";
  const listingCol = compact ? "min-w-[128px]" : "min-w-[160px]";

  return (
    <div className="space-y-4">
      <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>
        Side-by-side facts for the listings you selected. Remove a column or add more from search or a listing page (up to five).
      </p>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[min(100%,520px)] border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th
                scope="col"
                className={cn(
                  "sticky left-0 z-20 border-r border-border bg-muted/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                  labelCol,
                )}
              >
                Listing
              </th>
              {entries.map((item) => (
                <th
                  key={item.id}
                  scope="col"
                  className={cn("relative align-top", listingCol, compact ? "p-2" : "p-3")}
                >
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/95 text-muted-foreground shadow-sm hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Remove ${item.title} from compare`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div
                    className={cn(
                      "relative mx-auto mb-2 overflow-hidden rounded-lg bg-muted",
                      compact ? "aspect-[5/4] w-full max-w-[120px]" : "aspect-[5/4] w-full max-w-[140px]",
                    )}
                  >
                    {item.cover_url ? (
                      <Image src={item.cover_url} alt="" fill className="object-cover" sizes="140px" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">No photo</div>
                    )}
                  </div>
                  <Link
                    href={`/listings/${item.slug}`}
                    className={cn(
                      "line-clamp-2 font-medium text-foreground hover:text-accent",
                      compact ? "text-xs leading-snug" : "text-sm",
                    )}
                  >
                    {item.title}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-b-0">
                <th
                  scope="row"
                  className={cn(
                    "sticky left-0 z-10 border-r border-border bg-background font-medium text-muted-foreground",
                    cellPad,
                    labelCol,
                    compact ? "text-xs" : "text-sm",
                  )}
                >
                  {row.label}
                </th>
                {entries.map((item) => (
                  <td
                    key={`${row.label}-${item.id}`}
                    className={cn(
                      "border-l border-border/60 bg-card align-top text-foreground first:border-l-0",
                      cellPad,
                      compact ? "text-xs" : "text-sm",
                    )}
                  >
                    {cellValue(row.value(item))}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th
                scope="row"
                className={cn(
                  "sticky left-0 z-10 border-r border-border bg-background font-medium text-muted-foreground",
                  cellPad,
                  labelCol,
                  compact ? "text-xs" : "text-sm",
                )}
              >
                Details
              </th>
              {entries.map((item) => (
                <td key={`link-${item.id}`} className={cn(cellPad, "align-top")}>
                  <Link
                    href={`/listings/${item.slug}`}
                    className={cn(
                      "font-medium text-accent underline-offset-4 hover:underline",
                      compact ? "text-xs" : "text-sm",
                    )}
                  >
                    Full listing
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
