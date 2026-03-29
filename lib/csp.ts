/**
 * Content-Security-Policy (single string for middleware + docs).
 * MSW uses `fetch()` in the service worker — font and tile URLs must be in connect-src.
 */
export const connectSrc =
  "'self' " +
  "http://127.0.0.1:8000 http://localhost:8000 http://127.0.0.1:3000 http://localhost:3000 " +
  "https://api.ktmapartments.com https://images.ktmapartments.com " +
  "https://fonts.googleapis.com https://fonts.gstatic.com " +
  "https://*.tile.openstreetmap.org " +
  "ws: wss:";

export const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  `connect-src ${connectSrc}`,
  "frame-ancestors 'none'",
].join("; ");
