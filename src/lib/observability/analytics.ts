import type { ListingPurpose } from "@/lib/api/types";

type EventPayload = Record<string, string | number | boolean | null | undefined>;

/** GA-style labels: maps API `ListingPurpose` `sale` to `buy` in payloads. */
type PurposeMode = "rent" | "buy";

function toPurposeMode(purpose: ListingPurpose): PurposeMode {
  return purpose === "sale" ? "buy" : "rent";
}

interface GtagLike {
  (command: "event", eventName: string, params?: EventPayload): void;
  (command: "config", targetId: string, params?: EventPayload): void;
  (command: "js", date: Date): void;
}

function emitEvent(name: string, payload: EventPayload): void {
  if (typeof window === "undefined") return;

  const maybeGtag = (window as Window & { gtag?: GtagLike }).gtag;
  if (typeof maybeGtag === "function") {
    maybeGtag("event", name, payload);
    return;
  }

  window.dispatchEvent(
    new CustomEvent("ktm-telemetry", {
      detail: { event: name, payload },
    }),
  );
}

// ─── Page views ───────────────────────────────────────────────────────────────

export function trackPageView(path: string): void {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) return;

  const maybeGtag = (window as Window & { gtag?: GtagLike }).gtag;
  if (typeof maybeGtag === "function") {
    maybeGtag("config", measurementId, { page_path: path });
  } else {
    window.dispatchEvent(
      new CustomEvent("ktm-telemetry", {
        detail: { event: "page_view", payload: { page_path: path } },
      }),
    );
  }
}

// ─── Listing events ───────────────────────────────────────────────────────────

export interface ListingViewedInput {
  listingId: string;
  purpose: ListingPurpose;
  source?: string;
}

export function trackListingViewed(input: ListingViewedInput): void {
  emitEvent("listing_viewed", {
    listing_id: input.listingId,
    purpose: input.purpose,
    mode: toPurposeMode(input.purpose),
    source: input.source,
  });
}

export interface ListingPostCompletedInput {
  listingId?: string;
  purpose: ListingPurpose;
  source?: string;
}

export function trackListingPostCompleted(input: ListingPostCompletedInput): void {
  emitEvent("listing_post_completed", {
    listing_id: input.listingId,
    purpose: input.purpose,
    mode: toPurposeMode(input.purpose),
    source: input.source,
  });
}

// ─── Search / filter events ───────────────────────────────────────────────────

export interface SearchPerformedInput {
  query?: string;
  city?: string;
  purpose?: ListingPurpose;
  resultCount?: number;
  source?: string;
}

export function trackSearchPerformed(input: SearchPerformedInput): void {
  emitEvent("search_performed", {
    query: input.query,
    city: input.city,
    purpose: input.purpose,
    mode: input.purpose ? toPurposeMode(input.purpose) : undefined,
    result_count: input.resultCount,
    source: input.source,
  });
}

export interface PurposeModeChangeInput {
  nextPurpose: ListingPurpose;
  previousPurpose?: ListingPurpose;
  source?: string;
}

export function trackPurposeModeChange(input: PurposeModeChangeInput): void {
  emitEvent("purpose_mode_change", {
    purpose: input.nextPurpose,
    mode: toPurposeMode(input.nextPurpose),
    previous_purpose: input.previousPurpose,
    previous_mode: input.previousPurpose ? toPurposeMode(input.previousPurpose) : undefined,
    source: input.source,
  });
}

// ─── Inquiry events ───────────────────────────────────────────────────────────

export interface InquirySentInput {
  listingId: string;
  purpose: ListingPurpose;
  source?: string;
}

export function trackInquirySent(input: InquirySentInput): void {
  emitEvent("inquiry_sent", {
    listing_id: input.listingId,
    purpose: input.purpose,
    mode: toPurposeMode(input.purpose),
    source: input.source,
  });
}

export interface InquiryCtaClickInput {
  listingId: string;
  purpose: ListingPurpose;
  source?: string;
}

export function trackInquiryCtaClick(input: InquiryCtaClickInput): void {
  emitEvent("inquiry_cta_click", {
    listing_id: input.listingId,
    purpose: input.purpose,
    mode: toPurposeMode(input.purpose),
    source: input.source,
  });
}

// ─── Compare events ───────────────────────────────────────────────────────────

export interface CompareStartedInput {
  listingIds: string[];
  source?: string;
}

export function trackCompareStarted(input: CompareStartedInput): void {
  emitEvent("compare_started", {
    listing_count: input.listingIds.length,
    listing_ids: input.listingIds.join(","),
    source: input.source,
  });
}

// ─── Auth events ──────────────────────────────────────────────────────────────

export interface AuthEventInput {
  method?: string;
}

export function trackAuthLogin(input: AuthEventInput = {}): void {
  emitEvent("auth_login", { method: input.method ?? "email" });
}

export function trackAuthLogout(): void {
  emitEvent("auth_logout", {});
}

// ─── Error events ─────────────────────────────────────────────────────────────

export interface ClientErrorInput {
  message: string;
  source?: string;
  digest?: string;
}

export function trackClientError(input: ClientErrorInput): void {
  emitEvent("client_error", {
    error_message: input.message,
    source: input.source,
    digest: input.digest,
  });
}
