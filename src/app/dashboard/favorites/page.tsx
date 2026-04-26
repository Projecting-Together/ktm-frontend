"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { ListingCardSkeleton } from "@/components/listings/ListingCard";

export default function FavoritesPage() {
  const { data: favorites, isLoading } = useFavorites();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Saved Listings</h1>
      <p className="text-muted-foreground mb-6">Properties you've saved for later.</p>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({length:3}).map((_,i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : !favorites?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Heart className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold">No saved listings yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Browse apartments and tap the heart icon to save them here.</p>
          <Link href="/apartments" className="btn-primary mt-4">Browse Apartments</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((fav) => (
            fav.listing ? (
              <Link
                key={fav.listing_id}
                href={`/apartments/${fav.listing_id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-accent hover:shadow-sm"
              >
                {fav.listing.images?.[0]?.image_url ? (
                  <img
                    src={fav.listing.images[0].image_url}
                    alt={fav.listing.title}
                    className="h-14 w-14 shrink-0 rounded-md object-cover"
                  />
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
            ) : null
          ))}
        </div>
      )}
    </div>
  );
}
