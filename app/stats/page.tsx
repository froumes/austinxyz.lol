"use client"

import React, { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { ArrowLeft, BarChart3, Cpu, Gamepad2, PieChart as PieIcon, Sparkles } from "lucide-react"

const COLORS = ["#FF7A90", "#7A90FF", "#90FF7A", "#FF907A", "#7AFF90", "#FFAA7A", "#AA7AFF", "#7AFFAA", "#FF7AAA", "#AAFF7A"]

interface Dist { label: string; count: number; percentage: number }

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
        const json = await res.json()
        setData(json)
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

  const hourly = data?.hourlyDistribution || []

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur border-b border-neutral-800 bg-black/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-2 text-pink-300">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">BadScriptHub Statistics</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="flex items-center gap-3 mb-3 text-white"><BarChart3 className="w-5 h-5" /><h2 className="font-semibold">Total Executions</h2></div>
            <div className="text-3xl font-bold text-pink-300">{loading ? "—" : (data?.totalExecutions ?? 0).toLocaleString()}</div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="flex items-center gap-3 mb-3 text-white"><Cpu className="w-5 h-5" /><h2 className="font-semibold">Top Executor</h2></div>
            <div className="text-neutral-300 text-sm">{loading ? "—" : (execs[0]?.label || "Unknown")}</div>
            <div className="text-neutral-500 text-xs">{execs[0] ? `${execs[0].count.toLocaleString()} (${execs[0].percentage.toFixed(1)}%)` : "No data"}</div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="flex items-center gap-3 mb-3 text-white"><Gamepad2 className="w-5 h-5" /><h2 className="font-semibold">Top Target</h2></div>
            <div className="text-neutral-300 text-sm">{loading ? "—" : (targets[0]?.label || "Unknown")}</div>
            <div className="text-neutral-500 text-xs">{targets[0] ? `${targets[0].count.toLocaleString()} (${targets[0].percentage.toFixed(1)}%)` : "No data"}</div>
          </div>
        </div>

        {/* Executor distribution */}
        <section className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="flex items-center gap-3 mb-4 text-white"><PieIcon className="w-5 h-5" /><h3 className="font-semibold">Executors</h3></div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={execs} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={110} innerRadius={40}>
                    {execs.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any, n: any, p: any) => [`${Number(v).toLocaleString()} executions`, p?.payload?.label]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hourly distribution */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="flex items-center gap-3 mb-4 text-white"><BarChart3 className="w-5 h-5" /><h3 className="font-semibold">Executions by Hour</h3></div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourly} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#303030" />
                  <XAxis dataKey="hour" tick={{ fill: "#999", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#999", fontSize: 12 }} />
                  <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} executions`, "Hour"]} />
                  <Bar dataKey="count" fill="#FF7A90" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Unified Top Targets table */}
        <section className="grid lg:grid-cols-1 gap-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <div className="flex items-center gap-3 mb-3 text-white"><Gamepad2 className="w-5 h-5" /><h3 className="font-semibold">Top Targets (Games or Scripts)</h3></div>
            <div className="divide-y divide-neutral-800">
              {(targets.slice(0, 20)).map((t, i) => (
                <div key={t.label + i} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-neutral-300 truncate pr-3">{i + 1}. {t.label}</span>
                  <span className="text-neutral-400">{t.count.toLocaleString()} · {t.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
