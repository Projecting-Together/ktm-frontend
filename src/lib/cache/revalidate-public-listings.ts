"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { LISTING_PUBLIC_LIST_TAG, listingPublicDetailTag } from "@/lib/cache/listing-tags";

/**
 * Bust Next fetch cache for public listing pages after a mutation.
 * Gated on presence of accessToken cookie (same coarse signal as middleware).
 */
export async function revalidatePublicListingCache(listingId?: string) {
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) return { ok: false as const, reason: "no_session" as const };

  revalidateTag(LISTING_PUBLIC_LIST_TAG);
  if (listingId) {
    revalidateTag(listingPublicDetailTag(listingId));
  }
  return { ok: true as const };
}
