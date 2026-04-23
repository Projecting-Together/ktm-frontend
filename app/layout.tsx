import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers/Providers";
import { applyThemeVariables } from "@/lib/theme/applyTheme";
import { themeTokens } from "@/lib/theme/tokens";

const themeVariables = applyThemeVariables();

export const metadata: Metadata = {
  metadataBase: new URL("https://ktmapartments.com"),
  title: {
    default: "KTM Apartments — Find Your Home in Kathmandu",
    template: "%s | KTM Apartments",
  },
  description:
    "Nepal's premier apartment and room rental platform. Discover verified listings in Thamel, Lazimpat, Patan, Bhaktapur, Koteshwor and across Kathmandu.",
  keywords: ["apartments Kathmandu", "rooms for rent Nepal", "Thamel apartments", "Lazimpat flats", "KTM housing"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ktmapartments.com",
    siteName: "KTM Apartments",
    title: "KTM Apartments — Find Your Home in Kathmandu",
    description: "Nepal's premier apartment and room rental platform.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "KTM Apartments" }],
  },
  twitter: { card: "summary_large_image", title: "KTM Apartments", images: ["/og-image.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: themeTokens.color.background },
    { media: "(prefers-color-scheme: dark)", color: "#0A1929" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <style>{`:root {\n${themeVariables}\n}`}</style>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
