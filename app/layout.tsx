import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  metadataBase: new URL("https://austinxyz.lol"),
  title: "DEV_OS v2.4 | austinxyz.lol",
  description: "A developer portfolio, telemetry dashboard, and script hub with a utilitarian dark interface.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/BSHLogoNoBackground.png",
        type: "image/png",
      },
    ],
    apple: "/BSHLogoNoBackground.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DEV_OS v2.4",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
  openGraph: {
    title: "DEV_OS v2.4 | austinxyz.lol",
    description: "Projects, telemetry, and launch surfaces for Austin's personal web system.",
    images: [
      {
        url: "/BSHLogoNoBackground.png",
        width: 1200,
        height: 630,
        alt: "austinxyz.lol",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DEV_OS v2.4 | austinxyz.lol",
    description: "Projects, telemetry, and launch surfaces for Austin's personal web system.",
    images: ["/BSHLogoNoBackground.png"],
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
    <html lang="en" className="dark h-full">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased min-h-screen overflow-x-hidden bg-background text-foreground`}>
        {children}
      </body>
    </html>
  )
}
