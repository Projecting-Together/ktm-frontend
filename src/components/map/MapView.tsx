"use client";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { ensureLeafletDefaultIcons } from "./leaflet-defaults";

const DEFAULT_CENTER = { lat: 27.7172, lng: 85.324 } as const;

/**
 * Default basemap: Esri World Street Map — raster tiles skew toward English/Latin place labels
 * in Nepal versus raw OSM tiles (often Devanagari). Override with NEXT_PUBLIC_MAP_TILE_URL if needed.
 * Tile grid uses Esri's z/y/x column-major order (not OSM z/x/y).
 */
const DEFAULT_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

const DEFAULT_ATTRIBUTION =
  '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community';

const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? DEFAULT_TILE_URL;

const ATTRIBUTION = process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ?? DEFAULT_ATTRIBUTION;

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
    <div lang="en" className="ktm-leaflet w-full min-h-0">
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
