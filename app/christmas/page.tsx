"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Snowflake, Gift, TreePine, Star } from "lucide-react"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface SnowflakeData {
  left: number
  top: number
  delay: number
  duration: number
  size: number
}

export default function ChristmasPage() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isChristmas, setIsChristmas] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })

  // Generate snowflake positions once on mount
  const snowflakes = useMemo<SnowflakeData[]>(() => {
    return Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 10,
      size: 16 + Math.random() * 16,
    }))
  }, [])

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const currentYear = now.getFullYear()
      let christmas = new Date(currentYear, 11, 25, 0, 0, 0) // December 25th

      // If Christmas has passed this year, set it to next year
      if (now > christmas) {
        christmas = new Date(currentYear + 1, 11, 25, 0, 0, 0)
      }

      const difference = christmas.getTime() - now.getTime()

      if (difference <= 0) {
        setIsChristmas(true)
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }

      setIsChristmas(false)
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const TimeCard = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl transition-all hover:scale-105 hover:border-red-400/30">
      <div className="text-5xl md:text-6xl font-black text-red-400 mb-2 font-mono">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-sm text-neutral-400 uppercase tracking-wider">{label}</div>
    </div>
  )

  return (
    <div className="min-h-screen relative bg-[radial-gradient(800px_400px_at_10%_0%,rgba(220,38,38,0.15),transparent),radial-gradient(800px_400px_at_90%_100%,rgba(34,197,94,0.15),transparent)] overflow-hidden">
      {/* Animated cursor glow */}
      <div
        className="pointer-events-none fixed w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-300 ease-out z-50"
        style={{
          left: cursorPosition.x - 192,
          top: cursorPosition.y - 192,
          background: "radial-gradient(circle, rgba(220,38,38,0.4) 0%, rgba(34,197,94,0.3) 50%, transparent 70%)",
        }}
      />

      {/* Floating snowflakes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {snowflakes.map((flake, i) => (
          <Snowflake
            key={i}
            className="absolute text-white/20 animate-float"
            style={{
              left: `${flake.left}%`,
              top: `${flake.top}%`,
              animationDelay: `${flake.delay}s`,
              animationDuration: `${flake.duration}s`,
            }}
            size={flake.size}
          />
        ))}
      </div>

      <header className="sticky top-0 z-10 backdrop-blur-md border-b border-white/10 bg-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2 text-red-400">
            <TreePine className="w-4 h-4" />
            <span className="text-sm">Christmas Tracker</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-black text-white">
              {isChristmas ? "Merry Christmas!" : "Christmas Countdown"}
            </h1>
            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
          </div>
          <p className="text-xl text-neutral-400">
            {isChristmas
              ? "🎄 The most wonderful time of the year is here! 🎄"
              : "Counting down to the most wonderful time of the year"}
          </p>
        </div>

        {isChristmas ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-9xl mb-8 animate-bounce">🎄</div>
            <div className="text-4xl font-bold text-red-400 mb-4">Merry Christmas!</div>
            <div className="text-xl text-neutral-300">Hope you have a wonderful day!</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
              <TimeCard value={timeLeft.days} label="Days" />
              <TimeCard value={timeLeft.hours} label="Hours" />
              <TimeCard value={timeLeft.minutes} label="Minutes" />
              <TimeCard value={timeLeft.seconds} label="Seconds" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4 text-white">
                  <Gift className="w-5 h-5 text-red-400" />
                  <h3 className="font-semibold">Days Until Christmas</h3>
                </div>
                <div className="text-4xl font-bold text-red-400">{timeLeft.days}</div>
                <div className="text-sm text-neutral-400 mt-2">
                  {timeLeft.days === 1 ? "day" : "days"} remaining
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4 text-white">
                  <TreePine className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold">Total Hours</h3>
                </div>
                <div className="text-4xl font-bold text-green-400">
                  {timeLeft.days * 24 + timeLeft.hours}
                </div>
                <div className="text-sm text-neutral-400 mt-2">hours until Christmas</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4 text-white">
                  <Snowflake className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold">Progress</h3>
                </div>
                <div className="text-4xl font-bold text-blue-400">
                  {Math.round(((365 - (timeLeft.days + timeLeft.hours / 24)) / 365) * 100)}%
                </div>
                <div className="text-sm text-neutral-400 mt-2">through the year</div>
              </div>
            </div>
          </>
        )}

        <div className="mt-12 text-center">
          <p className="text-neutral-500 text-sm">
            {isChristmas
              ? "Enjoy the holiday season! 🎅"
              : "The countdown updates every second"}
          </p>
        </div>
      </main>
    </div>
  )
}

