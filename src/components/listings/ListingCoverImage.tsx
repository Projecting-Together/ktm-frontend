"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ImageOff, Images } from "lucide-react";
import { cn } from "@/lib/utils";

export type ListingCoverImageProps = {
  /** Remote URL, or `null` when the listing has no images */
  src: string | null;
  alt: string;
  fill?: boolean;
  /** Passed to `next/image` when `nativeImg` is false */
  sizes?: string;
  /** Wrapper when using `fill` (e.g. rounded corners) */
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** Shorter labels for cards and thumbnails */
  compact?: boolean;
  /**
   * Use a plain `<img>` (direct HTTPS fetch) instead of `next/image`.
   * Use inside Leaflet popups and other portals where the image optimizer often breaks.
   */
  nativeImg?: boolean;
};

/**
 * Listing hero/thumbnail image with fallbacks when there is no URL or loading fails
 * (broken CDN, 404, network, or optimizer errors).
 */
export function ListingCoverImage({
  src,
  alt,
  fill = true,
  sizes = "(max-width: 768px) 100vw, 33vw",
  className,
  imgClassName,
  priority,
  compact = true,
  nativeImg = false,
}: ListingCoverImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const handleError = useCallback(() => {
    setFailed(true);
  }, []);

  const missing = !src?.trim();
  const showFallback = missing || failed;

  if (showFallback) {
    const isMissing = missing;
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1.5 bg-muted px-2 text-center text-muted-foreground",
          fill && "absolute inset-0",
          className,
        )}
        role="img"
        aria-label={
          isMissing ? "No photos for this listing" : "Photo could not be loaded"
        }
      >
        {isMissing ? (
          <Images className="h-7 w-7 shrink-0 opacity-45 sm:h-8 sm:w-8" aria-hidden />
        ) : (
          <ImageOff className="h-7 w-7 shrink-0 opacity-45 sm:h-8 sm:w-8" aria-hidden />
        )}
        <p
          className={cn(
            "max-w-[min(100%,14rem)] font-medium leading-snug text-foreground/75",
            compact ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm",
          )}
        >
          {isMissing
            ? compact
              ? "No photo yet"
              : "This listing does not have any photos yet."
            : compact
              ? "Photo unavailable"
              : "We could not load this photo. It may be missing or temporarily unavailable."}
        </p>
      </div>
    );
  }

  const resolvedSrc = src!.trim();

  if (nativeImg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- intentional: Leaflet popups break next/image optimizer
      <img
        src={resolvedSrc}
        alt={alt}
        className={cn(
          fill && "absolute inset-0 h-full w-full object-cover",
          imgClassName,
        )}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      className={imgClassName}
      priority={priority}
      onError={handleError}
    />
  );
}
