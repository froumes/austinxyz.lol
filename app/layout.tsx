import type React from "react"
import type { Metadata, Viewport } from "next"
import { Bodoni_Moda, Hanken_Grotesk, Space_Mono } from "next/font/google"
import "./globals.css"

const displayFont = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const bodyFont = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const monoFont = Space_Mono({
  subsets: ["latin"],
  variable: "--font-code",
  display: "swap",
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://austinxyz.lol"),
  title: "nozomiReborn - Premium Roblox Script",
  description: "Cinematic premium Roblox script landing page with animated particles, scroll reveals, and a glass-panel interface.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "nozomiReborn",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
  openGraph: {
    title: "nozomiReborn - Premium Roblox Script",
    description: "Cinematic premium Roblox script landing page with animated particles, scroll reveals, and a glass-panel interface.",
    images: [
      {
        url: "/icon.svg",
        width: 1200,
        height: 630,
        alt: "nozomiReborn",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "nozomiReborn - Premium Roblox Script",
    description: "Cinematic premium Roblox script landing page with animated particles, scroll reveals, and a glass-panel interface.",
    images: ["/icon.svg"],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark h-full ${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="antialiased min-h-screen overflow-x-hidden bg-background text-foreground font-body-md cinematic-bg relative">
        {children}
      </body>
    </html>
  )
}
