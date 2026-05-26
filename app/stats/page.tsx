"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BarChart3,
  Cpu,
  Gamepad2,
  Grid3X3,
  PieChart as PieIcon,
  Radio,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Reveal } from "@/components/reveal"

const COLORS = ["#74ebbe", "#d7bd73", "#80a8ff", "#ff8f70", "#c28cff", "#9ee493", "#d6e5df", "#8cd7c0"]

interface Dist {
  label: string
  count: number
  percentage: number
}

export default function StatsPage() {
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/stats")
        if (!res.ok) throw new Error("Failed to fetch stats")
        setData(await res.json())
        setError(null)
      } catch (e: any) {
        setError(e?.message || "Failed to load stats")
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const execs: Dist[] = useMemo(() => {
    if (!data?.executorDistribution) return []
    return data.executorDistribution.map((d: any) => ({ label: d.executor, count: d.count, percentage: d.percentage }))
  }, [data])

  const targets: Dist[] = useMemo(() => {
    if (!data?.targetDistribution) return []
    return data.targetDistribution.map((d: any) => ({ label: d.label, count: d.count, percentage: d.percentage }))
  }, [data])

  const dayOfWeek = data?.dayOfWeekDistribution || []

  const heatmap = useMemo(() => {
    if (!data?.executorTargetMatrix || !data?.targetDistribution || !data?.executorDistribution) return null
    const topExecs = data.executorDistribution.slice(0, 6).map((e: any) => e.executor)
    const topTargets = data.targetDistribution.slice(0, 10).map((t: any) => t.label)
    const matrix: number[][] = topExecs.map(() => topTargets.map(() => 0))
    topExecs.forEach((exec: string, i: number) => {
      const row = data.executorTargetMatrix[exec] || {}
      topTargets.forEach((target: string, j: number) => {
        matrix[i][j] = row[target] || 0
      })
    })
    let max = 0
    matrix.forEach((r) => r.forEach((v) => {
      if (v > max) max = v
    }))
    return { topExecs, topTargets, matrix, max }
  }, [data])

  return (
    <main className="site-shell">
      <div className="site-content">
        <header className="container-wide flex items-center justify-between py-6">
          <Link href="/" className="magnetic-link inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm text-white/72 hover:text-white">
            <ArrowLeft className="size-4" />
            Home
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Radio className="size-3.5" />
            live telemetry
          </div>
        </header>

        <section className="container-wide pb-12 pt-12 lg:pb-16 lg:pt-20">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <div>
                <span className="eyebrow">BadScriptHub statistics</span>
                <h1 className="display-title mt-7 max-w-5xl text-6xl sm:text-7xl lg:text-8xl xl:text-[7.5rem]">
                  Anonymous usage, cleaned up.
                </h1>
              </div>
              <p className="body-copy max-w-2xl text-lg">
                A read-only view of execution volume, executor spread, target concentration, and weekly patterns.
                The data is the same endpoint as before, presented with a calmer dashboard frame.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="container-wide grid gap-5 pb-8 md:grid-cols-3">
          <KpiCard icon={<BarChart3 className="size-5" />} label="Total executions" value={loading ? "-" : (data?.totalExecutions ?? 0).toLocaleString()} />
          <KpiCard icon={<Cpu className="size-5" />} label="Top executor" value={loading ? "-" : execs[0]?.label || "Unknown"} sub={execs[0] ? `${execs[0].count.toLocaleString()} / ${execs[0].percentage.toFixed(1)}%` : "No data"} />
          <KpiCard icon={<Gamepad2 className="size-5" />} label="Top target" value={loading ? "-" : targets[0]?.label || "Unknown"} sub={targets[0] ? `${targets[0].count.toLocaleString()} / ${targets[0].percentage.toFixed(1)}%` : "No data"} />
        </section>

        <section className="container-wide grid gap-5 pb-24">
          {error ? (
            <div className="glass-panel rounded-[2rem] p-8 text-center text-sm text-white/62">{error}</div>
          ) : null}

          <Reveal>
            <Panel title="Executors" icon={<PieIcon className="size-5" />}>
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={execs} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={118} innerRadius={58} paddingAngle={2}>
                      {execs.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      wrapperStyle={{ pointerEvents: "none" }}
                      contentStyle={{ background: "rgba(7,16,15,0.96)", border: "1px solid rgba(255,255,255,0.12)", color: "#e9f5f0", borderRadius: 16 }}
                      formatter={(v: any, _n: any, p: any) => [`${Number(v).toLocaleString()} executions`, p?.payload?.label]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </Reveal>

          <Reveal delay={80}>
            <Panel title="Executions by day" icon={<BarChart3 className="size-5" />}>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayOfWeek.map((d: any) => ({ ...d, label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.day] }))} margin={{ top: 10, right: 10, left: 4, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="label" tick={{ fill: "rgba(238,246,242,0.55)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "rgba(238,246,242,0.55)", fontSize: 12 }} />
                    <Tooltip
                      wrapperStyle={{ pointerEvents: "none" }}
                      contentStyle={{ background: "rgba(7,16,15,0.96)", border: "1px solid rgba(255,255,255,0.12)", color: "#e9f5f0", borderRadius: 16 }}
                      cursor={{ fill: "rgba(116,235,190,0.06)" }}
                      formatter={(v: any) => [`${Number(v).toLocaleString()} executions`, "Day"]}
                    />
                    <Bar dataKey="count" fill="#74ebbe" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal delay={120}>
              <Panel title="Top targets" icon={<Gamepad2 className="size-5" />}>
                <div className="divide-y divide-white/10">
                  {targets.slice(0, 20).map((target, i) => (
                    <div key={target.label + i} className="flex items-center justify-between gap-4 py-3 text-sm">
                      <span className="truncate text-white/72">{i + 1}. {target.label}</span>
                      <span className="shrink-0 font-mono text-white/42">{target.count.toLocaleString()} / {target.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </Reveal>

            <Reveal delay={160}>
              <Panel title="Executor x target heatmap" icon={<Grid3X3 className="size-5" />}>
                {heatmap ? (
                  <div className="overflow-x-auto text-xs">
                    <div className="grid min-w-[860px]" style={{ gridTemplateColumns: `160px repeat(${heatmap.topTargets.length}, minmax(64px,1fr))` }}>
                      <div />
                      {heatmap.topTargets.map((target: string) => (
                        <div key={target} className="truncate px-2 py-2 text-white/54" title={target}>{target}</div>
                      ))}
                      {heatmap.topExecs.map((exec: string, i: number) => (
                        <React.Fragment key={exec}>
                          <div className="truncate px-2 py-3 text-white/70" title={exec}>{exec}</div>
                          {heatmap.matrix[i].map((value: number, j: number) => {
                            const intensity = heatmap.max > 0 ? value / heatmap.max : 0
                            return (
                              <div
                                key={`${i}-${j}`}
                                className="border border-white/8 px-2 py-3 text-center font-mono text-white/70"
                                style={{ background: `rgba(116,235,190,${0.04 + intensity * 0.56})` }}
                                title={`${value.toLocaleString()} executions`}
                              >
                                {value > 0 ? value : ""}
                              </div>
                            )
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-14 text-center text-sm text-white/42">No matrix data yet.</div>
                )}
              </Panel>
            </Reveal>
          </div>
        </section>
      </div>
    </main>
  )
}

function KpiCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <Reveal asChild>
      <div className="glass-panel rounded-[1.7rem] p-5">
        <div className="flex items-center gap-3 text-primary">
          {icon}
          <span className="text-xs font-semibold uppercase tracking-[0.16em]">{label}</span>
        </div>
        <div className="mt-5 truncate text-3xl font-black text-white">{value}</div>
        {sub ? <div className="mt-2 text-sm text-white/42">{sub}</div> : null}
      </div>
    </Reveal>
  )
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="glass-panel rounded-[2rem] p-5 md:p-6">
      <div className="mb-5 flex items-center gap-3 text-white">
        <span className="text-primary">{icon}</span>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      {children}
    </section>
  )
}
