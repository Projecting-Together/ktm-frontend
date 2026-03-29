"use client";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { ensureLeafletDefaultIcons } from "./leaflet-defaults";

const DEFAULT_CENTER = { lat: 27.7172, lng: 85.324 } as const;

const TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  /** Receives the Leaflet map instance after mount. */
  onMapReady?: (map: L.Map) => void;
  /** Rendered inside the map (e.g. markers, bounds). */
  children?: ReactNode;
}

function MapReadyBridge({ onMapReady }: { onMapReady?: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onMapReady?.(map);
  }, [map, onMapReady]);
  return null;
}

export function MapView({
  className,
  initialCenter = DEFAULT_CENTER,
  initialZoom = 13,
  onMapReady,
  children,
}: MapViewProps) {
  ensureLeafletDefaultIcons();

  return (
    <div className="ktm-leaflet w-full min-h-0">
      <MapContainer
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={initialZoom}
        className={cn("z-0 min-h-[min(60vh,520px)] h-[min(60vh,520px)] w-full rounded-md", className)}
        scrollWheelZoom
        attributionControl
      >
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
        <MapReadyBridge onMapReady={onMapReady} />
        {children}
      </MapContainer>
    </div>
  );
}
