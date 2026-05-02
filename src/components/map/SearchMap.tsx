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

/** Accent (#E85D25) — matches design tokens; SVG fill must stay literal for Leaflet divIcon HTML. */
const LISTING_MARKER_ICON = L.divIcon({
  className: "leaflet-div-icon ktm-map-marker-pin",
  html:
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 36" width="28" height="36" aria-hidden="true">' +
    '<path fill="#E85D25" d="M14 0C6.5 0 .7 5.7.7 12.8c0 6.4 11 21.5 12.6 23.6.3.4.8.6 1.3.6s1-.2 1.3-.6c1.6-2.1 12.6-17.2 12.6-23.6C27.3 5.7 21.5 0 14 0z"/>' +
    '<circle cx="14" cy="12.5" r="4.5" fill="#fff"/>' +
    "</svg>",
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [1, -34],
});

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
          /** City-level line only (no locality/sub-area). Prefer city, then municipality, then district. */
          const locationContext =
            listing.location?.city?.trim() ||
            listing.location?.municipality?.trim() ||
            listing.location?.district?.trim() ||
            null;
          const areaText =
            typeof listing.area_m2 === "number" && Number.isFinite(listing.area_m2)
              ? `Area: ${listing.area_m2} m²`
              : null;
          return (
            <Marker key={listing.id} position={[lat, lng]} icon={LISTING_MARKER_ICON}>
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
                  {locationContext ? (
                    <p
                      className="mt-1 text-xs text-muted-foreground"
                      data-testid="map-popup-location"
                    >
                      {locationContext}
                    </p>
                  ) : null}
                  {areaText ? <p className="mt-1 text-xs text-muted-foreground">{areaText}</p> : null}
                  <Link
                    href={`/listings/${listing.slug}`}
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
