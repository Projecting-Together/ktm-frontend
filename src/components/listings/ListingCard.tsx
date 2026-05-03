"use client";

import Link from "next/link";
import { Heart, MapPin, Bed, Bath, Square, PawPrint } from "lucide-react";
import {
  cn,
  formatFurnishingLabel,
  formatListingPrice,
  getListingCoverImage,
  getListingLocation,
  formatRelativeTime,
} from "@/lib/utils";
import { AddToCompareButton } from "@/components/compare/AddToCompareButton";
import { listingListItemToCompareSnapshot } from "@/lib/compare/listingToCompareSnapshot";
import { ListingCoverImage } from "@/components/listings/ListingCoverImage";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";
import { useToggleFavorite, useIsFavorite } from "@/lib/hooks/useFavorites";
import { useAuthStore } from "@/lib/stores/authStore";
import type { ListingListItem } from "@/lib/api/types";

interface ListingCardProps {
  listing: ListingListItem;
  variant?: "grid" | "list";
  className?: string;
}

export function ListingCard({ listing, variant = "grid", className }: ListingCardProps) {
  const coverImage = getListingCoverImage(listing);
  const location = getListingLocation(listing);
  const isSaleListing = listing.purpose === "sale";
  const showPetFriendlyBadge = listing.pets_allowed === true;
  const { isAuthenticated } = useAuthStore();
  const isFavorite = useIsFavorite(listing.id);
  const { mutate: toggleFavorite, isPending } = useToggleFavorite();

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    toggleFavorite(listing.id);
  };

  const renderStatusBadgeOverlay = (positionClassName: string) => {
    if (!showPetFriendlyBadge) {
      return null;
    }

    return (
      <div className={cn("absolute flex flex-col items-end gap-1.5", positionClassName)}>
        <span
          role="img"
          data-testid="listing-pet-friendly-badge"
          aria-label="Pets allowed"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-400"
        >
          <PawPrint aria-hidden="true" className="h-3.5 w-3.5 text-black" />
        </span>
      </div>
    );
  };

  if (variant === "list") {
    return (
      <Link href={`/listings/${listing.slug}`} className={cn("listing-card flex overflow-hidden", className)}>
        <div className="relative h-36 w-48 shrink-0 sm:h-44 sm:w-56">
          <ListingCoverImage
            src={coverImage}
            alt={listing.title}
            fill
            imgClassName="object-cover"
            sizes="(max-width: 640px) 192px, 224px"
          />
          {listing.is_verified && (
            <div className="absolute left-2 top-2">
              <VerifiedBadge size="sm" />
            </div>
          )}
          {renderStatusBadgeOverlay("right-2 top-2")}
        </div>
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-base font-semibold text-foreground leading-snug">
                {listing.title}
              </h3>
              <div className="flex shrink-0 items-center gap-1">
                <AddToCompareButton snapshot={listingListItemToCompareSnapshot(listing)} />
                <button
                  onClick={handleFavorite}
                  disabled={isPending}
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-accent"
                  aria-label="Save listing"
                >
                  <Heart className={cn("h-4 w-4", isFavorite && "fill-accent text-accent")} />
                </button>
              </div>
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              {location}
            </p>
            {isSaleListing && (
              <p className="mt-1 inline-flex w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                For Sale
              </p>
            )}
            {listing.is_sponsored && (
              <p className="mt-1 inline-flex w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                Sponsored
              </p>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {listing.bedrooms != null && (
                <span className="flex items-center gap-1">
                  <Bed className="h-3 w-3" /> {listing.bedrooms} bed
                </span>
              )}
              {listing.bathrooms != null && (
                <span className="flex items-center gap-1">
                  <Bath className="h-3 w-3" /> {listing.bathrooms} bath
                </span>
              )}
              {listing.area_m2 != null && (
                <span className="flex items-center gap-1">
                  <Square className="h-3 w-3" /> {listing.area_m2} m²
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="price text-lg font-bold text-accent">
                {formatListingPrice(listing)}
              </p>
              <span className="text-xs text-muted-foreground">{formatRelativeTime(listing.created_at)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/listings/${listing.slug}`} className={cn("listing-card group block overflow-hidden", className)}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <ListingCoverImage
          src={coverImage}
          alt={listing.title}
          fill
          imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {listing.is_verified && <VerifiedBadge size="sm" />}
          {listing.is_sponsored && (
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-950">
              Sponsored
            </span>
          )}
          {listing.listing_type && (
            <span className="rounded-full bg-primary/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground backdrop-blur-sm">
              {listing.listing_type}
            </span>
          )}
          {isSaleListing && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
              For Sale
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 z-[1] flex flex-col gap-2">
          <AddToCompareButton snapshot={listingListItemToCompareSnapshot(listing)} />
          <button
            onClick={handleFavorite}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-card/80 text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-card hover:text-accent"
            aria-label="Save listing"
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-accent text-accent")} />
          </button>
        </div>
        {renderStatusBadgeOverlay("right-3 top-28")}
        {/* Image count */}
        {listing.images.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
            +{listing.images.length - 1} photos
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          {location}
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-accent transition-colors">
          {listing.title}
        </h3>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          {listing.bedrooms != null && (
            <span className="flex items-center gap-1">
              <Bed className="h-3 w-3" /> {listing.bedrooms}
            </span>
          )}
          {listing.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3 w-3" /> {listing.bathrooms}
            </span>
          )}
          {listing.area_m2 != null && (
            <span className="flex items-center gap-1">
              <Square className="h-3 w-3" /> {listing.area_m2} m²
            </span>
          )}
          {listing.furnishing && <span>{formatFurnishingLabel(listing.furnishing)}</span>}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="price text-base font-bold text-accent">
            {formatListingPrice(listing)}
          </p>
          <span className="text-[10px] text-muted-foreground">{formatRelativeTime(listing.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function ListingCardSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  if (variant === "list") {
    return (
      <div className="listing-card flex overflow-hidden">
        <div className="skeleton h-36 w-48 shrink-0 rounded-none sm:h-44 sm:w-56" />
        <div className="flex flex-1 flex-col justify-between p-4">
          <div className="space-y-2">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
          <div className="space-y-2">
            <div className="skeleton h-3 w-2/3" />
            <div className="skeleton h-5 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="listing-card overflow-hidden">
      <div className="skeleton aspect-[4/3]" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-5 w-1/3" />
      </div>
    </div>
  );
}
