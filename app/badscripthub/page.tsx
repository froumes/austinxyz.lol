"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import {
  Crosshair,
  Eye,
  Zap,
  Palette,
  Monitor,
  Settings,
  Folder,
  Gamepad2,
  Github,
  ArrowLeft,
  Sparkles,
  Sword,
  MousePointerClick,
  Hammer,
  Target,
  Dice6,
  RotateCcw,
  Copy,
  Check,
  Key,
  ExternalLink,
  Search,
  Basketball,
  TrendingUp,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { LogoSimple } from "@/components/logo"
import dynamic from "next/dynamic"

const StatsDashboard = dynamic(() => import("@/components/stats-dashboard"), {
  ssr: false,
  loading: () => (
    <div className="backdrop-blur-sm border-2 rounded-xl p-8 text-center">
      <p>Loading statistics...</p>
    </div>
  ),
})

// Discord Icon Component
const DiscordIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
)

const THEME_PRESETS = {
  landing: {
    BackgroundColor: "rgb(10, 10, 10)",
    SurfaceColor: "rgb(23, 23, 23)",
    AccentColor: "rgb(59, 130, 246)",
    TextColor: "rgb(255, 255, 255)",
    SecondaryTextColor: "rgb(156, 163, 175)",
    BorderColor: "rgb(38, 38, 38)",
  },
  "dark mode": {
    BackgroundColor: "rgb(30, 30, 30)",
    SurfaceColor: "rgb(44, 44, 46)",
    AccentColor: "rgb(10, 132, 255)",
    TextColor: "rgb(255, 255, 255)",
    SecondaryTextColor: "rgb(152, 152, 157)",
    BorderColor: "rgb(58, 58, 60)",
  },
  "light mode": {
    BackgroundColor: "rgb(245, 245, 247)",
    SurfaceColor: "rgb(255, 255, 255)",
    AccentColor: "rgb(0, 122, 255)",
    TextColor: "rgb(28, 28, 30)",
    SecondaryTextColor: "rgb(142, 142, 147)",
    BorderColor: "rgb(209, 209, 214)",
  },
  "vs code dark": {
    BackgroundColor: "rgb(30, 30, 30)",
    SurfaceColor: "rgb(37, 37, 38)",
    AccentColor: "rgb(0, 122, 204)",
    TextColor: "rgb(212, 212, 212)",
    SecondaryTextColor: "rgb(140, 140, 140)",
    BorderColor: "rgb(60, 60, 60)",
  },
  dracula: {
    BackgroundColor: "rgb(40, 42, 54)",
    SurfaceColor: "rgb(68, 71, 90)",
    AccentColor: "rgb(189, 147, 249)",
    TextColor: "rgb(248, 248, 242)",
    SecondaryTextColor: "rgb(98, 114, 164)",
    BorderColor: "rgb(68, 71, 90)",
  },
  nord: {
    BackgroundColor: "rgb(46, 52, 64)",
    SurfaceColor: "rgb(59, 66, 82)",
    AccentColor: "rgb(136, 192, 208)",
    TextColor: "rgb(236, 239, 244)",
    SecondaryTextColor: "rgb(216, 222, 233)",
    BorderColor: "rgb(76, 86, 106)",
  },
  monokai: {
    BackgroundColor: "rgb(39, 40, 34)",
    SurfaceColor: "rgb(73, 72, 62)",
    AccentColor: "rgb(249, 38, 114)",
    TextColor: "rgb(248, 248, 242)",
    SecondaryTextColor: "rgb(117, 113, 94)",
    BorderColor: "rgb(73, 72, 62)",
  },
  "monkeytype dark": {
    BackgroundColor: "rgb(50, 52, 55)",
    SurfaceColor: "rgb(44, 46, 49)",
    AccentColor: "rgb(226, 183, 20)",
    TextColor: "rgb(209, 208, 197)",
    SecondaryTextColor: "rgb(136, 140, 145)",
    BorderColor: "rgb(58, 61, 65)",
  },
  "monkeytype light": {
    BackgroundColor: "rgb(246, 245, 244)",
    SurfaceColor: "rgb(255, 255, 255)",
    AccentColor: "rgb(226, 183, 20)",
    TextColor: "rgb(44, 46, 49)",
    SecondaryTextColor: "rgb(107, 108, 110)",
    BorderColor: "rgb(224, 222, 217)",
  },
  "monkeytype 9009": {
    BackgroundColor: "rgb(237, 232, 225)",
    SurfaceColor: "rgb(218, 210, 202)",
    AccentColor: "rgb(180, 139, 125)",
    TextColor: "rgb(75, 74, 71)",
    SecondaryTextColor: "rgb(127, 125, 122)",
    BorderColor: "rgb(200, 193, 186)",
  },
  "sakura light": {
    BackgroundColor: "rgb(245, 240, 230)",
    SurfaceColor: "rgb(255, 239, 210)",
    AccentColor: "rgb(255, 122, 144)",
    TextColor: "rgb(62, 47, 45)",
    SecondaryTextColor: "rgb(138, 111, 104)",
    BorderColor: "rgb(231, 213, 189)",
  },
  "sakura dark": {
    BackgroundColor: "rgb(38, 34, 32)",
    SurfaceColor: "rgb(58, 46, 44)",
    AccentColor: "rgb(255, 122, 144)",
    TextColor: "rgb(235, 220, 210)",
    SecondaryTextColor: "rgb(173, 150, 144)",
    BorderColor: "rgb(80, 62, 58)",
  },
  "soft pastel": {
    BackgroundColor: "rgb(249, 245, 250)",
    SurfaceColor: "rgb(255, 250, 255)",
    AccentColor: "rgb(203, 166, 247)",
    TextColor: "rgb(88, 76, 95)",
    SecondaryTextColor: "rgb(158, 143, 165)",
    BorderColor: "rgb(232, 220, 238)",
  },
  "soft pastel dark": {
    BackgroundColor: "rgb(42, 38, 50)",
    SurfaceColor: "rgb(58, 52, 70)",
    AccentColor: "rgb(203, 166, 247)",
    TextColor: "rgb(236, 225, 245)",
    SecondaryTextColor: "rgb(184, 170, 198)",
    BorderColor: "rgb(82, 74, 96)",
  },
  "soft mint": {
    BackgroundColor: "rgb(244, 250, 248)",
    SurfaceColor: "rgb(250, 255, 252)",
    AccentColor: "rgb(134, 205, 186)",
    TextColor: "rgb(75, 95, 88)",
    SecondaryTextColor: "rgb(143, 165, 158)",
    BorderColor: "rgb(220, 238, 232)",
  },
  "soft mint dark": {
    BackgroundColor: "rgb(34, 48, 44)",
    SurfaceColor: "rgb(46, 62, 57)",
    AccentColor: "rgb(134, 205, 186)",
    TextColor: "rgb(214, 235, 228)",
    SecondaryTextColor: "rgb(158, 190, 180)",
    BorderColor: "rgb(74, 102, 94)",
  },
  "soft lavender": {
    BackgroundColor: "rgb(248, 246, 255)",
    SurfaceColor: "rgb(255, 251, 255)",
    AccentColor: "rgb(186, 157, 255)",
    TextColor: "rgb(82, 72, 110)",
    SecondaryTextColor: "rgb(146, 135, 173)",
    BorderColor: "rgb(228, 221, 250)",
  },
  "soft lavender dark": {
    BackgroundColor: "rgb(43, 38, 59)",
    SurfaceColor: "rgb(58, 52, 78)",
    AccentColor: "rgb(186, 157, 255)",
    TextColor: "rgb(230, 223, 255)",
    SecondaryTextColor: "rgb(180, 170, 208)",
    BorderColor: "rgb(84, 75, 115)",
  },
  "soft blue": {
    BackgroundColor: "rgb(242, 248, 255)",
    SurfaceColor: "rgb(250, 254, 255)",
    AccentColor: "rgb(132, 176, 255)",
    TextColor: "rgb(68, 92, 128)",
    SecondaryTextColor: "rgb(132, 156, 189)",
    BorderColor: "rgb(212, 225, 245)",
  },
  "soft blue dark": {
    BackgroundColor: "rgb(32, 42, 58)",
    SurfaceColor: "rgb(44, 56, 74)",
    AccentColor: "rgb(132, 176, 255)",
    TextColor: "rgb(217, 230, 255)",
    SecondaryTextColor: "rgb(162, 184, 214)",
    BorderColor: "rgb(66, 84, 112)",
  },
}

export default function BadScriptHubPage() {
  const [enabled, setEnabled] = useState(true)
  const [aimMode, setAimMode] = useState("camera")
  const [fov, setFov] = useState(300)
  const [smoothness, setSmoothness] = useState(3.0)
  const [prediction, setPrediction] = useState(0.15)
  const [targetPart, setTargetPart] = useState("head")
  const [teamCheck, setTeamCheck] = useState(true)
  const [visibilityCheck, setVisibilityCheck] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const demoRef = useRef<HTMLDivElement>(null)
  const [tiltStyle, setTiltStyle] = useState({ transform: "" })
  const rootRef = useRef<HTMLDivElement>(null)

  const isDraggingFov = useRef(false)
  const isDraggingSmoothness = useRef(false)
  const isDraggingPrediction = useRef(false)

  const [selectedTheme, setSelectedTheme] = useState<keyof typeof THEME_PRESETS>("sakura dark")
  const [currentTheme, setCurrentTheme] = useState(THEME_PRESETS["landing"])
  const [hasTransitioned, setHasTransitioned] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  
  const loadstring = 'loadstring(game:HttpGet("https://raw.githubusercontent.com/froumes/austinxyz.lol/main/badscripthub/loader.lua"))()'


  const navItems = [
    { icon: Crosshair, label: "Aim", active: true },
    { icon: Eye, label: "Visuals", active: false },
    { icon: Zap, label: "Performance", active: false },
    { icon: Palette, label: "Colors", active: false },
    { icon: Monitor, label: "Display", active: false },
    { icon: Settings, label: "Settings", active: false },
    { icon: Folder, label: "Files", active: false },
    { icon: Gamepad2, label: "Controls", active: false },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentTheme(THEME_PRESETS["sakura dark"])
      setHasTransitioned(true)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (hasTransitioned) {
      setCurrentTheme(THEME_PRESETS[selectedTheme])
    }
  }, [selectedTheme, hasTransitioned])

  // Store theme whenever it changes (for landing page transition)
  useEffect(() => {
    if (hasTransitioned && typeof window !== 'undefined') {
      sessionStorage.setItem('badscripthub-theme', JSON.stringify({
        themeName: selectedTheme,
        theme: currentTheme
      }))
    }
  }, [currentTheme, selectedTheme, hasTransitioned])

  // Also store on page unload/navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasTransitioned && typeof window !== 'undefined') {
        sessionStorage.setItem('badscripthub-theme', JSON.stringify({
          themeName: selectedTheme,
          theme: currentTheme
        }))
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [currentTheme, selectedTheme, hasTransitioned])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })

      if (demoRef.current) {
        const rect = demoRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const deltaX = (e.clientX - centerX) / (rect.width / 2)
        const deltaY = (e.clientY - centerY) / (rect.height / 2)

        const tiltX = -deltaY * 12 // Negative Y tilt when mouse is above
        const tiltY = deltaX * 12 // Positive Y rotation when mouse is to the right

        setTiltStyle({
          transform: "perspective(1500px) rotateX(" + tiltX + "deg) rotateY(" + tiltY + "deg)",
        })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Track background for smooth transition
  const [displayBg, setDisplayBg] = useState<string>(THEME_PRESETS["landing"].BackgroundColor)
  const bgLayerRef = useRef<HTMLDivElement>(null)

  // Smooth background transition
  useEffect(() => {
    const newBg = currentTheme.BackgroundColor
    
    if (bgLayerRef.current) {
      // Use CSS transition on backgroundColor directly
      bgLayerRef.current.style.backgroundColor = newBg
      setDisplayBg(newBg)
    }
  }, [currentTheme.BackgroundColor])

  return (
    <>
      <style>{`
        [data-theme-root] {
          background-color: transparent !important;
        }
        .bg-layer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -2;
          transition: background-color 1s cubic-bezier(0.4, 0, 0.2, 1) !important;
          will-change: background-color;
        }
        html, body {
          background-color: transparent !important;
        }
        [data-theme-root] *,
        [data-theme-root] *::before,
        [data-theme-root] *::after {
          transition: color 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important,
                      border-color 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important,
                      background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important,
                      background 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important,
                      box-shadow 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important,
                      fill 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important,
                      stroke 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        /* Stagger transitions for different element types for smoother effect */
        [data-theme-root] header,
        [data-theme-root] header * {
          transition-delay: 0s;
        }
        [data-theme-root] h1,
        [data-theme-root] h2,
        [data-theme-root] h3 {
          transition-delay: 0.1s;
        }
        [data-theme-root] p,
        [data-theme-root] span,
        [data-theme-root] label {
          transition-delay: 0.15s;
        }
        [data-theme-root] button,
        [data-theme-root] a {
          transition-delay: 0.2s;
        }
      `}</style>
      <div
        ref={rootRef}
        className="min-h-screen relative overflow-hidden"
        data-theme-root
      >
        {/* Background layer for smooth transition */}
        <div
          ref={bgLayerRef}
          className="bg-layer"
          style={{
            backgroundColor: displayBg,
          }}
        />
      <div
        className="pointer-events-none fixed w-96 h-96 rounded-full opacity-30 blur-3xl transition-all duration-[1000ms] ease-in-out z-50"
        style={{
          left: cursorPosition.x - 192,
          top: cursorPosition.y - 192,
          background: "radial-gradient(circle, " + currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.4)") + " 0%, " + currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.2)") + " 50%, transparent 70%)",
          transition: "background 1s cubic-bezier(0.4, 0, 0.2, 1), left 0.1s ease-out, top 0.1s ease-out",
        }}
      />

      <div
        className="absolute inset-0 animate-gradient transition-opacity duration-[1000ms] ease-in-out z-0"
        style={{
          background: "linear-gradient(to bottom right, " + currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.05)") + ", transparent, " + currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.05)") + ")",
          transition: "opacity 1s cubic-bezier(0.4, 0, 0.2, 1), background 1s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      <div
        className="absolute inset-0 animate-pulse-slow transition-opacity duration-[1000ms] ease-in-out z-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, " + currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.1)") + ", transparent 50%)",
          transition: "opacity 1s cubic-bezier(0.4, 0, 0.2, 1), background 1s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />

      <header
        className="relative z-20 border-b backdrop-blur-md animate-slide-down transition-all duration-[1000ms] ease-in-out"
        style={{
          borderColor: currentTheme.BorderColor,
          backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.3)"),
          transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <ArrowLeft
              className="w-5 h-5 group-hover:-translate-x-1 transition-all"
              style={{ 
                color: currentTheme.SecondaryTextColor,
                transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
            {/* Logo - Replace /logo.png with your actual filename after uploading to public folder */}
            <LogoSimple
              size={24}
              className="group-hover:scale-110 transition-transform duration-300"
              alt="BadScriptHub Logo"
            />
            <div 
              className="text-sm font-semibold transition-colors duration-[1000ms] ease-in-out" 
              style={{ 
                color: currentTheme.TextColor,
                transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              austin<span className="group-hover:text-pink-300 transition-colors">xyz</span>
              <span 
                style={{ 
                  color: currentTheme.AccentColor,
                  transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                .lol
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Select
              value={selectedTheme}
              onValueChange={(value) => setSelectedTheme(value as keyof typeof THEME_PRESETS)}
            >
              <SelectTrigger
                className="w-48 border-none rounded-lg transition-colors duration-[1000ms] ease-in-out"
                style={{
                  backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
                  color: currentTheme.TextColor,
                  borderColor: currentTheme.BorderColor,
                  transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                themeColors={{
                  surfaceColor: currentTheme.SurfaceColor,
                  textColor: currentTheme.TextColor,
                  borderColor: currentTheme.BorderColor,
                  accentColor: currentTheme.AccentColor,
                }}
              >
                {Object.keys(THEME_PRESETS)
                  .filter((key) => key !== "landing")
                  .map((theme) => (
                    <SelectItem key={theme} value={theme}>
                      {theme}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <a
              href="https://github.com/froumes"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-[1000ms] ease-in-out hover:scale-105 hover-lift hover-glow"
              style={{
                backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
                border: "1px solid " + currentTheme.BorderColor,
                color: currentTheme.TextColor,
                transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease",
              }}
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://discord.gg/fA8jDgtHg9"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-[1000ms] ease-in-out hover:scale-105 hover-lift hover-glow"
              style={{
                backgroundColor: currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.1)"),
                border: "1px solid " + currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
                color: currentTheme.AccentColor,
                transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease",
              }}
            >
              <DiscordIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Discord</span>
            </a>
          </div>
        </div>
      </header>

      {/* Prominent Loadstring Section */}
      <div className="relative z-10 container mx-auto px-6 pt-8">
        <div
          className="max-w-4xl mx-auto rounded-2xl p-6 mb-8 shadow-2xl border-2 animate-scale-in hover-lift hover-glow"
          style={{
            backgroundColor: currentTheme.SurfaceColor,
            borderColor: currentTheme.AccentColor,
            boxShadow: "0 0 40px " + currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.3)"),
            transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2
              className="text-2xl font-bold flex items-center gap-2 animate-slide-in-left"
              style={{
                color: currentTheme.TextColor,
                transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Sparkles 
                className="w-6 h-6 animate-spin-slow"
                style={{
                  color: currentTheme.AccentColor,
                  transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
              Loadstring
            </h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(loadstring)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 active:scale-95 animate-slide-in-right hover-lift"
              style={{
                backgroundColor: copied 
                  ? currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.2)")
                  : currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.1)"),
                border: "1px solid " + currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
                color: currentTheme.AccentColor,
                transition: "all 0.3s ease, color 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div
            className="rounded-lg p-4 font-mono text-sm break-all select-all cursor-text"
            style={{
              backgroundColor: currentTheme.BackgroundColor,
              border: "1px solid " + currentTheme.BorderColor,
              color: currentTheme.TextColor,
              transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {loadstring}
          </div>
          <p
            className="text-sm mt-3 opacity-70"
            style={{
              color: currentTheme.SecondaryTextColor,
              transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Copy and paste this into your Roblox executor to load BadScriptHub
          </p>
        </div>
      </div>

      {/* Key Links Section */}
      <div className="relative z-10 container mx-auto px-6 pt-8 pb-8">
        <div
          className="max-w-4xl mx-auto rounded-2xl p-6 mb-8 shadow-2xl border-2 animate-fade-in-up animation-delay-200 hover-lift"
          style={{
            backgroundColor: currentTheme.SurfaceColor,
            borderColor: currentTheme.AccentColor,
            boxShadow: "0 0 40px " + currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.2)"),
            transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="text-center mb-6">
            <h2
              className="text-2xl font-bold flex items-center justify-center gap-2 mb-2 animate-slide-in-left"
              style={{
                color: currentTheme.TextColor,
                transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Key 
                className="w-6 h-6 animate-pulse-slow"
                style={{
                  color: currentTheme.AccentColor,
                  transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
              Get Your Key
            </h2>
            <p
              className="text-sm opacity-70"
              style={{
                color: currentTheme.SecondaryTextColor,
                transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              Complete a short verification to access BadScriptHub scripts
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Linkvertise Key Link */}
            <a
              href="https://ads.luarmor.net/get_key?for=badscripthub-rKXsLWcPlUCN"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative backdrop-blur-sm border-2 rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-scale hover-lift"
              style={{
                backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
                borderColor: currentTheme.BorderColor,
                transition: "all 0.3s ease, border-color 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = currentTheme.AccentColor
                e.currentTarget.style.boxShadow = "0 0 20px " + currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.3)")
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = currentTheme.BorderColor
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300"
                    style={{
                      backgroundColor: currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.1)"),
                      transition: "all 0.3s ease, background-color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <Key
                      className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300"
                      style={{
                        color: currentTheme.AccentColor,
                        transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-semibold mb-1 transition-colors duration-300"
                      style={{
                        color: currentTheme.TextColor,
                        transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      Linkvertise
                    </h3>
                    <p
                      className="text-sm opacity-70"
                      style={{
                        color: currentTheme.SecondaryTextColor,
                        transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      Complete verification
                    </p>
                  </div>
                </div>
                <ExternalLink
                  className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                  style={{
                    color: currentTheme.AccentColor,
                    transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </div>
            </a>

            {/* Work.ink Key Link */}
            <a
              href="https://ads.luarmor.net/get_key?for=badscripthub-makxYXFZnUta"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative backdrop-blur-sm border-2 rounded-xl p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-scale animation-delay-100 hover-lift"
              style={{
                backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
                borderColor: currentTheme.BorderColor,
                transition: "all 0.3s ease, border-color 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = currentTheme.AccentColor
                e.currentTarget.style.boxShadow = "0 0 20px " + currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.3)")
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = currentTheme.BorderColor
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300"
                    style={{
                      backgroundColor: currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.1)"),
                      transition: "all 0.3s ease, background-color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <Key
                      className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300"
                      style={{
                        color: currentTheme.AccentColor,
                        transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </div>
                  <div>
                    <h3
                      className="text-lg font-semibold mb-1 transition-colors duration-300"
                      style={{
                        color: currentTheme.TextColor,
                        transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      Work.ink
                    </h3>
                    <p
                      className="text-sm opacity-70"
                      style={{
                        color: currentTheme.SecondaryTextColor,
                        transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      Complete verification
                    </p>
                  </div>
                </div>
                <ExternalLink
                  className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                  style={{
                    color: currentTheme.AccentColor,
                    transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </div>
            </a>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="mt-12 w-full max-w-6xl animate-fade-in-up animation-delay-200">
          <h2
            className="text-2xl font-bold mb-6 text-center"
            style={{
              color: currentTheme.TextColor,
              transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Statistics
          </h2>
          <StatsDashboard currentTheme={currentTheme} />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 flex flex-col items-center">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex flex-col items-center gap-4 mb-6">
            <LogoSimple
              size={64}
              className="animate-pulse-slow"
              alt="BadScriptHub Logo"
            />
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full animate-pulse-slow transition-colors duration-[1000ms] ease-in-out"
              style={{ 
                backgroundColor: currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.1)"),
                transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <DiscordIcon 
                className="w-4 h-4" 
                style={{ 
                  color: currentTheme.AccentColor,
                  transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                }} 
              />
              <span
                className="text-sm font-semibold" 
                style={{ 
                  color: currentTheme.AccentColor,
                  transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                @froumes
              </span>
            </div>
          </div>

          <h1
            className="text-5xl md:text-7xl font-black mb-6 tracking-tight transition-colors duration-[1000ms] ease-in-out"
            style={{ 
              color: currentTheme.TextColor,
              transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            badscripthub powered by{" "}
            <a
              href="https://nozomi.lol"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              style={{ 
                color: currentTheme.AccentColor,
                transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
              }}
            >
              nozomi
            </a>
          </h1>

          <p
            className="text-xl max-w-3xl mx-auto leading-relaxed transition-colors duration-[1000ms] ease-in-out"
            style={{ 
              color: currentTheme.SecondaryTextColor,
              transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Automation scripts that handle the repetitive stuff so you don't have to
          </p>
        </div>

        <div
          ref={demoRef}
          className="max-w-6xl mx-auto mb-16 animate-fade-in-up animation-delay-400"
          style={{
            ...tiltStyle,
            transition: "transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          <div
            className="flex rounded-3xl shadow-2xl overflow-hidden transition-all duration-[1000ms] ease-in-out"
            style={{
              backgroundColor: currentTheme.SurfaceColor,
              border: "2px solid " + currentTheme.BorderColor,
              backdropFilter: "blur(20px)",
              boxShadow: "0 0 30px " + currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.2)"),
              transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              className={`flex flex-col items-center py-6 px-4 transition-all duration-300 overflow-hidden ${
                isHovered ? "w-[200px]" : "w-[80px]"
              }`}
              style={{ 
                backgroundColor: currentTheme.BackgroundColor,
                transition: "background-color 1s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease",
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="flex flex-col items-center gap-3 mb-6">
                <LogoSimple
                  size={32}
                  className="animate-pulse-slow"
                  alt="BadScriptHub Logo"
                />
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57] animate-pulse" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e] animate-pulse animation-delay-200" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840] animate-pulse animation-delay-400" />
                </div>
              </div>

              <div className="flex flex-col gap-6 w-full">
                {navItems.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={index}
                      className={`flex items-center transition-all duration-300 hover:scale-105 ${
                        item.active
                          ? isHovered
                            ? "px-3 py-2 rounded-lg gap-3 shadow-lg"
                            : "p-2 rounded-full w-9 h-9 justify-center mx-auto shadow-lg"
                          : isHovered
                            ? "px-3 py-2 rounded-lg gap-3"
                            : "p-2 rounded-full w-9 h-9 justify-center mx-auto"
                      }`}
                      style={{
                        backgroundColor: item.active ? currentTheme.AccentColor : "transparent",
                        color: item.active ? currentTheme.BackgroundColor : currentTheme.TextColor,
                        transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
                        animationDelay: String(index * 100) + "ms",
                      }}
                      onMouseEnter={(e) => {
                        if (!item.active) {
                          e.currentTarget.style.backgroundColor = currentTheme.SurfaceColor.replace(
                            "rgb",
                            "rgba",
                          ).replace(")", ", 0.5)")
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!item.active) {
                          e.currentTarget.style.backgroundColor = "transparent"
                        }
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span
                        className={`text-sm font-medium whitespace-nowrap transition-all duration-300 overflow-hidden ${
                          isHovered ? "opacity-100 max-w-[120px]" : "opacity-0 max-w-0"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div
                className="h-14 flex items-center justify-between px-6 transition-colors duration-[1000ms] ease-in-out"
                style={{
                  backgroundColor: currentTheme.BackgroundColor,
                  borderBottom: "1px solid " + currentTheme.BorderColor,
                  color: currentTheme.SecondaryTextColor,
                  transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <div className="text-sm font-mono animate-pulse-slow group" style={{ marginRight: "auto", paddingRight: "1rem" }}>
                  <span
                    className="group-hover:text-pink-300 transition-colors"
                    style={{ color: currentTheme.SecondaryTextColor }}
                  >
                    badscripthub
                  </span>
                  ://nozomi
                </div>
                <div className="flex gap-3">
                  <button
                    className="px-3 py-1.5 text-xs font-semibold rounded-md transition-all hover:scale-105"
                    style={{
                      color: currentTheme.TextColor,
                      backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = currentTheme.SurfaceColor
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = currentTheme.SurfaceColor.replace("rgb", "rgba").replace(
                        ")",
                        ", 0.5)",
                      )
                    }}
                  >
                    TOGGLE UI
                  </button>
                  <button
                    className="px-3 py-1.5 text-xs font-semibold rounded-md transition-all hover:scale-105"
                    style={{
                      color: currentTheme.TextColor,
                      backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = currentTheme.SurfaceColor
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = currentTheme.SurfaceColor.replace("rgb", "rgba").replace(
                        ")",
                        ", 0.5)",
                      )
                    }}
                  >
                    RIGHTSHIFT
                  </button>
                </div>
              </div>

              <div className="flex-1 flex">
                <div
                  className="flex-1 px-8 py-6 relative transition-colors duration-[1000ms] ease-in-out"
                  style={{ 
                    backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.6)"),
                    transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <div className="mb-8">
                    <h2
                      className="text-xs uppercase tracking-wider mb-6 font-semibold transition-colors duration-[1000ms] ease-in-out"
                      style={{ 
                        color: currentTheme.SecondaryTextColor,
                        transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      main settings
                    </h2>

                    <div
                      className="flex items-center justify-between mb-6 group px-3 py-2 rounded-lg transition-all"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = currentTheme.SurfaceColor.replace(
                          "rgb",
                          "rgba",
                        ).replace(")", ", 0.5)")
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      <label
                        className="text-sm font-medium transition-colors duration-[1000ms] ease-in-out"
                        style={{ 
                          color: currentTheme.TextColor,
                          transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        enabled
                      </label>
                      <Switch checked={enabled} onCheckedChange={setEnabled} accentColor={currentTheme.AccentColor} />
                    </div>

                    <div
                      className="flex items-center justify-between mb-6 group px-3 py-2 rounded-lg transition-all"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = currentTheme.SurfaceColor.replace(
                          "rgb",
                          "rgba",
                        ).replace(")", ", 0.5)")
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      <label
                        className="text-sm font-medium transition-colors duration-[1000ms] ease-in-out"
                        style={{ 
                          color: currentTheme.TextColor,
                          transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        aim mode
                      </label>
                      <Select value={aimMode} onValueChange={setAimMode}>
                        <SelectTrigger
                          className="w-32 border-none rounded-lg transition-colors duration-[1000ms] ease-in-out"
                          style={{
                            backgroundColor: currentTheme.BackgroundColor,
                            color: currentTheme.TextColor,
                            transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          themeColors={{
                            surfaceColor: currentTheme.SurfaceColor,
                            textColor: currentTheme.TextColor,
                            borderColor: currentTheme.BorderColor,
                            accentColor: currentTheme.AccentColor,
                          }}
                        >
                          <SelectItem value="camera">camera</SelectItem>
                          <SelectItem value="memory">memory</SelectItem>
                          <SelectItem value="hybrid">hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div
                      className="mb-8 group px-3 py-2 rounded-lg transition-all"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = currentTheme.SurfaceColor.replace(
                          "rgb",
                          "rgba",
                        ).replace(")", ", 0.5)")
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <label
                          className="text-sm font-medium transition-colors duration-[1000ms] ease-in-out"
                          style={{ 
                            color: currentTheme.TextColor,
                            transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          fov
                        </label>
                        <span
                          className="text-sm font-bold animate-pulse-slow transition-colors duration-[1000ms] ease-in-out"
                          style={{ 
                            color: currentTheme.AccentColor,
                            transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          {fov}
                        </span>
                      </div>
                      <Slider
                        value={[fov]}
                        onValueChange={(value) => {
                          isDraggingFov.current = true
                          setFov(value[0])
                        }}
                        onValueCommit={() => {
                          isDraggingFov.current = false
                        }}
                        min={0}
                        max={500}
                        step={1}
                        className="cursor-grab active:cursor-grabbing"
                        accentColor={currentTheme.AccentColor}
                      />
                    </div>

                    <div
                      className="mb-8 group px-3 py-2 rounded-lg transition-all"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = currentTheme.SurfaceColor.replace(
                          "rgb",
                          "rgba",
                        ).replace(")", ", 0.5)")
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <label
                          className="text-sm font-medium transition-colors duration-[1000ms] ease-in-out"
                          style={{ 
                            color: currentTheme.TextColor,
                            transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          smoothness
                        </label>
                        <span
                          className="text-sm font-bold animate-pulse-slow transition-colors duration-[1000ms] ease-in-out"
                          style={{ 
                            color: currentTheme.AccentColor,
                            transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          {smoothness.toFixed(1)}
                        </span>
                      </div>
                      <Slider
                        value={[smoothness]}
                        onValueChange={(value) => {
                          isDraggingSmoothness.current = true
                          setSmoothness(value[0])
                        }}
                        onValueCommit={() => {
                          isDraggingSmoothness.current = false
                        }}
                        min={0}
                        max={10}
                        step={0.01}
                        className="cursor-grab active:cursor-grabbing"
                        accentColor={currentTheme.AccentColor}
                      />
                    </div>

                    <div
                      className="mb-8 group px-3 py-2 rounded-lg transition-all"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = currentTheme.SurfaceColor.replace(
                          "rgb",
                          "rgba",
                        ).replace(")", ", 0.5)")
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <label
                          className="text-sm font-medium transition-colors duration-[1000ms] ease-in-out"
                          style={{ 
                            color: currentTheme.TextColor,
                            transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          prediction
                        </label>
                        <span
                          className="text-sm font-bold animate-pulse-slow transition-colors duration-[1000ms] ease-in-out"
                          style={{ 
                            color: currentTheme.AccentColor,
                            transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          {prediction.toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={[prediction]}
                        onValueChange={(value) => {
                          isDraggingPrediction.current = true
                          setPrediction(value[0])
                        }}
                        onValueCommit={() => {
                          isDraggingPrediction.current = false
                        }}
                        min={0}
                        max={1}
                        step={0.001}
                        className="cursor-grab active:cursor-grabbing"
                        accentColor={currentTheme.AccentColor}
                      />
                    </div>
                  </div>

                  <div>
                    <h2
                      className="text-xs uppercase tracking-wider mb-6 font-semibold transition-colors duration-[1000ms] ease-in-out"
                      style={{ 
                        color: currentTheme.SecondaryTextColor,
                        transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    >
                      targeting
                    </h2>

                    <div
                      className="flex items-center justify-between mb-6 group px-3 py-2 rounded-lg transition-all"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = currentTheme.SurfaceColor.replace(
                          "rgb",
                          "rgba",
                        ).replace(")", ", 0.5)")
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      <label
                        className="text-sm font-medium transition-colors duration-[1000ms] ease-in-out"
                        style={{ 
                          color: currentTheme.TextColor,
                          transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        target part
                      </label>
                      <Select value={targetPart} onValueChange={setTargetPart}>
                        <SelectTrigger
                          className="w-32 border-none rounded-lg transition-colors duration-[1000ms] ease-in-out"
                          style={{
                            backgroundColor: currentTheme.BackgroundColor,
                            color: currentTheme.TextColor,
                            transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          themeColors={{
                            surfaceColor: currentTheme.SurfaceColor,
                            textColor: currentTheme.TextColor,
                            borderColor: currentTheme.BorderColor,
                            accentColor: currentTheme.AccentColor,
                          }}
                        >
                          <SelectItem value="head">Head</SelectItem>
                          <SelectItem value="chest">Chest</SelectItem>
                          <SelectItem value="body">Body</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div
                      className="flex items-center justify-between mb-6 group px-3 py-2 rounded-lg transition-all"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = currentTheme.SurfaceColor.replace(
                          "rgb",
                          "rgba",
                        ).replace(")", ", 0.5)")
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      <label
                        className="text-sm font-medium transition-colors duration-[1000ms] ease-in-out"
                        style={{ 
                          color: currentTheme.TextColor,
                          transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        team check
                      </label>
                      <Switch checked={teamCheck} onCheckedChange={setTeamCheck} accentColor={currentTheme.AccentColor} />
                    </div>

                    <div
                      className="flex items-center justify-between mb-6 group px-3 py-2 rounded-lg transition-all"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = currentTheme.SurfaceColor.replace(
                          "rgb",
                          "rgba",
                        ).replace(")", ", 0.5)")
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      <label
                        className="text-sm font-medium transition-colors duration-[1000ms] ease-in-out"
                        style={{ 
                          color: currentTheme.TextColor,
                          transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                      >
                        visibility check
                      </label>
                      <Switch checked={visibilityCheck} onCheckedChange={setVisibilityCheck} accentColor={currentTheme.AccentColor} />
                    </div>
                  </div>
                </div>

                <div
                  className="w-1 animate-gradient transition-colors duration-[1000ms] ease-in-out"
                  style={{
                    background: "linear-gradient(to bottom, " + currentTheme.AccentColor + ", " + currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.7)") + ", " + currentTheme.AccentColor + ")",
                    transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {[
            {
              icon: Crosshair,
              title: "Precision Targeting",
              desc: "Intelligent hitbox detection with predictive algorithms",
            },
            { icon: Zap, title: "Real-time Performance", desc: "Optimized for zero latency and maximum FPS" },
            {
              icon: Settings,
              title: "Fully Customizable",
              desc: "Fine-tune every parameter to match your playstyle",
            },
          ].map((feature, i) => {
            const FeatureIcon = feature.icon
            return (
              <div
                key={i}
                className="backdrop-blur-sm rounded-xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-xl animate-fade-in-up"
                style={{
                  backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
                  border: "1px solid " + currentTheme.BorderColor,
                  animationDelay: String((i + 6) * 100) + "ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = currentTheme.AccentColor
                  e.currentTarget.style.backgroundColor = currentTheme.SurfaceColor.replace("rgb", "rgba").replace(
                    ")",
                    ", 0.8)",
                  )
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = currentTheme.BorderColor
                  e.currentTarget.style.backgroundColor = currentTheme.SurfaceColor.replace("rgb", "rgba").replace(
                    ")",
                    ", 0.5)",
                  )
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.1)") }}
                >
                  <FeatureIcon className="w-6 h-6" style={{ color: currentTheme.AccentColor }} />
                </div>
                <h3
                  className="text-lg font-bold mb-2 transition-colors duration-[1000ms] ease-in-out"
                  style={{ 
                    color: currentTheme.TextColor,
                    transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-relaxed transition-colors duration-[1000ms] ease-in-out"
                  style={{ 
                    color: currentTheme.SecondaryTextColor,
                    transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            )
          })}
        </div>

        {/* Scripts Section */}
        <div
          className="max-w-6xl mx-auto mb-16 animate-fade-in-up animation-delay-600"
        >
          <h2
            className="text-4xl md:text-5xl font-black mb-12 text-center transition-colors duration-[1000ms] ease-in-out animate-fade-in-up"
            style={{ 
              color: currentTheme.TextColor,
              transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Available Scripts
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Anime Eternal",
                icon: Sword,
                description: "Does basically everything in Anime Eternal. Farms enemies, handles teleports, manages rank ups and prestige, runs gacha pulls, tracks dungeons—you name it.",
                features: ["Auto Farm", "Teleport System", "Rank Up Automation", "Prestige System", "Gacha Automation", "Dungeon Tracker", "Quest System", "Spirit Upgrades"],
                color: "rgb(255, 122, 144)"
              },
              {
                name: "Clash Clicker",
                icon: MousePointerClick,
                description: "Clicks for you and buys upgrades automatically. Tracks your elixir and handles card purchases so you don't have to babysit it.",
                features: ["Auto Click", "Auto Upgrade", "Card Automation", "Auto Level", "Purchase Modes", "Elixir Tracking"],
                color: "rgb(59, 130, 246)"
              },
              {
                name: "Dig To Earth",
                icon: Hammer,
                description: "Has a money dupe that actually works, plus it'll craft pets, buy upgrades, and collect gems while you're away.",
                features: ["Money Dupe", "Pet Crafting", "Auto Upgrades", "Gem Automation", "Spin Prize System"],
                color: "rgb(134, 205, 186)"
              },
              {
                name: "Fistborn",
                icon: Target,
                description: "Farms money by detecting jobs and pathfinding to them. Teleports around when needed. Pretty straightforward.",
                features: ["Auto Farm", "Job Detection", "Pathfinding", "Teleportation", "Money Tracking"],
                color: "rgb(186, 157, 255)"
              },
              {
                name: "Jules RNG",
                icon: Dice6,
                description: "Handles roll buffers and lets you configure custom rolls. Automates the RNG stuff so you don't have to manually roll everything.",
                features: ["Roll Buffer", "Custom Configs", "Auto Roll", "Buffer Management", "RNG Optimization"],
                color: "rgb(255, 183, 77)"
              },
              {
                name: "Rebirth Champions",
                icon: RotateCcw,
                description: "Clicks, rebirths, hatches eggs, and tracks achievements. Set it and forget it kind of thing.",
                features: ["Auto Click", "Auto Rebirth", "Egg Hatching", "Upgrade System", "Achievement Tracking", "Chest Automation"],
                color: "rgb(132, 176, 255)"
              },
              {
                name: "Find Brainrot",
                icon: Search,
                description: "Finds items automatically and handles the repetitive searching. Saves you from clicking around the map for hours.",
                features: ["Auto Find", "Item Detection", "Pathfinding", "Collection System", "Progress Tracking"],
                color: "rgb(203, 166, 247)"
              },
              {
                name: "Pixel Blade",
                icon: Sword,
                description: "Handles combat automation and progression. Farms enemies, manages upgrades, and tracks your progress through the game.",
                features: ["Auto Combat", "Enemy Farming", "Upgrade System", "Progress Tracking", "Resource Management"],
                color: "rgb(255, 122, 144)"
              },
              {
                name: "TapEmpire",
                icon: TrendingUp,
                description: "Taps for you and manages your empire. Handles upgrades, tracks resources, and automates the clicking so you can focus on strategy.",
                features: ["Auto Tap", "Empire Management", "Resource Tracking", "Upgrade Automation", "Progress System"],
                color: "rgb(59, 130, 246)"
              },
              {
                name: "Basketball Legends",
                icon: Basketball,
                description: "Automates gameplay and handles the repetitive parts. Manages your team, tracks stats, and handles upgrades while you're away.",
                features: ["Auto Play", "Team Management", "Stat Tracking", "Upgrade System", "Progress Automation"],
                color: "rgb(255, 183, 77)"
              },
            ].map((script, i) => {
              const IconComponent = script.icon
              return (
              <div
                key={i}
                className="group relative backdrop-blur-sm rounded-2xl p-6 border-2 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 animate-scale-in hover-lift"
                style={{
                  backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
                  borderColor: currentTheme.BorderColor,
                  animationDelay: String((i + 8) * 100) + "ms",
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = script.color
                  e.currentTarget.style.boxShadow = "0 0 30px " + script.color.replace("rgb", "rgba").replace(")", ", 0.3)")
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = currentTheme.BorderColor
                  e.currentTarget.style.boxShadow = "none"
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="p-2 rounded-lg transition-all duration-300 hover-scale group-hover:animate-bounce-subtle"
                    style={{
                      backgroundColor: script.color.replace("rgb", "rgba").replace(")", ", 0.1)"),
                      color: script.color,
                    }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3
                    className="text-2xl font-bold transition-colors duration-300"
                    style={{ 
                      color: currentTheme.TextColor,
                    }}
                  >
                    {script.name}
                  </h3>
                </div>
                
                <p
                  className="text-sm leading-relaxed mb-4 transition-colors duration-300"
                  style={{ 
                    color: currentTheme.SecondaryTextColor,
                  }}
                >
                  {script.description}
                </p>
                
                <div className="space-y-2">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2 transition-colors duration-300"
                    style={{ 
                      color: script.color,
                    }}
                  >
                    Features
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {script.features.map((feature, j) => (
                      <span
                        key={j}
                        className="px-2 py-1 rounded-lg text-xs font-medium transition-all duration-300 hover:scale-110 animate-fade-in-scale"
                        style={{
                          backgroundColor: script.color.replace("rgb", "rgba").replace(")", ", 0.1)"),
                          color: script.color,
                          border: "1px solid " + script.color.replace("rgb", "rgba").replace(")", ", 0.3)"),
                          animationDelay: String(j * 50) + "ms",
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div
          className="max-w-4xl mx-auto mb-16 animate-fade-in-up animation-delay-800"
        >
          <h2
            className="text-4xl md:text-5xl font-black mb-12 text-center transition-colors duration-[1000ms] ease-in-out animate-fade-in-up"
            style={{ 
              color: currentTheme.TextColor,
              transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {[
              {
                question: "What is BadScriptHub?",
                answer: "It's a bunch of automation scripts I made for different Roblox games. They all use Nozomi UI so the interface looks decent, and each one handles the boring repetitive stuff like farming, upgrades, and gacha pulls."
              },
              {
                question: "How do I use the scripts?",
                answer: "Run the script in whatever executor you use (Synapse, Script-Ware, etc.). The UI pops up and you can toggle it with RightShift. Then just enable whatever automations you want and adjust the settings."
              },
              {
                question: "Are the scripts safe to use?",
                answer: "I try to handle errors so things don't crash, but use them at your own risk. Some games don't like automation, so you might get banned. Don't go crazy with obvious exploits and you'll probably be fine."
              },
              {
                question: "What games are supported?",
                answer: "Right now there's scripts for Anime Eternal, Basketball Legends, Clash Clicker, Dig To Earth, Find Brainrot, Fistborn, Jules RNG, Pixel Blade, Rebirth Champions, and TapEmpire. Each one's built for that specific game, so the features match what actually makes sense for it."
              },
              {
                question: "Do the scripts require Nozomi UI?",
                answer: "Yeah, they all use Nozomi UI. It loads automatically when you run a script, so you get the same interface across everything. Makes things consistent and it looks decent."
              },
              {
                question: "Can I customize the scripts?",
                answer: "Yep, you can change pretty much everything. Speeds, delays, what gets automated, all that. Settings save automatically so you don't have to reconfigure every time."
              },
              {
                question: "How often are scripts updated?",
                answer: "I update them when games break things or add new features. Usually within a few days of a major update, sometimes faster if it's a simple fix. No set schedule though."
              },
              {
                question: "What features does Anime Eternal script include?",
                answer: "The Anime Eternal one does the most. It farms enemies, teleports around, handles rank ups and prestige, manages spiritual pressure and curses, runs gacha for all the different systems (dragon race, saiyan stuff, pirate crew, swords, demon fruits, etc.), tracks dungeons, completes quests, and buys upgrades. Basically everything except actually playing the game."
              },
              {
                question: "Does Clash Clicker script support auto-upgrades?",
                answer: "Yeah, it buys upgrades automatically based on how much elixir you have. You can set different purchase modes if you want it to be more or less aggressive about spending."
              },
              {
                question: "What makes BadScriptHub different?",
                answer: "They all use Nozomi UI so the interface looks good and stays consistent. I try to handle errors properly so things don't crash, and you can customize most settings. I update them when games break things, and the code's actually readable if you want to modify it yourself."
              },
            ].map((faq, i) => {
              const isOpen = openFAQ === i
              return (
                <div
                  key={i}
                  className="backdrop-blur-sm rounded-xl border-2 overflow-hidden transition-all duration-500 animate-fade-in-scale hover-lift"
                  style={{
                    backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
                    borderColor: currentTheme.BorderColor,
                    animationDelay: String((i + 14) * 50) + "ms",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = currentTheme.AccentColor
                    e.currentTarget.style.boxShadow = "0 0 20px " + currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.2)")
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = currentTheme.BorderColor
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <button
                    onClick={() => setOpenFAQ(isOpen ? null : i)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left transition-all duration-300 hover:bg-opacity-10"
                    style={{
                      backgroundColor: isOpen ? currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.1)") : "transparent",
                    }}
                  >
                    <h3
                      className="text-lg font-bold pr-4 transition-colors duration-300"
                      style={{ 
                        color: currentTheme.TextColor,
                      }}
                    >
                      {faq.question}
                    </h3>
                    <div
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300"
                      style={{
                        backgroundColor: currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.2)"),
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      <svg
                        className="w-4 h-4 transition-colors duration-300"
                        style={{ color: currentTheme.AccentColor }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  <div
                    className="overflow-hidden transition-all duration-500 ease-in-out"
                    style={{
                      maxHeight: isOpen ? "500px" : "0px",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div
                      className="px-6 pb-4 pt-2 transition-colors duration-300"
                      style={{ 
                        color: currentTheme.SecondaryTextColor,
                      }}
                    >
                      <p className="leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* About Section */}
        <div
          className="max-w-4xl mx-auto backdrop-blur-sm rounded-2xl p-8 md:p-12 animate-fade-in-up animation-delay-1000 transition-all duration-[1000ms] ease-in-out"
          style={{
            backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.8)"),
            border: "1px solid " + currentTheme.BorderColor,
            transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <h2
            className="text-3xl font-bold mb-6 transition-colors duration-[1000ms] ease-in-out"
            style={{ 
              color: currentTheme.TextColor,
              transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            About BadScriptHub
          </h2>
          <div
            className="space-y-4 leading-relaxed transition-colors duration-[1000ms] ease-in-out"
            style={{ 
              color: currentTheme.SecondaryTextColor,
              transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <p>
              BadScriptHub started as a side project to automate the boring parts of grinding in Roblox games. After spending way too many hours clicking the same buttons, I built scripts that actually work and don't break every time a game updates.
            </p>
            <p>
              Everything runs on Nozomi UI, so you get a clean interface that doesn't look like it's from 2015. You can tweak pretty much anything—speeds, delays, what gets automated, all that stuff. The themes are nice too if you're into that.
            </p>
            <p>
              The code's actually readable (shocking, I know) and I try to keep things updated when games patch. No promises on response time, but I usually fix breaking changes within a few days.
            </p>
          </div>

          <div
            className="mt-8 pt-8 transition-colors duration-[1000ms] ease-in-out"
            style={{ 
              borderTop: "1px solid " + currentTheme.BorderColor,
              transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <h3
              className="text-xl font-bold mb-4 transition-colors duration-[1000ms] ease-in-out"
              style={{ 
                color: currentTheme.TextColor,
                transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              Key Features
            </h3>
            <ul
              className="grid md:grid-cols-2 gap-3 transition-colors duration-[1000ms] ease-in-out"
              style={{ 
                color: currentTheme.SecondaryTextColor,
                transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {[
                "Nozomi UI integration",
                "Intelligent automation systems",
                "Real-time optimization",
                "Customizable settings",
                "Multiple game support",
                "Zero latency performance",
                "Full parameter control",
                "Regular updates & support",
              ].map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 animate-fade-in-up"
                  style={{ animationDelay: String((i + 20) * 50) + "ms" }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse transition-colors duration-[1000ms] ease-in-out"
                    style={{ 
                      backgroundColor: currentTheme.AccentColor,
                      transition: "background-color 1s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
