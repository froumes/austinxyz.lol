import type { Metadata, Viewport } from "next";
import { Cormorant, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://austinxyz.lol"),
  title: "daydreamer.",
  description: "a quieter place to land. cold, but it feels like a summer night.",
  openGraph: {
    title: "daydreamer.",
    description: "a quieter place to land.",
    url: "https://austinxyz.lol",
    siteName: "daydreamer.",
    images: [{ url: "/og.jpg", width: 1200, height: 1200, alt: "daydreamer." }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "daydreamer.",
    description: "a quieter place to land.",
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#101631",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${hanken.variable}`}>
      <body>{children}</body>
    </html>
  );
}
