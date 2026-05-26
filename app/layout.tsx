import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  metadataBase: new URL("https://austinxyz.lol"),
  title: "austinxyz.lol",
  description: "Projects, experiments, and live dashboards by Austin.",
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
    title: "austinxyz.lol",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
  openGraph: {
    title: "austinxyz.lol",
    description: "notabadcoder",
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
    title: "austinxyz.lol",
    description: "notabadcoder",
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
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased min-h-screen overflow-x-hidden`}>
        {children}
      </body>
    </html>
  )
}
