import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Code2,
  Cpu,
  Radio,
  TerminalSquare,
} from "lucide-react"
import { AppFrame, Panel, StatTile, StatusBadge } from "@/components/dev-os-frame"
import { Reveal } from "@/components/reveal"

const routes = [
  {
    href: "/portfolio",
    label: "Portfolio",
    kicker: "selected builds",
    description: "A compact index of projects, experiments, and tooling that are still being maintained.",
    icon: Code2,
    stat: "15+",
    meta: "projects",
  },
  {
    href: "/badscripthub",
    label: "BadScriptHub",
    kicker: "product page",
    description: "Access links, live usage stats, and an interactive preview for the script hub.",
    icon: TerminalSquare,
    stat: "11+",
    meta: "scripts",
  },
  {
    href: "/stats",
    label: "Usage stats",
    kicker: "telemetry",
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
    <AppFrame active="/" footerMetrics={["austinxyz.lol // BUILD_REV: 0x44A2", "LATENCY: 24ms", "UPTIME: 99.9%"]}>
      <section className="container-wide grid min-h-[calc(100dvh-8rem)] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <Reveal>
          <div className="max-w-3xl">
            <StatusBadge label="sys.ready // auth_success" />
            <p className="mono-label mt-5 text-[11px] text-white/42">SESSION_ID: 0x8F92A</p>
            <h1 className="display-title mt-6 text-5xl leading-[0.92] sm:text-6xl xl:text-[5.4rem]">
              Useful systems, tuned sharp.
            </h1>
            <p className="body-copy mt-7 max-w-2xl text-base sm:text-lg">
              I build web surfaces, automation tools, and telemetry dashboards with a bias toward fast feedback,
              clear state, and interfaces that stay out of the way.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/portfolio"
                className="magnetic-link tactile-btn inline-flex items-center justify-center gap-3 border border-primary bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                View work
                <ArrowUpRight className="size-4" />
              </Link>
              <Link
                href="/badscripthub"
                className="magnetic-link inline-flex items-center justify-center gap-3 border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/72 hover:border-primary/35 hover:text-white"
              >
                Open BadScriptHub
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <Panel
            title="Control room"
            eyebrow="live surface"
            action={<StatusBadge label="online" />}
            className="rounded-[0.375rem]"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {signals.map((signal) => {
                const Icon = signal.icon
                return (
                  <div key={signal.label} className="quiet-panel rounded-[0.375rem] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid size-10 place-items-center border border-primary/20 bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </div>
                    </div>
                    <p className="mt-8 text-sm font-semibold text-foreground">{signal.label}</p>
                    <p className="mt-1 text-sm text-white/46">{signal.value}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <StatTile label="Builds" value="15+" sub="maintained routes" />
              <StatTile label="Telemetry" value="live" sub="API-backed stats" />
              <StatTile label="Stack" value="Next" sub="TypeScript / React" />
            </div>

            <div className="mt-4 border border-white/10 bg-[#07101f] p-4 font-mono text-[12px] leading-6 text-white/62">
              <div className="flex items-center gap-2 text-primary">
                <span className="status-dot status-pulse bg-primary" />
                npm run build
              </div>
              <div className="mt-3 space-y-1">
                <p>compiled routes: portfolio, stats, scripts</p>
                <p>motion: transform + opacity</p>
                <p>palette: off-black / teal signal</p>
              </div>
            </div>
          </Panel>
        </Reveal>
      </section>

      <section className="container-wide pb-20">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {routes.map((route, index) => {
            const Icon = route.icon
            return (
              <Reveal key={route.href} delay={index * 80} asChild>
                <Link
                  href={route.href}
                  className="group panel magnetic-link flex min-h-[260px] flex-col rounded-[0.375rem] p-5 hover:border-primary/30 hover:bg-primary/[0.06]"
                >
                  <div className="flex items-start justify-between gap-6">
                    <span className="grid size-12 place-items-center border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <ArrowUpRight className="size-5 text-white/28 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <div className="mt-auto">
                    <p className="mono-label text-[11px] text-primary/78">{route.kicker}</p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{route.label}</h2>
                    <p className="body-copy mt-3 text-sm">{route.description}</p>
                    <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-4">
                      <span className="font-mono text-[1.85rem] font-bold tracking-[-0.04em] text-foreground">
                        {route.stat}
                      </span>
                      <span className="mono-label text-[11px] text-white/38">{route.meta}</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>
    </AppFrame>
  )
}
