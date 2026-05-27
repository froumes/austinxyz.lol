"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { useEffect, useRef } from "react"
import { ArrowRight, BadgeCheck, FolderCode, House, Sparkles, TerminalSquare, Waves, ChartColumnBig } from "lucide-react"
import { cn } from "@/lib/utils"

type StatCard = {
  label: string
  value: string
}

type LogLine = {
  command: string
  detail: string
}

type Note = {
  title: string
  body: string
}

type RebuildShellProps = {
  eyebrow?: string
  title: string
  body: string
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
  stats?: StatCard[]
  notes?: Note[]
  logLines?: LogLine[]
  children?: ReactNode
}

const navItems = [
  { href: "/", label: "Home", icon: House },
  { href: "/stats", label: "Stats", icon: ChartColumnBig },
  { href: "/portfolio", label: "Portfolio", icon: FolderCode },
  { href: "/badscripthub", label: "BadScriptHub", icon: TerminalSquare },
] as const

const defaultStats: StatCard[] = [
  { label: "route status", value: "live" },
  { label: "motion mode", value: "enabled" },
  { label: "sections", value: "2" },
]

const defaultNotes: Note[] = [
  {
    title: "Readable at every size",
    body: "Spacing, type, and panel hierarchy stay legible from mobile through widescreen.",
  },
  {
    title: "Motion with restraint",
    body: "The shell keeps things active without burying the content under noise.",
  },
]

const defaultLogs: LogLine[] = [
  { command: "$ route --mount", detail: "shell initialized and ready" },
  { command: "[ok] grid locked", detail: "hero, context, and action lanes aligned" },
  { command: "[ok] motion armed", detail: "scroll, hover, and reveal behaviors active" },
]

export function RebuildShell({
  eyebrow = "rebuild mode",
  title,
  body,
  primaryHref = "/badscripthub",
  primaryLabel = "Open rewritten scripthub",
  secondaryHref = "/",
  secondaryLabel = "Home",
  stats = defaultStats,
  notes = defaultNotes,
  logLines = defaultLogs,
  children,
}: RebuildShellProps) {
  const pathname = usePathname()
  const progressRef = useRef<HTMLDivElement | null>(null)
  const mouseGlowRef = useRef<HTMLDivElement | null>(null)
  const heroCopyRef = useRef<HTMLDivElement | null>(null)
  const heroVisualRef = useRef<HTMLDivElement | null>(null)
  const revealObserverRef = useRef<IntersectionObserver | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const progress = progressRef.current
    const mouseGlow = mouseGlowRef.current
    const heroCopy = heroCopyRef.current
    const heroVisual = heroVisualRef.current
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (!progress || !mouseGlow || !heroCopy || !heroVisual) return

    if (prefersReducedMotion) {
      progress.style.display = "none"
      mouseGlow.style.display = "none"
      return
    }

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let glowX = mouseX
    let glowY = mouseY

    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const ratio = scrollHeight > 0 ? window.scrollY / scrollHeight : 0
      progress.style.transform = `scaleX(${ratio})`
      progress.style.opacity = `${0.24 + ratio * 0.76}`
    }

    const updateParallax = () => {
      const normalizedX = mouseX / window.innerWidth - 0.5
      const normalizedY = mouseY / window.innerHeight - 0.5

      heroCopy.style.setProperty("--hero-parallax-x", `${normalizedX * 10}px`)
      heroCopy.style.setProperty("--hero-parallax-y", `${normalizedY * 8}px`)
      heroVisual.style.setProperty("--hero-parallax-x", `${normalizedX * -14}px`)
      heroVisual.style.setProperty("--hero-parallax-y", `${normalizedY * -12}px`)
    }

    const animateGlow = () => {
      glowX += (mouseX - glowX) * 0.1
      glowY += (mouseY - glowY) * 0.1
      mouseGlow.style.left = `${glowX}px`
      mouseGlow.style.top = `${glowY}px`
      updateParallax()
      animationFrameRef.current = window.requestAnimationFrame(animateGlow)
    }

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            observerInstance.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.14 },
    )

    revealObserverRef.current = observer
    document.querySelectorAll<HTMLElement>(".reveal-element").forEach((element) => observer.observe(element))

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX
      mouseY = event.clientY
      mouseGlow.style.opacity = "1"
    }

    const handleMouseLeave = () => {
      mouseGlow.style.opacity = "0"
    }

    const handleScroll = () => updateProgress()
    const handleResize = () => {
      updateProgress()
      updateParallax()
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleResize)

    updateProgress()
    updateParallax()
    animateGlow()

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
      revealObserverRef.current?.disconnect()
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <main className="site-shell">
      <div ref={progressRef} className="scroll-progress" aria-hidden="true" />
      <div className="grain-overlay" />
      <div className="hero-scanline" aria-hidden="true" />
      <div className="hero-orb hero-orb-one" aria-hidden="true" />
      <div className="hero-orb hero-orb-two" aria-hidden="true" />
      <div className="hero-orb hero-orb-three" aria-hidden="true" />
      <div
        ref={mouseGlowRef}
        className="fixed w-[600px] h-[600px] pointer-events-none z-0 opacity-0 mix-blend-screen hidden lg:block"
        aria-hidden="true"
        id="mouse-glow-route"
      />

      <div className="site-content relative z-10 min-h-[100dvh]">
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur-xl">
          <div className="container-wide flex h-20 items-center justify-between gap-6">
            <Link href="/" className="group flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-[1rem] border border-primary/20 bg-primary/10 text-primary shadow-[0_0_34px_rgba(255,182,141,0.16)] transition-transform duration-300 group-hover:scale-[1.03]">
                <Sparkles className="size-5" />
              </span>
              <span className="leading-tight">
                <span className="mono-label block text-[0.72rem] text-primary">nozomiReborn</span>
                <span className="hidden text-xs text-white/45 sm:block">private launch surface</span>
              </span>
            </Link>

            <div className="hidden items-center gap-7 lg:flex">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 border-b-2 pb-1 text-sm transition-colors",
                      active
                        ? "border-primary text-primary"
                        : "border-transparent text-white/60 hover:border-primary/35 hover:text-primary",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-primary md:inline-flex">
                <span className="status-dot status-pulse bg-primary" />
                {eyebrow}
              </span>
              <Link
                href={primaryHref}
                className="magnetic-link tactile-btn inline-flex items-center justify-center gap-2 rounded-full border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_32px_rgba(255,182,141,0.24)]"
              >
                {primaryLabel}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </nav>

        <section className="relative overflow-hidden">
          <div className="container-wide grid min-h-[calc(100dvh-5rem)] items-center gap-14 py-12 lg:grid-cols-[1.04fr_0.96fr] lg:py-20">
            <div ref={heroCopyRef} className="hero-parallax relative z-10 max-w-2xl is-visible">
              <div className="reveal-element is-visible">
                <div className="eyebrow">{eyebrow}</div>
                <h1 className="mt-6 max-w-3xl text-balance font-[family-name:var(--font-display)] text-[clamp(3.35rem,8vw,7rem)] leading-[0.92] tracking-[-0.06em] text-white [text-shadow:0_0_40px_rgba(255,182,141,0.15)]">
                  {title}
                </h1>
                <p className="body-copy mt-6 max-w-xl text-lg sm:text-xl">{body}</p>
              </div>

              <div className="reveal-element is-visible mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={primaryHref}
                  className="magnetic-link tactile-btn inline-flex items-center justify-center gap-2 rounded-full border border-primary bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_32px_rgba(255,182,141,0.24)]"
                >
                  {primaryLabel}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href={secondaryHref}
                  className="magnetic-link inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/72 hover:border-primary/35 hover:text-white"
                >
                  {secondaryLabel}
                </Link>
              </div>

              <div className="reveal-element is-visible mt-10 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="glass-panel rounded-[1.1rem] px-4 py-4">
                    <div className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/42">
                      {stat.label}
                    </div>
                    <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div ref={heroVisualRef} className="hero-parallax relative">
              <div className="absolute -inset-8 rounded-[2.5rem] bg-[radial-gradient(circle_at_20%_20%,rgba(255,182,141,0.18),transparent_30%),radial-gradient(circle_at_80%_28%,rgba(255,182,141,0.12),transparent_28%),radial-gradient(circle_at_55%_74%,rgba(255,182,141,0.08),transparent_34%)] blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-primary/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)),rgba(8,11,18,0.92)] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                  <div className="relative min-h-[26rem] overflow-hidden rounded-[1.5rem] border border-white/8 bg-[radial-gradient(circle_at_50%_20%,rgba(255,182,141,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),rgba(8,11,18,0.72)] p-5">
                    <div className="float-slow absolute -left-14 top-8 h-40 w-40 rounded-full border border-primary/18 bg-primary/8 blur-2xl" />
                    <div className="float-slower absolute right-8 bottom-8 h-28 w-28 rounded-full border border-primary/12 bg-primary/6 blur-2xl" />

                    <div className="absolute right-6 top-6">
                      <svg
                        className="wireframe-sphere size-28 fill-none stroke-primary/30 [stroke-width:0.6]"
                        viewBox="0 0 100 100"
                        aria-hidden="true"
                      >
                        <circle cx="50" cy="50" r="45" />
                        <ellipse cx="50" cy="50" rx="45" ry="15" />
                        <ellipse cx="50" cy="50" rx="15" ry="45" />
                        <line x1="5" x2="95" y1="50" y2="50" />
                      </svg>
                      <svg
                        className="wireframe-sphere absolute -bottom-5 right-8 size-20 fill-none stroke-primary/18 [animation-delay:-18s] [stroke-width:0.6]"
                        viewBox="0 0 100 100"
                        aria-hidden="true"
                      >
                        <circle cx="50" cy="50" r="45" />
                        <ellipse cx="50" cy="50" rx="45" ry="15" />
                        <ellipse cx="50" cy="50" rx="15" ry="45" />
                        <line x1="5" x2="95" y1="50" y2="50" />
                      </svg>
                    </div>

                    <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                      <div>
                        <div className="mono-label text-[0.7rem] text-primary/90">route snapshot</div>
                        <div className="mt-4 max-w-sm rounded-[1.35rem] border border-primary/14 bg-black/30 p-4 backdrop-blur-xl">
                          <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-3">
                            <div>
                              <div className="text-sm font-semibold text-white">Animated route shell</div>
                              <div className="mt-1 text-xs text-white/48">
                                layered motion, clear hierarchy, one accent
                              </div>
                            </div>
                            <span className="status-dot status-pulse bg-primary" />
                          </div>

                          <div className="mt-4 space-y-3 text-sm text-white/70">
                            {notes.map((note) => (
                              <div key={note.title} className="border-b border-white/6 pb-2 last:border-b-0 last:pb-0">
                                <div className="text-white/45">{note.title}</div>
                                <div className="mt-1 text-white/78">{note.body}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {[
                          ["Typography", "Bodoni Moda"],
                          ["Body", "Hanken Grotesk"],
                          ["Code", "Space Mono"],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3"
                          >
                            <div className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/42">
                              {label}
                            </div>
                            <div className="mt-2 text-sm text-white/76">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="mono-label text-[0.7rem] text-primary/90">session log</div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-primary">
                        <span className="status-dot status-pulse bg-primary" />
                        stable
                      </div>
                    </div>

                    <div className="mt-5 rounded-[1.25rem] border border-white/8 bg-black/30 p-4 font-mono text-[0.8rem] leading-7 text-white/74">
                      {logLines.map((line) => (
                        <div key={line.command} className="mb-3 last:mb-0">
                          <div className="text-primary/80">{line.command}</div>
                          <div className="text-white/45">{line.detail}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-3">
                      <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-white/42">state</div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-white/74">
                          <BadgeCheck className="size-4 text-primary" />
                          page is ready for review
                        </div>
                      </div>
                      <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-white/42">focus</div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-white/74">
                          <Sparkles className="size-4 text-primary" />
                          desktop and mobile both stay legible
                        </div>
                      </div>
                      <div className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.18em] text-white/42">motion</div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-white/74">
                          <Waves className="size-4 text-primary" />
                          ambient, layered, and reduced-motion safe
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {children ? (
          <section className="border-t border-white/8 py-20">
            <div className="container-wide">{children}</div>
          </section>
        ) : null}

        <footer className="border-t border-white/8 py-8">
          <div className="container-wide flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
              © 2026 nozomiReborn
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/55">
              <Link href="/" className="transition-colors hover:text-white">
                Home
              </Link>
              <Link href="/stats" className="transition-colors hover:text-white">
                Stats
              </Link>
              <Link href="/portfolio" className="transition-colors hover:text-white">
                Portfolio
              </Link>
              <Link href="/badscripthub" className="transition-colors hover:text-white">
                BadScriptHub
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
