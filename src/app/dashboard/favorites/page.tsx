"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { AddToCompareButton } from "@/components/compare/AddToCompareButton";
import { listingListItemToCompareSnapshot } from "@/lib/compare/listingToCompareSnapshot";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { FavoriteRowSkeleton } from "@/components/dashboard/FavoriteRowSkeleton";

export default function FavoritesPage() {
  const { data: favorites, isLoading } = useFavorites();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Saved Listings</h1>
      <p className="text-muted-foreground mb-6">Properties you&apos;ve saved for later.</p>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <FavoriteRowSkeleton key={i} />
          ))}
        </div>
      ) : !favorites?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Heart className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold">No saved listings yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Browse listings and tap the heart icon to save them here.</p>
          <Link href="/listings" className="btn-primary mt-4">Browse listings</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((fav) => (
            fav.listing ? (
              <div
                key={fav.listing_id}
                className="relative flex items-center gap-2 rounded-lg border border-border bg-card p-3 pr-2 transition-all hover:border-accent hover:shadow-sm"
              >
                <Link
                  href={`/listings/${fav.listing.slug}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  {fav.listing.images?.[0]?.image_url ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element -- remote listing CDN URLs */}
                      <img
                        src={fav.listing.images[0].image_url}
                        alt={fav.listing.title}
                        className="h-14 w-14 shrink-0 rounded-md object-cover"
                      />
                    </>
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-md bg-muted" aria-hidden />
                  )}
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-semibold">{fav.listing.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Saved {new Date(fav.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                <AddToCompareButton
                  snapshot={listingListItemToCompareSnapshot(fav.listing)}
                  className="shrink-0"
                />
              </div>
            ) : null
          ))}
        </div>
      )}
    </div>
  );
}
