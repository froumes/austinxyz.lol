"use client"

// Public, read-only stats dashboard for the TWM Hypixel SkyBlock flipping
// bot.  Data is fetched from `/api/twm/stats/<slot_id>`, where `slot_id` is
// an unguessable identifier the bot generated and saved on its first
// "Share Stats" click — no env vars, no manual provisioning.
//
// The page is a single static export (compatible with `output: 'export'`),
// reads the slot id from `window.location.search` (`?s=<slot_id>`) so we
// don't need a dynamic route segment, and degrades gracefully when:
//   • the link is invalid          → "share link not valid" panel
//   • the bot has not pushed yet    → "waiting for first snapshot" panel
//   • the bot stops pushing         → KV TTL clears the entry, page shows
//                                     the "waiting" state again until the
//                                     next push lands

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowLeft,
  Activity,
  Coins,
  Gauge,
  Hammer,
  ShoppingBag,
  Timer,
  TrendingUp,
} from "lucide-react"
import type { ProfitPoint, PublicShareStats } from "@/lib/twm"

interface ApiResponse extends PublicShareStats {
  /** Server-edge timestamp of the most recent push, in unix seconds. */
  received_at_unix: number
}

interface ApiEmpty {
  empty: true
}

type ApiPayload = ApiResponse | ApiEmpty

type FetchState =
  | { status: "loading" }
  | { status: "ready"; data: ApiResponse }
  | { status: "waiting"; lastError?: string }
  | { status: "invalid" }
  | { status: "error"; message: string }

const POLL_MS = 15_000

const COIN_FORMATTER = new Intl.NumberFormat("en-US")

function formatCoins(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  const sign = value < 0 ? "-" : ""
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(2)}B`
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(2)}k`
  return `${sign}${COIN_FORMATTER.format(Math.round(abs))}`
}

function formatCoinsExact(value: number): string {
  return COIN_FORMATTER.format(Math.round(value))
}

function formatDuration(secs: number): string {
  if (!secs || secs < 0) return "0s"
  const s = Math.floor(secs)
  const days = Math.floor(s / 86400)
  const hours = Math.floor((s % 86400) / 3600)
  const mins = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  if (mins > 0) return `${mins}m ${seconds}s`
  return `${seconds}s`
}

function timeAgo(unixSecs: number, nowMs: number): string {
  const diff = Math.max(0, Math.floor(nowMs / 1000) - unixSecs)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

interface ChartRow {
  t: number
  ah: number
  bz: number
  total: number
}

/**
 * Merge the AH and BZ point series onto a single timeline for stacked-area
 * rendering.  For any timestamp we carry forward the most recent observed
 * value of whichever side has not changed yet, so the "Total" line tracks
 * the true sum at every visible point instead of jittering.
 */
function buildChartRows(ahPts: ProfitPoint[], bzPts: ProfitPoint[]): ChartRow[] {
  const timestamps = new Set<number>()
  for (const [t] of ahPts) timestamps.add(t)
  for (const [t] of bzPts) timestamps.add(t)
  const sorted = Array.from(timestamps).sort((a, b) => a - b)
  const ahMap = new Map(ahPts.map(([t, v]) => [t, v]))
  const bzMap = new Map(bzPts.map(([t, v]) => [t, v]))
  let lastAh = ahPts.length > 0 ? ahPts[0][1] : 0
  let lastBz = bzPts.length > 0 ? bzPts[0][1] : 0
  return sorted.map((t) => {
    if (ahMap.has(t)) lastAh = ahMap.get(t) as number
    if (bzMap.has(t)) lastBz = bzMap.get(t) as number
    return { t: t * 1000, ah: lastAh, bz: lastBz, total: lastAh + lastBz }
  })
}

/**
 * Read the slot id from the URL.  The bot hands out links of the form
 * `https://austinxyz.lol/twm?s=<slot_id>`; the slot id is the only thing
 * needed to identify which bot's stats this page should display.
 */
function getSlotFromQuery(): string {
  if (typeof window === "undefined") return ""
  const params = new URLSearchParams(window.location.search)
  return params.get("s") || ""
}

export default function TwmStatsPage() {
  const [state, setState] = useState<FetchState>({ status: "loading" })
  const [now, setNow] = useState<number>(() => Date.now())
  const [slotId, setSlotId] = useState<string>("")

  // Resolve the slot id once on mount.  We do not put it into React state
  // from a useEffect-less initializer because window is undefined during
  // the static-export pre-render.
  useEffect(() => {
    setSlotId(getSlotFromQuery())
  }, [])

  // Re-render once a second so "X seconds ago" labels stay live without
  // re-fetching from KV every second.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (slotId === "") {
      // Wait until the first effect resolves the slot id; if it stays
      // empty after a microtask we'll show the invalid-link panel.
      const id = setTimeout(() => {
        if (getSlotFromQuery() === "") setState({ status: "invalid" })
      }, 50)
      return () => clearTimeout(id)
    }

    let cancelled = false

    async function fetchOnce() {
      try {
        const resp = await fetch(
          `/api/twm/stats/${encodeURIComponent(slotId)}`,
          { cache: "no-store" },
        )
        if (cancelled) return
        if (resp.status === 404) {
          setState({ status: "invalid" })
          return
        }
        if (!resp.ok) {
          setState({ status: "error", message: `HTTP ${resp.status}` })
          return
        }
        const data = (await resp.json()) as ApiPayload
        if ("empty" in data && data.empty) {
          setState({ status: "waiting" })
          return
        }
        setState({ status: "ready", data: data as ApiResponse })
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : "Network error"
        // Only surface as a hard error if we have no good data yet — once
        // we've shown a snapshot, transient blips just mean "stale".
        setState((prev) => {
          if (prev.status === "ready") return prev
          return { status: "error", message }
        })
      }
    }

    fetchOnce()
    const id = setInterval(fetchOnce, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [slotId])

  const data = state.status === "ready" ? state.data : null
  const sessionRows = useMemo(
    () => (data ? buildChartRows(data.session_ah_points, data.session_bz_points) : []),
    [data],
  )
  const allTimeRows = useMemo(
    () =>
      data ? buildChartRows(data.all_time_ah_points, data.all_time_bz_points) : [],
    [data],
  )
  const ageSeconds = data
    ? Math.max(0, Math.floor(now / 1000) - data.received_at_unix)
    : null
  const isStale = ageSeconds !== null && ageSeconds > 90

  return (
    <div className="min-h-screen relative bg-[radial-gradient(800px_400px_at_10%_0%,rgba(255,122,144,0.12),transparent),radial-gradient(800px_400px_at_90%_100%,rgba(122,144,255,0.12),transparent)] text-white">
      <header className="sticky top-0 z-10 backdrop-blur-md border-b border-white/10 bg-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-neutral-400">
              TWM public stats
            </span>
            {data ? (
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
                  isStale
                    ? "border-rose-400/40 bg-rose-400/10 text-rose-200"
                    : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                }`}
                title={`Snapshot received ${timeAgo(data.received_at_unix, now)}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isStale ? "bg-rose-400" : "bg-emerald-400 animate-pulse"
                  }`}
                />
                {isStale ? "Stale" : "Live"}
                <span className="text-neutral-400">
                  · {timeAgo(data.received_at_unix, now)}
                </span>
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {state.status === "invalid" ? (
          <EmptyPanel
            title="Share link not valid"
            body="This link has either expired, been revoked, or was never issued. Ask the operator for a fresh one."
          />
        ) : state.status === "waiting" ? (
          <EmptyPanel
            title="Waiting for the first snapshot"
            body="The link is valid, but the bot hasn't pushed any stats yet. This page will refresh automatically once data arrives."
          />
        ) : state.status === "error" && !data ? (
          <EmptyPanel title="Could not load stats" body={state.message} />
        ) : null}

        {data ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <KpiTile
                label="Session profit"
                value={`${formatCoins(data.session_total)} coins`}
                tone={data.session_total >= 0 ? "pos" : "neg"}
                sub={`AH ${formatCoins(data.session_ah_total)} · BZ ${formatCoins(data.session_bz_total)}`}
                icon={<TrendingUp className="w-4 h-4" />}
              />
              <KpiTile
                label="All-time profit"
                value={`${formatCoins(data.all_time_total)} coins`}
                tone={data.all_time_total >= 0 ? "pos" : "neg"}
                sub={`AH ${formatCoins(data.all_time_ah_total)} · BZ ${formatCoins(data.all_time_bz_total)}`}
                icon={<Coins className="w-4 h-4" />}
              />
              <KpiTile
                label="Profit / hour"
                value={`${formatCoins(data.session_per_hour)} /hr`}
                tone={data.session_per_hour >= 0 ? "pos" : "neg"}
                sub="Session average"
                icon={<Gauge className="w-4 h-4" />}
              />
              <KpiTile
                label="Uptime"
                value={formatDuration(data.session_uptime_seconds)}
                sub="Current session"
                icon={<Timer className="w-4 h-4" />}
              />
              <KpiTile
                label="Active AH"
                value={String(data.active_auctions_count)}
                sub="Currently listed"
                icon={<Hammer className="w-4 h-4" />}
              />
              <KpiTile
                label="Active BZ orders"
                value={String(data.active_bazaar_orders_count)}
                sub="Open buy + sell"
                icon={<ShoppingBag className="w-4 h-4" />}
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Session profit" subtitle="Since process start" rows={sessionRows} />
              <ChartCard
                title="All-time profit"
                subtitle="Persisted across restarts"
                rows={allTimeRows}
              />
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-white">
                  <Activity className="w-5 h-5" />
                  <h3 className="font-semibold">Recent realized AH flips</h3>
                </div>
                <span className="text-xs text-neutral-400">
                  Last {data.recent_flips.length} flips
                </span>
              </div>
              <FlipsTable flips={data.recent_flips} now={now} />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 text-white">
                  <div className="flex items-center gap-3">
                    <Hammer className="w-5 h-5" />
                    <h3 className="font-semibold">Active auctions</h3>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {data.active_auctions.length} listed
                  </span>
                </div>
                <ActiveAuctionsTable rows={data.active_auctions} />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4 text-white">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5" />
                    <h3 className="font-semibold">Active Bazaar orders</h3>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {data.active_bazaar_orders.length} open
                  </span>
                </div>
                <BazaarOrdersTable rows={data.active_bazaar_orders} />
              </div>
            </section>
          </>
        ) : null}

        <footer className="text-center text-xs text-neutral-500 pt-4">
          Read-only public view · auto-refresh every 15 seconds · powered by TWM
        </footer>
      </main>
    </div>
  )
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-12 text-center shadow-xl">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-neutral-400 max-w-md mx-auto">{body}</p>
    </div>
  )
}

function KpiTile({
  label,
  value,
  sub,
  tone,
  icon,
}: {
  label: string
  value: string
  sub?: string
  tone?: "pos" | "neg"
  icon?: React.ReactNode
}) {
  const valueColor =
    tone === "pos" ? "text-emerald-300" : tone === "neg" ? "text-rose-300" : "text-white"
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-xl">
      <div className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-wide mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
      {sub ? <div className="mt-1 text-xs text-neutral-500">{sub}</div> : null}
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  rows,
}: {
  title: string
  subtitle: string
  rows: ChartRow[]
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-semibold text-white">{title}</h3>
        <span className="text-xs text-neutral-400">{subtitle}</span>
      </div>
      <div className="h-[280px]">
        {rows.length === 0 ? (
          <div className="h-full flex items-center justify-center text-neutral-500 text-sm">
            No data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="ahGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFAA7A" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#FFAA7A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bzGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7AFFAA" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#7AFFAA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#303030" />
              <XAxis
                dataKey="t"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(t: number) => {
                  const d = new Date(t)
                  return `${d.getHours().toString().padStart(2, "0")}:${d
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")}`
                }}
                tick={{ fill: "#999", fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: "#999", fontSize: 12 }}
                tickFormatter={(v: number) => formatCoins(v)}
                width={60}
              />
              <Tooltip
                wrapperStyle={{ pointerEvents: "none" }}
                contentStyle={{
                  background: "rgba(17,17,17,0.95)",
                  border: "1px solid #303030",
                  color: "#ddd",
                }}
                itemStyle={{ color: "#ddd" }}
                labelStyle={{ color: "#aaa" }}
                labelFormatter={(t: number) => new Date(t).toLocaleString()}
                formatter={(v: number, name: string) => [
                  `${formatCoinsExact(v)} coins`,
                  name === "ah" ? "AH" : name === "bz" ? "BZ" : "Total",
                ]}
              />
              <Legend
                wrapperStyle={{ color: "#bbb" }}
                formatter={(v: string) =>
                  v === "ah" ? "AH" : v === "bz" ? "BZ" : "Total"
                }
              />
              <Area
                type="monotone"
                dataKey="ah"
                stroke="#FFAA7A"
                fill="url(#ahGrad)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="bz"
                stroke="#7AFFAA"
                fill="url(#bzGrad)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="rgba(232,243,239,0.85)"
                fill="transparent"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

function FlipsTable({
  flips,
  now,
}: {
  flips: PublicShareStats["recent_flips"]
  now: number
}) {
  if (flips.length === 0) {
    return (
      <div className="text-center text-sm text-neutral-500 py-8">
        No realized flips yet.
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-neutral-400 text-xs uppercase tracking-wide">
            <th className="text-left py-2 pr-3">When</th>
            <th className="text-left py-2 pr-3">Item</th>
            <th className="text-right py-2 px-3">Buy</th>
            <th className="text-right py-2 px-3">Sell</th>
            <th className="text-right py-2 px-3">Profit</th>
            <th className="text-right py-2 pl-3">Time to sell</th>
          </tr>
        </thead>
        <tbody>
          {flips.map((f, i) => {
            const profitColor =
              f.profit > 0
                ? "text-emerald-300"
                : f.profit < 0
                  ? "text-rose-300"
                  : "text-neutral-400"
            return (
              <tr key={`${f.sold_at_unix}-${i}`} className="border-t border-white/5">
                <td className="py-2 pr-3 text-neutral-400">
                  {timeAgo(f.sold_at_unix, now)}
                </td>
                <td className="py-2 pr-3 max-w-[260px] truncate" title={f.item_name}>
                  {f.item_name}
                </td>
                <td className="py-2 px-3 text-right tabular-nums">
                  {formatCoins(f.buy_price)}
                </td>
                <td className="py-2 px-3 text-right tabular-nums">
                  {formatCoins(f.sell_price)}
                </td>
                <td className={`py-2 px-3 text-right tabular-nums ${profitColor}`}>
                  {f.profit > 0 ? "+" : ""}
                  {formatCoins(f.profit)}
                </td>
                <td className="py-2 pl-3 text-right text-neutral-400 tabular-nums">
                  {formatDuration(f.time_to_sell_secs)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ActiveAuctionsTable({
  rows,
}: {
  rows: PublicShareStats["active_auctions"]
}) {
  if (rows.length === 0) {
    return (
      <div className="text-center text-sm text-neutral-500 py-8">
        No active auctions.
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-neutral-400 text-xs uppercase tracking-wide">
            <th className="text-left py-2 pr-3">Item</th>
            <th className="text-right py-2 px-3">Price</th>
            <th className="text-right py-2 pl-3">Time left</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a, i) => {
            const price = a.starting_bid > 0 ? a.starting_bid : a.highest_bid
            return (
              <tr key={`${a.item_name}-${i}`} className="border-t border-white/5">
                <td className="py-2 pr-3 max-w-[260px] truncate" title={a.item_name}>
                  {a.item_name}
                  {a.bin ? (
                    <span className="ml-2 text-xs text-neutral-500">· BIN</span>
                  ) : null}
                </td>
                <td className="py-2 px-3 text-right tabular-nums">
                  {formatCoins(price)}
                </td>
                <td className="py-2 pl-3 text-right text-neutral-400 tabular-nums">
                  {a.time_remaining_seconds > 0
                    ? formatDuration(a.time_remaining_seconds)
                    : "—"}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function BazaarOrdersTable({
  rows,
}: {
  rows: PublicShareStats["active_bazaar_orders"]
}) {
  if (rows.length === 0) {
    return (
      <div className="text-center text-sm text-neutral-500 py-8">
        No active orders.
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-neutral-400 text-xs uppercase tracking-wide">
            <th className="text-left py-2 pr-3">Item</th>
            <th className="text-left py-2 px-3">Side</th>
            <th className="text-right py-2 px-3">Amount</th>
            <th className="text-right py-2 pl-3">Unit price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o, i) => (
            <tr key={`${o.item_name}-${i}`} className="border-t border-white/5">
              <td className="py-2 pr-3 max-w-[260px] truncate" title={o.item_name}>
                {o.item_name}
              </td>
              <td
                className={`py-2 px-3 ${
                  o.is_buy_order ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {o.is_buy_order ? "Buy" : "Sell"}
              </td>
              <td className="py-2 px-3 text-right tabular-nums">
                {COIN_FORMATTER.format(o.amount)}
              </td>
              <td className="py-2 pl-3 text-right tabular-nums">
                {formatCoins(o.price_per_unit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
