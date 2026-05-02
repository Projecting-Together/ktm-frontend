import type { ListingPurpose } from "@/lib/api/types";

/** GA-style labels: maps API `ListingPurpose` `sale` to `buy` in payloads. */
const PURPOSE_MODE_VALUES = ["rent", "buy"] as const;
type PurposeMode = (typeof PURPOSE_MODE_VALUES)[number];

type TelemetryPayload = Record<string, string | number | boolean | null | undefined>;

interface TelemetryEvent<TPayload extends TelemetryPayload> {
  event: "purpose_mode_change" | "inquiry_sent" | "inquiry_cta_click" | "listing_post_completed";
  payload: TPayload;
}

interface PurposeModeChangeInput {
  nextPurpose: ListingPurpose;
  previousPurpose?: ListingPurpose;
  source?: string;
}

interface InquirySentInput {
  listingId: string;
  purpose: ListingPurpose;
  source?: string;
}

interface InquiryCtaClickInput {
  listingId: string;
  purpose: ListingPurpose;
  source?: string;
}

interface ListingPostCompletedInput {
  listingId?: string;
  purpose: ListingPurpose;
  source?: string;
}

interface GtagLike {
  (command: "event", eventName: string, params?: TelemetryPayload): void;
}

function toPurposeMode(purpose: ListingPurpose): PurposeMode {
  return purpose === "sale" ? "buy" : "rent";
}

function emitTelemetry(eventName: string, payload: TelemetryPayload): void {
  if (typeof window === "undefined") return;

  const maybeGtag = (window as Window & { gtag?: GtagLike }).gtag;
  if (typeof maybeGtag === "function") {
    maybeGtag("event", eventName, payload);
    return;
  }

  window.dispatchEvent(
    new CustomEvent("ktm-telemetry", {
      detail: { event: eventName, payload },
    }),
  );
}

export function buildPurposeModeChangeEvent(
  input: PurposeModeChangeInput,
): TelemetryEvent<{
  purpose: ListingPurpose;
  mode: PurposeMode;
  previous_purpose?: ListingPurpose;
  previous_mode?: PurposeMode;
  source?: string;
}> {
  return {
    event: "purpose_mode_change",
    payload: {
      purpose: input.nextPurpose,
      mode: toPurposeMode(input.nextPurpose),
      previous_purpose: input.previousPurpose,
      previous_mode: input.previousPurpose ? toPurposeMode(input.previousPurpose) : undefined,
      source: input.source,
    },
  };
}

export function buildInquirySentEvent(
  input: InquirySentInput,
): TelemetryEvent<{
  listing_id: string;
  purpose: ListingPurpose;
  mode: PurposeMode;
  source?: string;
}> {
  return {
    event: "inquiry_sent",
    payload: {
      listing_id: input.listingId,
      purpose: input.purpose,
      mode: toPurposeMode(input.purpose),
      source: input.source,
    },
  };
}

export function buildInquiryCtaClickEvent(
  input: InquiryCtaClickInput,
): TelemetryEvent<{
  listing_id: string;
  purpose: ListingPurpose;
  mode: PurposeMode;
  source?: string;
}> {
  return {
    event: "inquiry_cta_click",
    payload: {
      listing_id: input.listingId,
      purpose: input.purpose,
      mode: toPurposeMode(input.purpose),
      source: input.source,
    },
  };
}

export function buildListingPostCompletedEvent(
  input: ListingPostCompletedInput,
): TelemetryEvent<{
  listing_id?: string;
  purpose: ListingPurpose;
  mode: PurposeMode;
  source?: string;
}> {
  return {
    event: "listing_post_completed",
    payload: {
      listing_id: input.listingId,
      purpose: input.purpose,
      mode: toPurposeMode(input.purpose),
      source: input.source,
    },
  };
}

export function trackPurposeModeChange(input: PurposeModeChangeInput): void {
  const { event, payload } = buildPurposeModeChangeEvent(input);
  emitTelemetry(event, payload);
}

export function trackInquirySent(input: InquirySentInput): void {
  const { event, payload } = buildInquirySentEvent(input);
  emitTelemetry(event, payload);
}

export function trackInquiryCtaClick(input: InquiryCtaClickInput): void {
  const { event, payload } = buildInquiryCtaClickEvent(input);
  emitTelemetry(event, payload);
}

export function trackListingPostCompleted(input: ListingPostCompletedInput): void {
  const { event, payload } = buildListingPostCompletedEvent(input);
  emitTelemetry(event, payload);
}
