"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Check,
  Copy,
  Gamepad2,
  KeyRound,
  Radio,
  ShieldCheck,
  TerminalSquare,
  BarChart3,
  Cpu,
} from "lucide-react"
import { AppFrame, Panel, StatTile, StatusBadge } from "@/components/dev-os-frame"
import { Reveal } from "@/components/reveal"

const loadstring = 'loadstring(game:HttpGet("https://raw.githubusercontent.com/froumes/austinxyz.lol/main/badscripthub/loader.lua"))()'

const scripts = [
  { name: "Anime Eternal", type: "farm loop", status: "active" },
  { name: "Clash Clicker", type: "progression", status: "active" },
  { name: "Prospecting", type: "collection", status: "active" },
  { name: "Hunty Zombie", type: "combat", status: "active" },
  { name: "Steal a Brainrot", type: "utility", status: "active" },
  { name: "Multi-game tools", type: "shared systems", status: "maintained" },
]

const steps = [
  { icon: KeyRound, title: "Get a key", body: "Use either access route and finish the short verification." },
  { icon: Copy, title: "Copy loader", body: "Paste the loadstring into your executor after verification." },
  { icon: TerminalSquare, title: "Run script", body: "Launch BadScriptHub and pick the supported game module." },
]

type StatsResponse = {
  totalExecutions: number
  executorDistribution: { executor: string; count: number; percentage: number }[]
  targetDistribution: { label: string; count: number; percentage: number }[]
  dayOfWeekDistribution: { day: number; count: number }[]
}

export default function BadScriptHubPage() {
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/stats")
        if (!res.ok) throw new Error("Failed to fetch stats")
        setStats(await res.json())
      } catch {
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const topExecutors = useMemo(() => stats?.executorDistribution.slice(0, 3) ?? [], [stats])
  const topTargets = useMemo(() => stats?.targetDistribution.slice(0, 5) ?? [], [stats])
  const topDays = useMemo(() => {
    if (!stats) return []
    return stats.dayOfWeekDistribution
      .map((d) => ({ label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.day], count: d.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
  }, [stats])

  async function copyLoadstring() {
    await navigator.clipboard.writeText(loadstring)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <AppFrame
      active="/badscripthub"
      footerMetrics={["austinxyz.lol // BUILD_REV: 0x44A2", "ENV: PROD", "LATENCY: 24ms"]}
      sidebar={
        <div className="grid gap-4">
          <Panel title="Launch notes" eyebrow="launcher" action={<StatusBadge label="core online" />}>
            <p className="body-copy text-sm">
              Copy the loader, choose a key route, and run the active module. The page is stripped down to the launch path and live usage context.
            </p>
          </Panel>

          <Panel title="Access routes" eyebrow="keys">
            <div className="space-y-2">
              <a
                href="https://ads.luarmor.net/get_key?for=badscripthub-rKXsLWcPlUCN"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white/70 transition-colors hover:border-primary/30 hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <KeyRound className="size-4 text-primary" />
                  Linkvertise
                </span>
                <ArrowUpRight className="size-4" />
              </a>
              <a
                href="https://ads.luarmor.net/get_key?for=badscripthub-makxYXFZnUta"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white/70 transition-colors hover:border-primary/30 hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <ShieldCheck className="size-4 text-primary" />
                  Work.ink
                </span>
                <ArrowUpRight className="size-4" />
              </a>
            </div>
          </Panel>
        </div>
      }
    >
      <section className="container-wide grid gap-6 pb-16 pt-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(380px,0.72fr)] lg:items-center lg:pt-14">
        <Reveal>
          <div>
            <StatusBadge label="script hub / keys / loader" />
            <h1 className="display-title mt-6 text-4xl sm:text-5xl xl:text-[4.8rem]">
              BadScriptHub, stripped down to launch.
            </h1>
            <p className="body-copy mt-6 max-w-2xl text-base sm:text-lg">
              A cleaner access page for the scripts: get a key, copy the loader, open the full stats dashboard, and
              see what is currently supported without a fake interface sitting in the way.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ["11+", "scripts"],
                ["2", "key routes"],
                ["live", "telemetry"],
              ].map(([value, label]) => (
                <div key={label} className="panel rounded-[0.375rem] p-4">
                  <div className="font-mono text-[1.6rem] font-bold tracking-[-0.04em] text-foreground">{value}</div>
                  <div className="mt-2 mono-label text-[11px] text-white/38">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <Panel title="Initialize payload" eyebrow="launch kit" action={<TerminalSquare className="size-4 text-primary" />}>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="quiet-panel rounded-[0.35rem] p-3">
                  <div className="mono-label text-[11px] text-white/42">TARGET_ENV</div>
                  <div className="mt-2 text-sm text-foreground">PRODUCTION</div>
                </div>
                <div className="quiet-panel rounded-[0.35rem] p-3">
                  <div className="mono-label text-[11px] text-white/42">MEM_ALLOC</div>
                  <div className="mt-2 text-sm text-foreground">4096MB</div>
                </div>
                <div className="quiet-panel rounded-[0.35rem] p-3">
                  <div className="mono-label text-[11px] text-white/42">THREAD_CT</div>
                  <div className="mt-2 text-sm text-foreground">16</div>
                </div>
              </div>

              <pre className="max-h-[220px] overflow-x-auto border border-white/10 bg-[#07101f] p-4 font-mono text-[12px] leading-6 text-white/68">
                <code>{loadstring}</code>
              </pre>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <button
                  onClick={copyLoadstring}
                  className="magnetic-link tactile-btn inline-flex items-center justify-center gap-3 border border-primary bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copied loader" : "Copy loader"}
                </button>
                <Link
                  href="/stats"
                  className="magnetic-link inline-flex items-center justify-center gap-3 border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/72 hover:border-primary/35 hover:text-white"
                >
                  View stats
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
          </Panel>
        </Reveal>
      </section>

      <section className="container-wide pb-20">
        <Reveal>
          <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <StatusBadge label="supported modules" />
              <h2 className="section-title mt-5 text-3xl sm:text-4xl">Active scripts.</h2>
              <p className="body-copy mt-4 max-w-xl text-sm sm:text-base">
                The page reads like a launcher, not a mock app. Supported modules are listed directly so visitors can
                scan what is available before copying anything.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {scripts.map((script, index) => (
                <Reveal key={script.name} delay={index * 50} asChild>
                  <div className="panel magnetic-link rounded-[0.375rem] p-4 hover:border-primary/30 hover:bg-primary/[0.04]">
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid size-10 place-items-center border border-primary/20 bg-primary/10 text-primary">
                        <Gamepad2 className="size-4" />
                      </span>
                      <span className="border border-primary/20 bg-primary/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                        {script.status}
                      </span>
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-foreground">{script.name}</h3>
                    <p className="mt-2 text-sm text-white/46">{script.type}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-wide pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Reveal key={step.title} delay={index * 80} asChild>
                <div className="panel rounded-[0.375rem] p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="font-mono text-[11px] text-white/32">0{index + 1}</span>
                  </div>
                  <h3 className="mt-7 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="body-copy mt-3 text-sm">{step.body}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      <section className="container-wide pb-24">
        <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
          <Reveal>
            <div className="sticky top-24">
              <StatusBadge label="live telemetry" />
              <h2 className="section-title mt-5 text-3xl sm:text-4xl">Usage, readable at a glance.</h2>
              <p className="body-copy mt-4 text-sm sm:text-base">
                The live endpoint stays connected to the same API, framed as a secondary dashboard instead of
                competing with the launch actions.
              </p>

              <div className="mt-6 grid gap-3">
                <StatTile
                  icon={<BarChart3 className="size-4" />}
                  label="Total executions"
                  value={loading ? "—" : (stats?.totalExecutions ?? 0).toLocaleString()}
                />
                <StatTile
                  icon={<Cpu className="size-4" />}
                  label="Top executor"
                  value={loading ? "—" : topExecutors[0]?.executor || "Unknown"}
                />
                <StatTile
                  icon={<Radio className="size-4" />}
                  label="Top target"
                  value={loading ? "—" : topTargets[0]?.label || "Unknown"}
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <Panel title="Live telemetry" eyebrow="read only">
              {stats ? (
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {topDays.map((day) => (
                      <div key={day.label} className="quiet-panel rounded-[0.35rem] p-4">
                        <div className="mono-label text-[11px] text-white/42">{day.label}</div>
                        <div className="mt-3 font-mono text-2xl font-bold text-foreground">{day.count.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>

                  <div className="overflow-hidden border border-white/10">
                    <table className="w-full border-collapse text-left">
                      <thead className="bg-white/[0.03] font-mono text-[11px] uppercase tracking-[0.14em] text-white/42">
                        <tr>
                          <th className="px-4 py-3 font-normal">Target</th>
                          <th className="px-4 py-3 font-normal text-right">Count</th>
                          <th className="px-4 py-3 font-normal text-right">Share</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono text-[12px]">
                        {topTargets.map((target) => (
                          <tr key={target.label} className="border-t border-white/8 hover:bg-white/[0.03]">
                            <td className="px-4 py-3 text-white/72">{target.label}</td>
                            <td className="px-4 py-3 text-right text-foreground">{target.count.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-primary">{target.percentage.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-sm text-white/42">{loading ? "Loading statistics..." : "No statistics available yet."}</div>
              )}
            </Panel>
          </Reveal>
        </div>
      </section>
    </AppFrame>
  )
}
