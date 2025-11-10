"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowRight, Code, Target } from "lucide-react"
import Link from "next/link"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface Theme {
  BackgroundColor: string
  SurfaceColor: string
  AccentColor: string
  TextColor: string
  SecondaryTextColor: string
  BorderColor: string
}

export default function HomePage() {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null)
  const [displayedText, setDisplayedText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const [storedTheme, setStoredTheme] = useState<Theme | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const bgLayerRef = useRef<HTMLDivElement>(null)
  const fullText = "austinxyz.lol"

  // Scroll animation component for regular elements
  function ScrollAnimatedElement({ 
    children, 
    delay = 0, 
    className = "scroll-fade-up" 
  }: { 
    children: React.ReactNode
    delay?: number
    className?: string
  }) {
    const { ref, isVisible } = useScrollAnimation({ 
      threshold: 0.1, 
      rootMargin: "0px 0px -50px 0px",
      triggerOnce: true,
      delay 
    })

    return (
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`scroll-animate ${className} ${isVisible ? "visible" : ""}`}
        style={{ 
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    )
  }

  // Scroll animation component for Links (handles transform conflicts)
  function ScrollAnimatedLink({ 
    href,
    children,
    delay = 0,
    onMouseEnter,
    onMouseLeave,
    hoveredOption,
    hoverTransform = "rotateX(2deg) rotateY(-2deg)",
    className = "",
    ...props
  }: { 
    href: string
    children: React.ReactNode
    delay?: number
    onMouseEnter?: () => void
    onMouseLeave?: () => void
    hoveredOption?: boolean
    hoverTransform?: string
    className?: string
    [key: string]: any
  }) {
    const { ref, isVisible } = useScrollAnimation({ 
      threshold: 0, 
      rootMargin: "300px 0px 300px 0px",
      triggerOnce: true,
      delay 
    })
    
    // The hook already handles persistence, but add extra safety
    const shouldBeVisible = isVisible

    // Calculate transform based on visibility and hover state
    // Once visible, always use hover or default transform (never go back to translateY)
    const getTransform = () => {
      if (!shouldBeVisible) {
        return "translateY(40px)"
      }
      // Once visible, use hover transform with scale/translate effects or default
      if (hoveredOption) {
        return `${hoverTransform} scale(1.02) translateY(-8px)`
      }
      return "rotateX(0) rotateY(0)"
    }

    return (
      <Link
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`scroll-animate ${shouldBeVisible ? "visible" : ""} ${className}`}
        style={{
          transform: getTransform(),
          transformStyle: "preserve-3d",
          // Only transition transform, not opacity (opacity is handled by CSS class)
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          // Ensure opacity stays 1 once visible - use !important via inline style
          opacity: shouldBeVisible ? 1 : 0,
          ...props.style,
        }}
        {...props}
      >
        {children}
      </Link>
    )
  }
  
  // Default landing theme colors
  const defaultTheme: Theme = {
    BackgroundColor: "rgb(10, 10, 10)",
    SurfaceColor: "rgb(23, 23, 23)",
    AccentColor: "rgb(59, 130, 246)",
    TextColor: "rgb(255, 255, 255)",
    SecondaryTextColor: "rgb(156, 163, 175)",
    BorderColor: "rgb(38, 38, 38)",
  }

  useEffect(() => {
    const typingSpeed = isDeleting ? 100 : 150
    const pauseDuration = 2000

    const timeout = setTimeout(() => {
      if (!isDeleting && displayedText.length < fullText.length) {
        setDisplayedText(fullText.slice(0, displayedText.length + 1))
      } else if (isDeleting && displayedText.length > 0) {
        setDisplayedText(fullText.slice(0, displayedText.length - 1))
      } else if (!isDeleting && displayedText.length === fullText.length) {
        setTimeout(() => setIsDeleting(true), pauseDuration)
      } else if (isDeleting && displayedText.length === 0) {
        setIsDeleting(false)
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [displayedText, isDeleting])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Check for stored theme from badscripthub and transition back to default
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('badscripthub-theme')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          const theme = parsed.theme
          
          // Set the stored theme immediately
          setStoredTheme(theme)
          setIsTransitioning(true)
          
          // Clear the stored theme from storage
          sessionStorage.removeItem('badscripthub-theme')
          
          // Set initial background color and make visible
          requestAnimationFrame(() => {
            if (bgLayerRef.current) {
              bgLayerRef.current.style.backgroundColor = theme.BackgroundColor
              bgLayerRef.current.style.display = 'block'
              bgLayerRef.current.style.opacity = '1'
            }
            
            // Transition back to default after a brief moment
            setTimeout(() => {
              requestAnimationFrame(() => {
                if (bgLayerRef.current) {
                  bgLayerRef.current.style.backgroundColor = defaultTheme.BackgroundColor
                }
                // Allow transition to complete, then fade out
                setTimeout(() => {
                  if (bgLayerRef.current) {
                    bgLayerRef.current.style.opacity = '0'
                  }
                  setTimeout(() => {
                    setIsTransitioning(false)
                    setStoredTheme(null)
                    if (bgLayerRef.current) {
                      bgLayerRef.current.style.display = 'none'
                    }
                  }, 1000)
                }, 1000)
              })
            }, 300)
          })
        } catch (e) {
          console.error('Failed to parse stored theme', e)
        }
      }
    }
  }, [])

  const currentBg = storedTheme?.BackgroundColor || defaultTheme.BackgroundColor

  return (
    <>
      <style>{`
        .landing-bg-layer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
          transition: background-color 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 1s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: background-color, opacity;
        }
        html, body {
          background-color: transparent !important;
        }
      `}</style>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background layer for smooth theme transition */}
        <div
          ref={bgLayerRef}
          className="landing-bg-layer"
          style={{
            backgroundColor: currentBg,
            opacity: isTransitioning ? 1 : 0,
            display: isTransitioning ? 'block' : 'none',
          }}
        />
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] animate-pulse-slow" />

      <div className="relative z-10 max-w-6xl w-full">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-6xl md:text-8xl font-black text-foreground mb-4 tracking-tight min-h-[120px] flex items-center justify-center">
            <span>
              {displayedText.split(".").map((part, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-primary">.</span>}
                  {part}
                </span>
              ))}
              <span className="inline-block w-1 h-20 bg-primary ml-1 animate-blink" />
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light animate-fade-in-up animation-delay-200">
            showcase of capabilities
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <ScrollAnimatedLink 
            href="/portfolio"
            delay={400}
            onMouseEnter={() => setHoveredOption("portfolio")}
            onMouseLeave={() => setHoveredOption(null)}
            hoveredOption={hoveredOption === "portfolio"}
            className="group relative bg-card/50 backdrop-blur-sm border-2 border-border rounded-2xl p-12 perspective-1000"
          >
            {/* Animated gradient border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl opacity-0 group-hover:opacity-75 transition duration-500 blur-sm animate-gradient-rotate" />

            {/* Glowing effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/10 to-primary/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Floating particles effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-float" />
              <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-primary/70 rounded-full animate-float animation-delay-200" />
              <div className="absolute bottom-1/3 left-1/2 w-1 h-1 bg-primary/50 rounded-full animate-float animation-delay-400" />
            </div>

            <div className="relative z-10 bg-card/90 backdrop-blur-sm rounded-xl p-8 -m-8">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Code className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>

              <h2 className="text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                Portfolio
              </h2>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                Explore my projects, skills, and professional work
              </p>

              <div className="flex items-center text-primary font-semibold group-hover:gap-3 gap-2 transition-all">
                View Portfolio
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </ScrollAnimatedLink>

          <ScrollAnimatedLink 
            href="/badscripthub"
            delay={600}
            onMouseEnter={() => setHoveredOption("badscripthub")}
            onMouseLeave={() => setHoveredOption(null)}
            hoveredOption={hoveredOption === "badscripthub"}
            hoverTransform="rotateX(2deg) rotateY(2deg)"
            className="group relative bg-card/50 backdrop-blur-sm border-2 border-border rounded-2xl p-12 perspective-1000"
          >
            {/* Animated gradient border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent via-primary to-accent rounded-2xl opacity-0 group-hover:opacity-75 transition duration-500 blur-sm animate-gradient-rotate" />

            {/* Glowing effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/10 to-accent/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Floating particles effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-accent rounded-full animate-float" />
              <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-accent/70 rounded-full animate-float animation-delay-200" />
              <div className="absolute bottom-1/3 right-1/2 w-1 h-1 bg-accent/50 rounded-full animate-float animation-delay-400" />
            </div>

            <div className="relative z-10 bg-card/90 backdrop-blur-sm rounded-xl p-8 -m-8">
              <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Target className="w-8 h-8 group-hover:scale-110 transition-all duration-300" style={{
                  color: hoveredOption === "badscripthub" ? "rgb(255, 122, 144)" : "rgb(255, 255, 255)"
                }} />
              </div>

              <h2 className="text-3xl font-bold mb-3 transition-colors duration-300" style={{
                color: hoveredOption === "badscripthub" ? "rgb(255, 122, 144)" : "rgb(255, 255, 255)"
              }}>
                BadScriptHub
              </h2>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                Advanced aim assistance script with interactive demo
              </p>

              <div className="flex items-center font-semibold group-hover:gap-3 gap-2 transition-all duration-300" style={{
                color: hoveredOption === "badscripthub" ? "rgb(255, 122, 144)" : "rgb(255, 255, 255)"
              }}>
                View Script
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </ScrollAnimatedLink>
        </div>

        <ScrollAnimatedElement delay={1000}>
          <div className="text-center mt-16">
            <p className="text-muted-foreground text-sm">Choose your path and discover what I can do</p>
          </div>
        </ScrollAnimatedElement>
      </div>
      </div>
    </>
  )
}
