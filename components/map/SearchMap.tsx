"use client";

import { useEffect, useRef } from "react";
import type { ListingListItem } from "@/lib/api/client";
import { MapView } from "./MapView";

interface SearchMapProps {
  listings: ListingListItem[];
  className?: string;
}

export function SearchMap({ listings, className }: SearchMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    for (const listing of listings) {
      const lat = listing.location?.latitude;
      const lng = listing.location?.longitude;
      if (lat == null || lng == null) continue;

      const position = { lat: Number(lat), lng: Number(lng) };
      const marker = new google.maps.Marker({
        map,
        position,
        title: listing.title,
      });
      markersRef.current.push(marker);
    }

    if (markersRef.current.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach((m) => {
        const pos = m.getPosition();
        if (pos) bounds.extend(pos);
      });
      map.fitBounds(bounds);
    }
  }, [listings]);

  return (
    <MapView
      className={className}
      onMapReady={(map) => {
        mapRef.current = map;
      }}
    />
  );
}
