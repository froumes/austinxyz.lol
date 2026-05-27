"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
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
import { AppFrame, Panel, StatTile, StatusBadge } from "@/components/dev-os-frame"
import { Reveal } from "@/components/reveal"

const COLORS = ["#57f1db", "#b9c8de", "#ffd1aa", "#80a8ff", "#ffb875", "#c28cff", "#9ee493", "#d6e5df"]

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
    matrix.forEach((row) => row.forEach((value) => {
      if (value > max) max = value
    }))

    return { topExecs, topTargets, matrix, max }
  }, [data])

  return (
    <AppFrame
      active="/stats"
      footerMetrics={["austinxyz.lol // BUILD_REV: 0x44A2", "ENV: PROD", "LATENCY: 24ms"]}
      sidebar={
        <div className="grid gap-4">
          <Panel title="Telemetry notes" eyebrow="read only">
            <p className="body-copy text-sm">
              Anonymous execution trends across executors, targets, and weekly activity. This page is intentionally dense and
              direct.
            </p>
          </Panel>

          <Panel title="System state" eyebrow="live" action={<StatusBadge label="online" />}>
            <div className="grid gap-2 text-sm text-white/54">
              <div className="flex items-center justify-between border-b border-white/10 py-2">
                <span>Polling</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">10s</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 py-2">
                <span>Region</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.12em]">US-EAST</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Endpoint</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.12em]">/api/stats</span>
              </div>
            </div>
          </Panel>
        </div>
      }
    >
      <section className="container-wide pb-8 pt-10 lg:pt-14">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <StatusBadge label="live telemetry" />
              <h1 className="display-title mt-5 text-4xl sm:text-5xl xl:text-[4.8rem]">
                Anonymous usage, cleaned up.
              </h1>
            </div>
            <p className="body-copy max-w-2xl text-base sm:text-lg">
              A read-only view of execution volume, executor spread, target concentration, and weekly patterns. The
              data is unchanged; the frame is quieter and more precise.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="container-wide grid gap-4 pb-8 md:grid-cols-3">
        <StatTile
          icon={<BarChart3 className="size-4" />}
          label="Total executions"
          value={loading ? "—" : (data?.totalExecutions ?? 0).toLocaleString()}
        />
        <StatTile
          icon={<Cpu className="size-4" />}
          label="Top executor"
          value={loading ? "—" : execs[0]?.label || "Unknown"}
          sub={execs[0] ? `${execs[0].count.toLocaleString()} / ${execs[0].percentage.toFixed(1)}%` : "No data"}
        />
        <StatTile
          icon={<Gamepad2 className="size-4" />}
          label="Top target"
          value={loading ? "—" : targets[0]?.label || "Unknown"}
          sub={targets[0] ? `${targets[0].count.toLocaleString()} / ${targets[0].percentage.toFixed(1)}%` : "No data"}
        />
      </section>

      <section className="container-wide grid gap-4 pb-24">
        {error ? (
          <div className="panel rounded-[0.375rem] p-6 text-sm text-destructive">{error}</div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal>
            <Panel title="Executors" eyebrow="distribution" action={<PieIcon className="size-4 text-primary" />}>
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={execs}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={118}
                      innerRadius={58}
                      paddingAngle={2}
                    >
                      {execs.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      wrapperStyle={{ pointerEvents: "none" }}
                      contentStyle={{
                        background: "rgba(7,16,31,0.96)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#e9f5f0",
                        borderRadius: 8,
                      }}
                      formatter={(v: any, _n: any, p: any) => [`${Number(v).toLocaleString()} executions`, p?.payload?.label]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </Reveal>

          <Reveal delay={80}>
            <Panel title="Executions by day" eyebrow="weekly rhythm" action={<Radio className="size-4 text-primary" />}>
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dayOfWeek.map((d: any) => ({
                      ...d,
                      label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.day],
                    }))}
                    margin={{ top: 10, right: 10, left: 4, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="label" tick={{ fill: "rgba(238,246,242,0.55)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "rgba(238,246,242,0.55)", fontSize: 12 }} />
                    <Tooltip
                      wrapperStyle={{ pointerEvents: "none" }}
                      contentStyle={{
                        background: "rgba(7,16,31,0.96)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#e9f5f0",
                        borderRadius: 8,
                      }}
                      cursor={{ fill: "rgba(87,241,219,0.06)" }}
                      formatter={(v: any) => [`${Number(v).toLocaleString()} executions`, "Day"]}
                    />
                    <Bar dataKey="count" fill="#57f1db" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </Reveal>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal delay={120}>
            <Panel title="Top targets" eyebrow="ranked list">
              <div className="divide-y divide-white/10">
                {targets.slice(0, 20).map((target, i) => (
                  <div key={target.label + i} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span className="truncate text-white/72">
                      {i + 1}. {target.label}
                    </span>
                    <span className="shrink-0 font-mono text-white/42">
                      {target.count.toLocaleString()} / {target.percentage.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </Reveal>

          <Reveal delay={160}>
            <Panel title="Executor x target heatmap" eyebrow="matrix view" action={<Grid3X3 className="size-4 text-primary" />}>
              {heatmap ? (
                <div className="overflow-x-auto text-xs">
                  <div
                    className="grid min-w-[860px]"
                    style={{ gridTemplateColumns: `160px repeat(${heatmap.topTargets.length}, minmax(64px,1fr))` }}
                  >
                    <div />
                    {heatmap.topTargets.map((target: string) => (
                      <div key={target} className="truncate px-2 py-2 text-white/54" title={target}>
                        {target}
                      </div>
                    ))}
                    {heatmap.topExecs.map((exec: string, i: number) => (
                      <React.Fragment key={exec}>
                        <div className="truncate px-2 py-3 text-white/70" title={exec}>
                          {exec}
                        </div>
                        {heatmap.matrix[i].map((value: number, j: number) => {
                          const intensity = heatmap.max > 0 ? value / heatmap.max : 0
                          return (
                            <div
                              key={`${i}-${j}`}
                              className="border border-white/8 px-2 py-3 text-center font-mono text-white/70"
                              style={{ background: `rgba(87,241,219,${0.04 + intensity * 0.56})` }}
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
    </AppFrame>
  )
}
