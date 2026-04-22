import type { NextConfig } from "next";

/** CSP is set in `middleware.ts` via `@/lib/csp` so every document response gets a fresh policy. */

const nextConfig: NextConfig = {
  reactStrictMode: true,

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
      { source: "/listings", destination: "/apartments", permanent: true },
      { source: "/properties", destination: "/apartments", permanent: true },
      { source: "/neighborhoods", destination: "/apartments", permanent: true },
      { source: "/neighborhoods/:slug", destination: "/apartments", permanent: true },
    ];
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
