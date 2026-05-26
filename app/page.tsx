import Link from "next/link"
import {
  ArrowUpRight,
  BarChart3,
  Code2,
  Cpu,
  Github,
  Radio,
  TerminalSquare,
} from "lucide-react"
import { LogoSimple } from "@/components/logo"
import { Reveal } from "@/components/reveal"

const routes = [
  {
    href: "/portfolio",
    label: "Portfolio",
    kicker: "Selected builds",
    description: "A compact index of projects, experiments, and tooling that are still being maintained.",
    icon: Code2,
    stat: "15+",
    meta: "projects",
  },
  {
    href: "/badscripthub",
    label: "BadScriptHub",
    kicker: "Product page",
    description: "Access links, live usage stats, and an interactive preview for the script hub.",
    icon: TerminalSquare,
    stat: "11+",
    meta: "scripts",
  },
  {
    href: "/stats",
    label: "Usage stats",
    kicker: "Telemetry",
    description: "Anonymous execution trends across executors, targets, and weekly activity.",
    icon: BarChart3,
    stat: "live",
    meta: "dashboard",
  },
]

const signals = [
  { label: "Frontend", value: "Next.js / React", icon: Cpu },
  { label: "Automation", value: "Roblox tooling", icon: TerminalSquare },
  { label: "Dashboards", value: "Charts + telemetry", icon: Radio },
]

export default function HomePage() {
  return (
    <main className="site-shell">
      <div className="site-content">
        <header className="container-wide flex items-center justify-between py-6">
          <Link href="/" className="group flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl glass-panel">
              <LogoSimple size={25} alt="austinxyz.lol logo" className="transition-transform duration-700 group-hover:scale-110" />
            </span>
            <span className="text-sm font-semibold tracking-wide text-white/90">
              austinxyz<span className="text-primary">.lol</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.045] p-1 md:flex">
            {["portfolio", "badscripthub", "stats"].map((item) => (
              <Link
                key={item}
                href={`/${item}`}
                className="rounded-full px-4 py-2 text-sm text-white/62 transition-colors duration-500 hover:bg-white/8 hover:text-white"
              >
                {item}
              </Link>
            ))}
          </nav>
          <a
            href="https://github.com/froumes"
            target="_blank"
            rel="noopener noreferrer"
            className="magnetic-link inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm font-medium text-white/80 hover:border-primary/35 hover:bg-primary/10 hover:text-white"
          >
            <Github className="size-4" />
            GitHub
          </a>
        </header>

        <section className="container-wide grid min-h-[calc(100dvh-92px)] items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <Reveal>
            <div className="max-w-4xl">
              <span className="eyebrow">developer / builder / dashboard enjoyer</span>
              <h1 className="display-title mt-7 text-6xl sm:text-7xl lg:text-8xl xl:text-[7rem]">
                Useful systems, tuned sharp.
              </h1>
              <p className="body-copy mt-8 max-w-2xl text-lg md:text-xl">
                I build web surfaces, automation tools, and public dashboards with a bias toward fast feedback,
                clean interfaces, and details that do not get in the way.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/portfolio"
                  className="magnetic-link group inline-flex items-center justify-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
                >
                  View work
                  <span className="grid size-8 place-items-center rounded-full bg-black/12 transition-transform duration-700 group-hover:translate-x-1 group-hover:-translate-y-0.5">
                    <ArrowUpRight className="size-4" />
                  </span>
                </Link>
                <Link
                  href="/badscripthub"
                  className="magnetic-link inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.055] px-5 py-3 text-sm font-semibold text-white/82 hover:border-primary/35 hover:bg-primary/10 hover:text-white"
                >
                  Open BadScriptHub
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
              <div className="hero-orbit absolute -right-6 -top-8 hidden h-28 w-28 rounded-[2rem] border border-primary/20 bg-primary/10 md:block" />
              <div className="glass-panel rounded-[2rem] p-2">
                <div className="relative overflow-hidden rounded-[1.55rem] border border-white/10 bg-[#07100f]/90 p-6 md:p-8">
                  <div className="absolute inset-x-0 top-0 h-px scanline" />
                  <div className="flex items-center justify-between border-b border-white/10 pb-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">live surface</p>
                      <h2 className="mt-2 text-2xl font-bold text-white">Control room</h2>
                    </div>
                    <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      online
                    </div>
                  </div>

                  <div className="grid gap-3 py-6">
                    {signals.map((signal, index) => {
                      const Icon = signal.icon
                      return (
                        <div
                          key={signal.label}
                          className="quiet-panel magnetic-link flex items-center gap-4 rounded-2xl p-4"
                          style={{ transitionDelay: `${index * 60}ms` }}
                        >
                          <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                            <Icon className="size-5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-white">{signal.label}</p>
                            <p className="text-sm text-white/48">{signal.value}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="rounded-2xl bg-white/[0.035] p-4 font-mono text-xs text-white/64">
                    <div className="flex items-center gap-2 text-primary">
                      <span className="size-2 rounded-full bg-primary" />
                      npm run build
                    </div>
                    <div className="mt-4 space-y-2">
                      <p>compiled routes: portfolio, stats, scripts</p>
                      <p>motion: transform + opacity</p>
                      <p>palette: mineral black / green signal</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="container-wide pb-20">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {routes.map((route, index) => {
              const Icon = route.icon
              return (
                <Reveal key={route.href} delay={index * 80} asChild>
                  <Link
                    href={route.href}
                    className="magnetic-link group quiet-panel flex min-h-[260px] flex-col rounded-[1.7rem] p-5 hover:border-primary/30 hover:bg-primary/[0.065]"
                  >
                    <div className="flex items-start justify-between">
                      <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.055] text-primary transition-transform duration-700 group-hover:scale-105">
                        <Icon className="size-5" />
                      </span>
                      <ArrowUpRight className="size-5 text-white/32 transition-all duration-700 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
                    </div>
                    <div className="mt-auto">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/75">{route.kicker}</p>
                      <h2 className="mt-3 text-2xl font-bold text-white">{route.label}</h2>
                      <p className="body-copy mt-3 text-sm">{route.description}</p>
                      <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-4">
                        <span className="text-3xl font-black text-white">{route.stat}</span>
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/36">{route.meta}</span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
