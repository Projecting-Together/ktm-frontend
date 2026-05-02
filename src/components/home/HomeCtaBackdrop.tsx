"use client";

import { useSiteConfig } from "@/lib/hooks/useSiteConfig";

interface Props {
  staticFallback: string;
}

export function HomeCtaBackdrop({ staticFallback }: Props) {
  const { data = {} } = useSiteConfig();
  const envUrl = process.env.NEXT_PUBLIC_CTA_BANNER_URL;
  const url =
    (data.ctaBannerUrl && String(data.ctaBannerUrl).trim() !== "" ? data.ctaBannerUrl : null) ??
    (envUrl && envUrl.trim() !== "" ? envUrl : null) ??
    staticFallback;

  return (
    <div
      data-testid="cta-image-wrapper"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
      style={{ backgroundImage: `url(${url})` }}
    />
  );
}
