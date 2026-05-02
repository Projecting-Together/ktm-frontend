"use client";

import { useSiteConfig } from "@/lib/hooks/useSiteConfig";

interface Props {
  /** Used when API + env are unset (ISR homepage constant). */
  staticFallback: string;
}

export function HomeHeroBackdrop({ staticFallback }: Props) {
  const { data = {} } = useSiteConfig();
  const envUrl = process.env.NEXT_PUBLIC_HERO_BANNER_URL;
  const url =
    (data.heroBannerUrl && String(data.heroBannerUrl).trim() !== "" ? data.heroBannerUrl : null) ??
    (envUrl && envUrl.trim() !== "" ? envUrl : null) ??
    staticFallback;

  return (
    <div
      data-testid="hero-image-wrapper"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${url})` }}
    />
  );
}
