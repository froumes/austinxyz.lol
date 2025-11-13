import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "austinxyz.lol",
  description: "notabadcoder",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  icons: {
    icon: [
      {
        url: "/BSHLogoNoBackground.png",
        type: "image/png",
      },
    ],
    apple: "/BSHLogoNoBackground.png",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`font-sans antialiased min-h-screen overflow-x-hidden`}>
        {children}
      </body>
    </html>
  )
}
