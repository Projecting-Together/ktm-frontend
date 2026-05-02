/** Env-backed API origin + path prefix. Same fallback as legacy inline definitions. */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.ktmapartments.com/api/v1";

/** Abort slow/hung requests so the UI does not stay on “Searching…” forever. */
export const API_FETCH_TIMEOUT_MS = 25_000;

/** Public GET `/site-config` uses a shorter timeout than generic API calls. */
export const SITE_CONFIG_TIMEOUT_MS = 8_000;
