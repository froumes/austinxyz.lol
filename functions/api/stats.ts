import { buildStatsResponse, createEmptyStats } from "../../lib/stats"

export async function onRequestGet(context: any) {
  const { env } = context

  try {
    if (!env.TELEMETRY_KV) {
      return new Response(JSON.stringify(createEmptyStats()), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const existing = await env.TELEMETRY_KV.get("telemetry:events", "json")

    return new Response(JSON.stringify(buildStatsResponse(existing)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

