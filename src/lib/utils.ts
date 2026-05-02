import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ListingListItem, Listing, ListingStatus } from "@/lib/api/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number | null | undefined, currency = "NPR", period?: string | null): string {
  if (price === null || price === undefined) return "Price on request";
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "Price on request";
  const formatted = new Intl.NumberFormat("en-NP", { maximumFractionDigits: 0 }).format(num);
  const suffix = period ? `/${period}` : "";
  return `${currency} ${formatted}${suffix}`;
}

export function formatNPR(amount: number): string {
  return new Intl.NumberFormat("en-NP", { maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("en-NP", { year: "numeric", month: "short", day: "numeric" }).format(new Date(dateStr));
  } catch { return dateStr; }
}

export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

/** Cover URL for a listing, or `null` if there are no images (use `ListingCoverImage` fallback). */
export function getListingCoverImage(listing: Pick<ListingListItem | Listing, "images">): string | null {
  const imgs = listing.images;
  if (!imgs?.length) return null;
  const cover = imgs.find((img) => img.is_cover || img.is_primary);
  return (
    cover?.webp_url ??
    cover?.image_url ??
    imgs[0]?.webp_url ??
    imgs[0]?.image_url ??
    null
  );
}

export function getListingLocation(listing: Pick<ListingListItem, "location">): string {
  const loc = listing.location;
  if (!loc) return "Kathmandu";
  const parts = [loc.locality?.name, loc.city].filter(Boolean);
  return parts.join(", ") || "Kathmandu";
}

export function formatBedBath(bedrooms: number | null | undefined, bathrooms: number | string | null | undefined): string {
  const bed = bedrooms != null ? `${bedrooms} bed` : null;
  const bath = bathrooms != null ? `${bathrooms} bath` : null;
  return [bed, bath].filter(Boolean).join(" · ") || "Studio";
}

export function buildSearchUrl(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(filters)) {
    if (val === undefined || val === null || val === "") continue;
    if (Array.isArray(val)) val.forEach((v) => params.append(key, String(v)));
    else params.set(key, String(val));
  }
  const qs = params.toString();
  return qs ? `/listings?${qs}` : "/listings";
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, "");
  const intl = clean.startsWith("977") ? clean : `977${clean}`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}

const LISTING_STATUS_TAILWIND: Record<ListingStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  pending_payment: "bg-amber-100 text-amber-800",
  draft: "bg-gray-100 text-gray-600",
  rented: "bg-blue-100 text-blue-700",
  sold: "bg-purple-100 text-purple-700",
  rejected: "bg-red-100 text-red-700",
  archived: "bg-gray-100 text-gray-500",
  expired: "bg-gray-100 text-gray-500",
};

/** Legacy / UI-only status strings not in API `ListingStatus`. */
const EXTRA_STATUS_TAILWIND: Record<string, string> = {
  deactivated: "bg-slate-100 text-slate-600",
  inactive: "bg-gray-100 text-gray-600",
};

export function getStatusColor(status: string): string {
  if (Object.prototype.hasOwnProperty.call(LISTING_STATUS_TAILWIND, status)) {
    return LISTING_STATUS_TAILWIND[status as ListingStatus];
  }
  return EXTRA_STATUS_TAILWIND[status] ?? "bg-gray-100 text-gray-600";
}

const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  pending_payment: "Pending payment",
  active: "Active",
  expired: "Expired",
  rented: "Rented",
  sold: "Sold",
  draft: "Draft",
  pending: "Pending",
  archived: "Archived",
  rejected: "Rejected",
};

const EXTRA_STATUS_LABELS: Record<string, string> = {
  deactivated: "Deactivated",
  inactive: "Inactive",
};

/** Human-readable label for API listing status (includes backend lifecycle values). */
export function formatListingStatusLabel(status: string): string {
  if (Object.prototype.hasOwnProperty.call(LISTING_STATUS_LABELS, status)) {
    return LISTING_STATUS_LABELS[status as ListingStatus];
  }
  if (EXTRA_STATUS_LABELS[status]) return EXTRA_STATUS_LABELS[status];
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
}
