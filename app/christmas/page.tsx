"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Snowflake, Gift, TreePine, Star, Sparkles, Volume2, VolumeX } from "lucide-react"

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
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  // Generate snowflake positions once on mount
  const snowflakes = useMemo<SnowflakeData[]>(() => {
    return Array.from({ length: 30 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 10,
      size: 12 + Math.random() * 20,
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
    // Detect touch device
    const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouchDevice(touchDevice)

    if (!touchDevice) {
      const handleMouseMove = (e: MouseEvent) => {
        setCursorPosition({ x: e.clientX, y: e.clientY })
      }

      window.addEventListener("mousemove", handleMouseMove)
      return () => window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  useEffect(() => {
    // Initialize audio - user can add their own music file to /public/christmas-music.mp3
    const audioElement = new Audio()
    
    // Try to load from public folder first, fallback to empty if not found
    audioElement.src = "/christmas-music.mp3"
    audioElement.loop = true
    audioElement.volume = 0.4
    
    audioElement.addEventListener('error', (e) => {
      console.log("Audio file not found - music disabled. Add /public/christmas-music.mp3 to enable music.")
      setIsPlaying(false)
    })
    
    audioElement.addEventListener('ended', () => {
      audioElement.currentTime = 0
      audioElement.play()
    })

    setAudio(audioElement)

    return () => {
      audioElement.pause()
      audioElement.src = ""
    }
  }, [])

  const toggleMusic = () => {
    if (!audio) return
    
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().catch((error) => {
        console.log("Music file not available. Add /public/christmas-music.mp3 to enable music.")
        setIsPlaying(false)
      })
      if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
        setIsPlaying(true)
      }
    }
  }

  const TimeCard = ({ value, label, color }: { value: number; label: string; color: string }) => (
    <div 
      className="relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl overflow-hidden group"
      style={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
        borderColor: `${color}40`,
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Twinkling effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full animate-pulse animation-delay-200" style={{ background: color }} />
      </div>
      
      <div className="relative z-10 text-center">
        <div 
          className="text-5xl sm:text-6xl md:text-7xl font-black mb-2 font-mono drop-shadow-lg"
          style={{ color, textShadow: `0 0 20px ${color}40` }}
        >
          {String(value).padStart(2, "0")}
        </div>
        <div className="text-sm sm:text-base text-neutral-300 uppercase tracking-widest font-semibold">
          {label}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen relative overflow-hidden safe-area-inset" style={{
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a0f0f 25%, #0f1a0f 50%, #1a0f0f 75%, #0a0a0a 100%)',
    }}>
      {/* Animated Christmas gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute inset-0 animate-pulse-slow"
          style={{
            background: 'radial-gradient(circle at 20% 30%, rgba(220, 38, 38, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.4) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.2) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Animated cursor glow - only on non-touch devices */}
      {!isTouchDevice && (
        <div
          className="pointer-events-none fixed w-96 h-96 rounded-full opacity-15 blur-3xl transition-all duration-300 ease-out z-50"
          style={{
            left: cursorPosition.x - 192,
            top: cursorPosition.y - 192,
            background: "radial-gradient(circle, rgba(220,38,38,0.5) 0%, rgba(34,197,94,0.4) 50%, transparent 70%)",
          }}
        />
      )}

      {/* Floating snowflakes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {snowflakes.map((flake, i) => (
          <Snowflake
            key={i}
            className="absolute text-white/30 animate-float"
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

      {/* Decorative Christmas ornaments */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="absolute top-10 left-10 w-16 h-16 text-red-500/20 animate-bounce animation-delay-1000">
          <Sparkles size={64} className="rotate-12" />
        </div>
        <div className="absolute top-20 right-20 w-12 h-12 text-green-500/20 animate-bounce animation-delay-2000">
          <Star size={48} className="fill-yellow-400/20 -rotate-12" />
        </div>
        <div className="absolute bottom-20 left-20 w-14 h-14 text-yellow-500/20 animate-bounce animation-delay-3000">
          <Gift size={56} className="rotate-6" />
        </div>
        <div className="absolute bottom-10 right-10 w-10 h-10 text-red-500/20 animate-bounce animation-delay-4000">
          <Sparkles size={40} className="-rotate-6" />
        </div>
      </div>

      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-white/10 bg-black/40 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-neutral-300 hover:text-white active:opacity-70 transition-colors touch-manipulation group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm sm:text-base font-medium">Back</span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMusic}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all touch-manipulation active:scale-95"
              aria-label={isPlaying ? "Pause music" : "Play music"}
            >
              {isPlaying ? (
                <>
                  <Volume2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs sm:text-sm text-neutral-300 hidden sm:inline">Music On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-neutral-400" />
                  <span className="text-xs sm:text-sm text-neutral-300 hidden sm:inline">Music Off</span>
                </>
              )}
            </button>
            <div className="flex items-center gap-2 text-red-400">
              <TreePine className="w-5 h-5 animate-pulse" />
              <span className="text-sm sm:text-base font-semibold">Christmas Tracker</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 pb-safe">
        {isChristmas ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="relative mb-8">
              <TreePine className="w-32 h-32 sm:w-40 sm:h-40 text-green-400 mb-4 animate-bounce mx-auto" />
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-red-400 rounded-full animate-pulse" />
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-400 rounded-full animate-pulse animation-delay-200" />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-400 rounded-full animate-pulse animation-delay-400" />
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-red-400 to-green-400 bg-clip-text text-transparent">
              Merry Christmas!
            </h1>
            <p className="text-xl sm:text-2xl text-neutral-300 mb-4">Hope you have a wonderful day!</p>
          </div>
        ) : (
          <>
            {/* Main Title Section */}
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-3 sm:gap-4 mb-6">
                <Star className="w-8 h-8 sm:w-10 sm:h-10 text-red-400 fill-red-400 animate-pulse" />
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-red-400 to-green-400 bg-clip-text text-transparent">
                  Christmas Countdown
                </h1>
                <Star className="w-8 h-8 sm:w-10 sm:h-10 text-green-400 fill-green-400 animate-pulse animation-delay-200" />
              </div>
              <p className="text-lg sm:text-xl text-neutral-300 font-light">
                Counting down to the most wonderful time of the year
              </p>
            </div>

            {/* Countdown Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
              <TimeCard value={timeLeft.days} label="Days" color="#ef4444" />
              <TimeCard value={timeLeft.hours} label="Hours" color="#22c55e" />
              <TimeCard value={timeLeft.minutes} label="Minutes" color="#ef4444" />
              <TimeCard value={timeLeft.seconds} label="Seconds" color="#22c55e" />
            </div>

            {/* Info Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div 
                className="relative rounded-3xl p-6 sm:p-8 border-2 shadow-2xl overflow-hidden group hover:scale-105 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-red-500/20">
                      <Gift className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Days Until</h3>
                  </div>
                  <div className="text-5xl sm:text-6xl font-black text-red-400 mb-2">{timeLeft.days}</div>
                  <p className="text-sm text-neutral-400">
                    {timeLeft.days === 1 ? "day" : "days"} until Christmas
                  </p>
                </div>
              </div>

              <div 
                className="relative rounded-3xl p-6 sm:p-8 border-2 shadow-2xl overflow-hidden group hover:scale-105 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
                  borderColor: 'rgba(34, 197, 94, 0.4)',
                }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-green-500/20">
                      <TreePine className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Total Hours</h3>
                  </div>
                  <div className="text-5xl sm:text-6xl font-black text-green-400 mb-2">
                    {timeLeft.days * 24 + timeLeft.hours}
                  </div>
                  <p className="text-sm text-neutral-400">hours remaining</p>
                </div>
              </div>

              <div 
                className="relative rounded-3xl p-6 sm:p-8 border-2 shadow-2xl overflow-hidden group hover:scale-105 transition-all duration-300 sm:col-span-2 lg:col-span-1"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
                  borderColor: 'rgba(34, 197, 94, 0.4)',
                }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-green-500/20">
                      <Snowflake className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Progress</h3>
                  </div>
                  <div className="text-5xl sm:text-6xl font-black text-green-400 mb-2">
                    {Math.round(((365 - (timeLeft.days + timeLeft.hours / 24)) / 365) * 100)}%
                  </div>
                  <p className="text-sm text-neutral-400">through the year</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-12 sm:mt-16 text-center pb-safe">
          <p className="text-neutral-500 text-sm sm:text-base">
            {isChristmas
              ? "Enjoy the holiday season!"
              : "The countdown updates every second"}
          </p>
        </div>
      </main>
    </div>
  )
}
