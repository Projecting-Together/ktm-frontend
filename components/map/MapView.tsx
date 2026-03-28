/// <reference types="@types/google.maps" />

"use client";

import { useEffect, useRef } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: typeof google;
  }
}

const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  process.env.NEXT_PUBLIC_FRONTEND_FORGE_API_URL || "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

function loadMapScript() {
  if (!API_KEY) {
    return Promise.reject(new Error("Missing NEXT_PUBLIC_FRONTEND_FORGE_API_KEY"));
  }
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      resolve();
      script.remove();
    };
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });
}

export interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({
  className,
  initialCenter = { lat: 27.7172, lng: 85.324 },
  initialZoom = 13,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);

  const init = usePersistFn(async () => {
    if (!API_KEY) return;
    await loadMapScript();
    if (!mapContainer.current || !window.google?.maps) {
      return;
    }
    map.current = new window.google.maps.Map(mapContainer.current, {
      zoom: initialZoom,
      center: initialCenter,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
      streetViewControl: true,
      mapId: "DEMO_MAP_ID",
    });
    onMapReady?.(map.current);
  });

  useEffect(() => {
    void init();
  }, [init]);

  if (!API_KEY) {
    return (
      <div
        className={cn(
          "flex w-full items-center justify-center rounded border border-dashed bg-muted/30 p-8 text-sm text-muted-foreground",
          className,
        )}
      >
        Set NEXT_PUBLIC_FRONTEND_FORGE_API_KEY to enable the map.
      </div>
    );
  }

  return <div ref={mapContainer} className={cn("h-[min(60vh,520px)] w-full", className)} />;
}
