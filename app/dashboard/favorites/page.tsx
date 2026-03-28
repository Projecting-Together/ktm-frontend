"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/ListingCard";

export default function FavoritesPage() {
  const { data: favorites, isLoading } = useFavorites();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Saved Listings</h1>
      <p className="text-muted-foreground mb-6">Properties you've saved for later.</p>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            fav.listing ? <ListingCard key={fav.listing_id} listing={fav.listing as never} /> : null
          ))}
        </div>
      )}
    </div>
  );
}
