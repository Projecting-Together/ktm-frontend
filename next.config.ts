import type { NextConfig } from "next";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** CSP is set in `middleware.ts` via `@/lib/csp` so every document response gets a fresh policy. */

const appDir = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * This repo is sometimes developed from a git worktree while a sibling checkout still has a
   * `pnpm-lock.yaml` at a higher path. Next may otherwise infer the monorepo root incorrectly,
   * which can break RSC metadata (manifest / flight JSON) and make dev-mode e2e runs flaky.
   */
  outputFileTracingRoot: join(appDir),

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.ktmapartments.com" },
      { protocol: "https", hostname: "**.ktmapartments.com" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: "/apartments", destination: "/listings", permanent: true },
      { source: "/apartments/:path*", destination: "/listings/:path*", permanent: true },
      { source: "/properties", destination: "/listings", permanent: true },
      { source: "/neighborhoods", destination: "/listings", permanent: true },
      { source: "/neighborhoods/:slug", destination: "/listings?city_slug=:slug", permanent: true },
      { source: "/dashboard/compare", destination: "/dashboard", permanent: true },
      { source: "/compare", destination: "/listings", permanent: true },
      // Legacy owner portal → unified member dashboard (see `src/lib/constants/memberDashboardRoutes.ts`).
      // Explicit paths first; catch-all last sends any other `/manage/*` to the member hub (bookmarks/emails).
      { source: "/manage", destination: "/dashboard", permanent: true },
      { source: "/manage/listings", destination: "/dashboard/listings", permanent: true },
      { source: "/manage/listings/new", destination: "/dashboard/listings/new", permanent: true },
      { source: "/manage/listings/:id/edit", destination: "/dashboard/listings/:id/edit", permanent: true },
      { source: "/manage/inquiries", destination: "/dashboard/leads/inquiries", permanent: true },
      { source: "/manage/visits", destination: "/dashboard/leads/visits", permanent: true },
      { source: "/manage/news", destination: "/dashboard/news", permanent: true },
      { source: "/manage/analytics", destination: "/dashboard/analytics", permanent: true },
      { source: "/manage/:path*", destination: "/dashboard", permanent: true },
    ];
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
