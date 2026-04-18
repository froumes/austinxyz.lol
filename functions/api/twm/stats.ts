// Cloudflare Pages Function: serves the most recent stats snapshot stored
// in KV by /api/twm/push.  Gated by a viewer token configured in Cloudflare
// env so only people with the share link can read.
//
// We keep the wire format identical to what the bot pushed, plus an extra
// `received_at_unix` field so the page can show "last updated N seconds ago"
// using the trustworthy edge timestamp instead of the bot's clock.

import { TWM_KV_KEY, type StoredTwmStats } from "../../../lib/twm"

interface KVNamespaceLike {
  get: (key: string, type?: "json") => Promise<unknown>
}

interface StatsEnv {
  TELEMETRY_KV?: KVNamespaceLike
  /** Token required in the `?t=` query param. Configure as a Cloudflare env var. */
  TWM_VIEWER_TOKEN?: string
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      // The page polls this every 15s; tell the browser/edge not to cache so
      // viewers always see the latest KV snapshot, not a stale CDN copy.
      "Cache-Control": "no-store, max-age=0",
    },
  })
}

function constantTimeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length)
  let diff = a.length === b.length ? 0 : 1
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diff === 0
}

function tokenAuthorized(env: StatsEnv, supplied: string): boolean {
  const expected = env.TWM_VIEWER_TOKEN
  if (!expected || expected.length === 0) return false
  if (!supplied || supplied.length === 0) return false
  return constantTimeEqual(expected, supplied)
}

export async function onRequestGet(context: {
  request: Request
  env: StatsEnv
}): Promise<Response> {
  const { request, env } = context

  if (!env.TELEMETRY_KV) {
    return jsonResponse({ error: "Storage not configured" }, 503)
  }
  if (!env.TWM_VIEWER_TOKEN) {
    // Sharing not configured at all → return 404 so the existence of the
    // endpoint isn't probeable.
    return jsonResponse({ error: "Not found" }, 404)
  }

  const url = new URL(request.url)
  const supplied = url.searchParams.get("t") || ""
  if (!tokenAuthorized(env, supplied)) {
    // 404 (not 401) so probing tokens looks identical to probing for the
    // route itself.
    return jsonResponse({ error: "Not found" }, 404)
  }

  let stored: StoredTwmStats | null = null
  try {
    const raw = (await env.TELEMETRY_KV.get(TWM_KV_KEY, "json")) as
      | StoredTwmStats
      | null
    stored = raw && typeof raw === "object" ? raw : null
  } catch (err) {
    console.error("twm/stats: KV.get failed", err)
    return jsonResponse({ error: "Storage read failed" }, 500)
  }

  if (!stored || !stored.payload) {
    // Token was valid but the bot has not pushed yet (or KV TTL expired).
    // Return a 200 with an `empty: true` flag so the page can render a
    // friendly "waiting for first push" state instead of crashing.
    return jsonResponse({ empty: true }, 200)
  }

  return jsonResponse(
    {
      ...stored.payload,
      received_at_unix: stored.received_at_unix,
    },
    200,
  )
}
