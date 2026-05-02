/**
 * Content-Security-Policy (single string for middleware + docs).
 * MSW uses `fetch()` in the service worker — tile URLs must be in connect-src. Fonts are same-origin (next/font).
 */
export const connectSrc =
  "'self' " +
  "http://127.0.0.1:8000 http://localhost:8000 http://127.0.0.1:3000 http://localhost:3000 " +
  "https://api.ktmapartments.com https://images.ktmapartments.com " +
  "https://*.tile.openstreetmap.org " +
  "https://www.google-analytics.com https://analytics.google.com " +
  "ws: wss:";

export const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob: https:",
  `connect-src ${connectSrc}`,
  "frame-ancestors 'none'",
].join("; ");
