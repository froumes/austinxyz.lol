"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  ArrowLeft,
  Github,
  Terminal,
  Star,
  ExternalLink,
  Gamepad2,
  Globe,
  TrendingUp,
  Users,
  Award,
  GitBranch,
  Package,
} from "lucide-react"
import Link from "next/link"
import { LogoSimple } from "@/components/logo"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  "sakura dark": {
    BackgroundColor: "rgb(38, 34, 32)",
    SurfaceColor: "rgb(58, 46, 44)",
    AccentColor: "rgb(255, 122, 144)",
    TextColor: "rgb(235, 220, 210)",
    SecondaryTextColor: "rgb(173, 150, 144)",
    BorderColor: "rgb(80, 62, 58)",
  },
  "soft blue dark": {
    BackgroundColor: "rgb(32, 42, 58)",
    SurfaceColor: "rgb(44, 56, 74)",
    AccentColor: "rgb(132, 176, 255)",
    TextColor: "rgb(217, 230, 255)",
    SecondaryTextColor: "rgb(162, 184, 214)",
    BorderColor: "rgb(66, 84, 112)",
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
}

export default function PortfolioPage() {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof THEME_PRESETS>("sakura dark")
  const [currentTheme, setCurrentTheme] = useState(THEME_PRESETS["landing"])
  const [hasTransitioned, setHasTransitioned] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const bgLayerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const newBg = currentTheme.BackgroundColor
    
    if (bgLayerRef.current) {
      bgLayerRef.current.style.backgroundColor = newBg
    }
  }, [currentTheme.BackgroundColor])

  const projects = [
    {
      name: "Bad Infinite Yield",
      description: "A powerful command-line script for Roblox with 400+ commands and extensive developer tools. Features modern UI, auto-load on teleport, plugin system, and anti-cheat protection.",
      icon: Terminal,
      color: "rgb(59, 130, 246)",
      link: "https://github.com/froumes/badinfiniteyield",
      features: ["400+ Commands", "Developer Tools", "Modern UI", "Plugin System", "Anti-Cheat Protection"],
      stats: { commands: "400+" },
    },
    {
      name: "BadScriptHub",
      description: "Advanced automation scripts for Roblox games. Features Nozomi UI integration, intelligent automation systems, and support for multiple games including Anime Eternal, Clash Clicker, and more.",
      icon: Gamepad2,
      color: "rgb(255, 122, 144)",
      link: "/badscripthub",
      features: ["Nozomi UI", "Multi-Game Support", "Auto Farm", "Customizable Settings", "Regular Updates"],
      stats: { scripts: "11+", games: "10+", users: "1000+" },
    },
    {
      name: "austinxyz.lol",
      description: "Personal portfolio website built with Next.js, featuring modern design, theme system, statistics dashboard, and interactive demos. Showcases projects and professional work.",
      icon: Globe,
      color: "rgb(132, 176, 255)",
      link: "/",
      features: ["Next.js", "Theme System", "Statistics Dashboard", "Interactive Demos", "Modern Design"],
      stats: { pages: "4+", themes: "10+", components: "50+" },
    },
  ]


  const achievements = [
    { icon: Star, title: "Open Source Contributor", desc: "Maintaining multiple active repositories" },
    { icon: Users, title: "Community Builder", desc: "Building tools used by thousands" },
    { icon: TrendingUp, title: "Continuous Learning", desc: "Always exploring new technologies" },
    { icon: Award, title: "Quality Focus", desc: "Clean, maintainable, and well-documented code" },
  ]

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
                      box-shadow 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important;
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
            backgroundColor: currentTheme.BackgroundColor,
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
              <LogoSimple
                size={24}
                className="group-hover:scale-110 transition-transform duration-300"
                alt="Logo"
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

        {/* Hero Section */}
        <div className="relative z-10 container mx-auto px-6 pt-12 pb-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h1
              className="text-5xl md:text-7xl font-black mb-6 tracking-tight transition-colors duration-[1000ms] ease-in-out"
              style={{ 
                color: currentTheme.TextColor,
                transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              Portfolio
            </h1>
            <p
              className="text-xl max-w-3xl mx-auto leading-relaxed transition-colors duration-[1000ms] ease-in-out"
              style={{ 
                color: currentTheme.SecondaryTextColor,
                transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              Developer, designer, and creator of tools that make life easier. Building the future of automation and user experience.
            </p>
          </div>
        </div>

        {/* Projects Section */}
        <div className="relative z-10 container mx-auto px-6 py-8">
          <h2
            className="text-4xl md:text-5xl font-black mb-12 text-center transition-colors duration-[1000ms] ease-in-out animate-fade-in-up"
            style={{ 
              color: currentTheme.TextColor,
              transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Featured Projects
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {projects.map((project, i) => {
              const IconComponent = project.icon
              return (
                <div
                  key={i}
                  className="group relative backdrop-blur-sm rounded-2xl p-6 border-2 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 animate-scale-in hover-lift"
                  style={{
                    backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
                    borderColor: currentTheme.BorderColor,
                    animationDelay: String((i + 1) * 100) + "ms",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.borderColor = project.color
                    e.currentTarget.style.boxShadow = "0 0 30px " + project.color.replace("rgb", "rgba").replace(")", ", 0.3)")
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.borderColor = currentTheme.BorderColor
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="p-3 rounded-lg transition-all duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: project.color.replace("rgb", "rgba").replace(")", ", 0.1)"),
                        color: project.color,
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
                      {project.name}
                    </h3>
                  </div>
                  
                  <p
                    className="text-sm leading-relaxed mb-4 transition-colors duration-300"
                    style={{ 
                      color: currentTheme.SecondaryTextColor,
                    }}
                  >
                    {project.description}
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex flex-wrap gap-2">
                      {project.features.map((feature, j) => (
                        <span
                          key={j}
                          className="px-2 py-1 rounded-lg text-xs font-medium transition-all duration-300"
                          style={{
                            backgroundColor: project.color.replace("rgb", "rgba").replace(")", ", 0.1)"),
                            color: project.color,
                            border: "1px solid " + project.color.replace("rgb", "rgba").replace(")", ", 0.3)"),
                          }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-4 text-xs"
                      style={{ color: currentTheme.SecondaryTextColor }}
                    >
                      {Object.entries(project.stats).map(([key, value], j) => (
                        <div key={j} className="flex items-center gap-1">
                          <span className="font-semibold" style={{ color: project.color }}>{value}</span>
                          <span className="opacity-70">{key}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {project.link.startsWith("http") ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-semibold transition-all duration-300 hover:gap-3"
                      style={{ color: project.color }}
                    >
                      View Project
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <Link
                      href={project.link}
                      className="flex items-center gap-2 text-sm font-semibold transition-all duration-300 hover:gap-3"
                      style={{ color: project.color }}
                    >
                      View Project
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="relative z-10 container mx-auto px-6 py-12">
          <h2
            className="text-4xl md:text-5xl font-black mb-12 text-center transition-colors duration-[1000ms] ease-in-out animate-fade-in-up"
            style={{ 
              color: currentTheme.TextColor,
              transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Achievements
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {achievements.map((achievement, i) => {
              const IconComponent = achievement.icon
              return (
                <div
                  key={i}
                  className="backdrop-blur-sm rounded-xl p-6 border-2 text-center transition-all duration-500 hover:scale-105 animate-fade-in-up"
                  style={{
                    backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
                    borderColor: currentTheme.BorderColor,
                    animationDelay: String((i + 12) * 100) + "ms",
                  }}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.borderColor = currentTheme.AccentColor
                    e.currentTarget.style.boxShadow = "0 0 20px " + currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.2)")
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.borderColor = currentTheme.BorderColor
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 transition-all duration-300"
                    style={{ 
                      backgroundColor: currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.1)"),
                    }}
                  >
                    <IconComponent 
                      className="w-8 h-8" 
                      style={{ color: currentTheme.AccentColor }}
                    />
                  </div>
                  <h3
                    className="text-lg font-bold mb-2 transition-colors duration-300"
                    style={{ 
                      color: currentTheme.TextColor,
                    }}
                  >
                    {achievement.title}
                  </h3>
                  <p
                    className="text-sm transition-colors duration-300"
                    style={{ 
                      color: currentTheme.SecondaryTextColor,
                    }}
                  >
                    {achievement.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="relative z-10 container mx-auto px-6 py-12">
          <div
            className="max-w-4xl mx-auto backdrop-blur-sm rounded-2xl p-8 md:p-12 border-2 animate-fade-in-up"
            style={{
              backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.8)"),
              borderColor: currentTheme.BorderColor,
            }}
          >
            <h2
              className="text-3xl font-bold mb-8 text-center transition-colors duration-[1000ms] ease-in-out"
              style={{ 
                color: currentTheme.TextColor,
                transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              Quick Stats
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-md mx-auto">
              {[
                { icon: GitBranch, label: "Repositories", value: "10+" },
                { icon: Package, label: "Projects", value: "15+" },
              ].map((stat, i) => {
                const IconComponent = stat.icon
                return (
                  <div
                    key={i}
                    className="text-center p-6 rounded-xl transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: currentTheme.BackgroundColor,
                    }}
                  >
                    <IconComponent 
                      className="w-8 h-8 mx-auto mb-3" 
                      style={{ color: currentTheme.AccentColor }}
                    />
                    <div
                      className="text-3xl font-black mb-2 transition-colors duration-300"
                      style={{ 
                        color: currentTheme.AccentColor,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="text-sm transition-colors duration-300"
                      style={{ 
                        color: currentTheme.SecondaryTextColor,
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 container mx-auto px-6 py-12 text-center">
          <p
            className="text-sm transition-colors duration-[1000ms] ease-in-out"
            style={{ 
              color: currentTheme.SecondaryTextColor,
              transition: "color 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            Built with Next.js, TypeScript, and lots of coffee ☕
          </p>
        </footer>
      </div>
    </>
  )
}
