import { NextResponse } from "next/server"
import { buildStatsResponse, createEmptyStats } from "@/lib/stats"

// Required by Next.js 16 + `output: 'export'`.  This file is a dev-mode
// fallback only — at runtime on Cloudflare Pages the matching Function in
// `functions/api/stats.ts` intercepts `/api/stats` before any static asset
// is served, so the build-time response generated here is never actually
// returned to a browser in production.
export const dynamic = "force-static"

function resolveTelemetrySource() {
  const globalKv = (globalThis as { TELEMETRY_KV?: { get: (key: string, type?: string) => Promise<unknown> } }).TELEMETRY_KV
  return globalKv
}

export async function GET() {
  try {
    const kv = resolveTelemetrySource()

    if (kv) {
      const events = await kv.get("telemetry:events", "json")
      return NextResponse.json(buildStatsResponse(events))
    }

    const fallbackJson = process.env.TELEMETRY_EVENTS_JSON
    if (fallbackJson) {
      return NextResponse.json(buildStatsResponse(JSON.parse(fallbackJson)))
    }

    return NextResponse.json(createEmptyStats())
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
