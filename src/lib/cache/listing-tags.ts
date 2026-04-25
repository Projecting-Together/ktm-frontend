/** Single tag for all public listing *list* fetches (home featured + any server-side list). */
export const LISTING_PUBLIC_LIST_TAG = "listings:public";

/** Detail pages — pass URL param as stored (id or slug). */
export function listingPublicDetailTag(slugOrId: string): string {
  return `listings:detail:${slugOrId}`;
}
