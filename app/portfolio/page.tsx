"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function PortfolioPage() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div
        className="pointer-events-none fixed w-96 h-96 rounded-full opacity-30 blur-3xl transition-all duration-300 ease-out z-50"
        style={{
          left: cursorPosition.x - 192,
          top: cursorPosition.y - 192,
          background:
            "radial-gradient(circle, rgba(219, 39, 119, 0.4) 0%, rgba(59, 130, 246, 0.3) 50%, transparent 70%)",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 animate-gradient" />

      <div className="relative z-10 text-center animate-fade-in-up">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-5xl font-black text-foreground mb-4">Portfolio</h1>
        <p className="text-xl text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  )
}
