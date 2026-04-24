import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from "next/font/google";

export const fontSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const fontSerif = DM_Serif_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  style: ["normal", "italic"],
  weight: "400",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
});
