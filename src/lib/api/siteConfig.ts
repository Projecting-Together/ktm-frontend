import type { SiteConfig } from "./types";
import { API_BASE, SITE_CONFIG_TIMEOUT_MS } from "@/shared/appConfig";

function normalizeSiteConfig(raw: Record<string, unknown>): SiteConfig {
  const hero = raw.heroBannerUrl ?? raw.hero_banner_url;
  const cta = raw.ctaBannerUrl ?? raw.cta_banner_url;
  return {
    heroBannerUrl: typeof hero === "string" ? hero : hero == null ? null : String(hero),
    ctaBannerUrl: typeof cta === "string" ? cta : cta == null ? null : String(cta),
  };
}

/** Public GET `…/api/v1/site-config`. Returns `null` if missing or error (caller uses env/static fallback). */
export async function fetchSiteConfig(signal?: AbortSignal): Promise<SiteConfig | null> {
  const timeout = AbortSignal.timeout(SITE_CONFIG_TIMEOUT_MS);
  const merged = signal ? AbortSignal.any([signal, timeout]) : timeout;
  try {
    const res = await fetch(`${API_BASE}/site-config`, {
      method: "GET",
      credentials: "omit",
      signal: merged,
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as Record<string, unknown>;
    return normalizeSiteConfig(raw);
  } catch {
    return null;
  }
}
