import L from "leaflet";

let iconsFixed = false;

/**
 * Default Leaflet marker images break under bundlers. Point at same-origin assets in `/public/leaflet`
 * (Leaflet 1.9.x PNGs) so markers work with CSP + MSW: external CDN fetches go through the SW `fetch()`
 * and were blocked by `connect-src`.
 * Safe to call multiple times.
 */
export function ensureLeafletDefaultIcons(): void {
  if (typeof window === "undefined" || iconsFixed) return;
  iconsFixed = true;
  const proto = L.Icon.Default.prototype as unknown as { _getIconUrl?: string };
  delete proto._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/leaflet/marker-icon-2x.png",
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
  });
}
