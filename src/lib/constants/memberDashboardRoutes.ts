/**
 * Member dashboard (`/dashboard`) route map — single hub for renter activity + owner/listing tools.
 *
 * Legacy `/manage/**` URLs redirect here (see `next.config.ts` `redirects`). Do not link to `/manage` in UI.
 *
 * | Former path              | Canonical path                          |
 * |--------------------------|-----------------------------------------|
 * | /manage                  | /dashboard                              |
 * | /manage/listings         | /dashboard/listings                     |
 * | /manage/listings/new     | /dashboard/listings/new                 |
 * | /manage/listings/:id/edit| /dashboard/listings/:id/edit            |
 * | /manage/inquiries        | /dashboard/leads/inquiries (received)   |
 * | /manage/visits           | /dashboard/leads/visits (received)      |
 * | /manage/news             | /dashboard/news                         |
 * | /manage/analytics        | /dashboard/analytics                    |
 *
 * Renter-scoped pages (unchanged): `/dashboard/inquiries` (messages you sent), `/dashboard/visits` (your scheduled visits).
 */

export const DASHBOARD_LISTINGS_NEW_PATH = "/dashboard/listings/new" as const;

/** Map post-login `next` values from legacy `/manage` to `/dashboard` equivalents (preserves query string). */
export function mapLegacyManageNextPath(nextPath: string | null | undefined): string | undefined {
  if (!nextPath || !nextPath.startsWith("/")) return undefined;
  if (!nextPath.startsWith("/manage")) return nextPath;

  let pathname = nextPath;
  let search = "";
  const q = nextPath.indexOf("?");
  if (q !== -1) {
    pathname = nextPath.slice(0, q);
    search = nextPath.slice(q);
  }

  if (pathname === "/manage") return `/dashboard${search}`;
  if (pathname === "/manage/inquiries") return `/dashboard/leads/inquiries${search}`;
  if (pathname === "/manage/visits") return `/dashboard/leads/visits${search}`;

  if (pathname.startsWith("/manage/")) {
    return `/dashboard${pathname.slice("/manage".length)}${search}`;
  }
  return `/dashboard${search}`;
}

/** Resolve safe post-login path from `?next=` (maps legacy `/manage` URLs). */
export function resolvePostLoginRedirect(searchNext: string | null): string {
  if (!searchNext || !searchNext.startsWith("/")) return "/dashboard";
  return mapLegacyManageNextPath(searchNext) ?? searchNext;
}
