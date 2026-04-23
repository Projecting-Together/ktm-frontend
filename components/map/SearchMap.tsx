"use client";

import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import type { ListingListItem } from "@/lib/api/types";
import { adaptListingsForMap } from "@/lib/contracts/adapters";
import { MapView } from "./MapView";
import { cn, getListingCoverImage } from "@/lib/utils";
import { ListingCoverImage } from "@/components/listings/ListingCoverImage";
import { VerifiedBadge } from "@/components/common/VerifiedBadge";

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 16 });
  }, [map, positions]);
  return null;
}

interface SearchMapProps {
  listings: ListingListItem[];
  className?: string;
}

export function SearchMap({ listings, className }: SearchMapProps) {
  const normalizedListings = useMemo(() => adaptListingsForMap(listings), [listings]);

  const points: [number, number][] = useMemo(
    () => normalizedListings.map(({ lat, lng }) => [lat, lng]),
    [normalizedListings],
  );

  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border", className)}>
      <MapView className="min-h-[min(70vh,560px)] h-[min(70vh,560px)]">
        {points.length > 0 ? <FitBounds positions={points} /> : null}
        {normalizedListings.map(({ listing, lat, lng }) => {
          const img = getListingCoverImage(listing);
          return (
            <Marker key={listing.id} position={[lat, lng]}>
              <Popup>
                <div className="min-w-[200px] max-w-[260px]">
                  <div className="relative mb-2 h-24 w-full overflow-hidden rounded">
                    {listing.is_verified && (
                      <div className="absolute left-1.5 top-1.5 z-[1]">
                        <VerifiedBadge size="sm" />
                      </div>
                    )}
                    <ListingCoverImage
                      src={img}
                      alt=""
                      fill
                      sizes="260px"
                      nativeImg
                    />
                  </div>
                  <p className="text-sm font-semibold leading-tight">{listing.title}</p>
                  <Link
                    href={`/apartments/${listing.slug}`}
                    className="mt-2 inline-block text-xs font-medium text-accent underline"
                  >
                    View listing
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapView>
      {normalizedListings.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-muted/20 p-4 text-center text-sm text-muted-foreground">
          No listings with map coordinates in this result set.
        </div>
      )}
    </div>
  );
}
