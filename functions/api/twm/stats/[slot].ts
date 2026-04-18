// Cloudflare Pages Function: serves the most recent stats snapshot for one
// share slot.  Public — anyone with the slot id (which is unguessable, 32
// random bytes hex) can read.  No env vars required; the slot id IS the
// access token.
//
// Slot lifecycle:
//   • The TWM bot generates a fresh slot id on first "Share Stats" click
//     and starts pushing snapshots to /api/twm/push/<slot_id>.
//   • This endpoint reads whatever the bot last pushed and returns it
//     unchanged, plus the edge-side `received_at_unix` so the page can
//     show "live" vs "stale" without trusting the bot's clock.
//   • If the bot has never pushed (race between auto-setup and the first
//     push tick), or the slot has TTL'd out of KV, we return 200 with
//     `{empty: true}` so the page can render a friendly waiting state.

import {
  isValidSlotId,
  twmSlotKey,
  type StoredTwmSlot,
} from "../../../../lib/twm"

interface KVNamespaceLike {
  get: (key: string, type?: "json") => Promise<unknown>
}

interface StatsEnv {
  TELEMETRY_KV?: KVNamespaceLike
}

interface StatsContext {
  request: Request
  env: StatsEnv
  params: { slot?: string | string[] }
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      // The page polls this every 15s; tell the browser/edge not to cache
      // so viewers always see the latest KV snapshot, not a stale CDN copy.
      "Cache-Control": "no-store, max-age=0",
    },
  })
}

function paramSlot(params: StatsContext["params"]): string | undefined {
  const raw = params.slot
  if (Array.isArray(raw)) return raw.join("/")
  return raw
}

export async function onRequestGet(context: StatsContext): Promise<Response> {
  const { env, params } = context

  if (!env.TELEMETRY_KV) {
    return jsonResponse({ error: "Storage not configured" }, 503)
  }

  const slotId = paramSlot(params)
  if (!isValidSlotId(slotId)) {
    // 404 (not 400) so probing for valid-shape slots looks identical to
    // probing for the route itself.
    return jsonResponse({ error: "Not found" }, 404)
  }

  let stored: StoredTwmSlot | null = null
  try {
    const raw = (await env.TELEMETRY_KV.get(twmSlotKey(slotId), "json")) as
      | StoredTwmSlot
      | null
    stored = raw && typeof raw === "object" ? raw : null
  } catch (err) {
    console.error("twm/stats: KV.get failed", err)
    return jsonResponse({ error: "Storage read failed" }, 500)
  }

  if (!stored) {
    // Slot doesn't exist (or TTL'd out).  Return 404 so the page can
    // distinguish "never-existed" from "claimed but no payload yet".
    return jsonResponse({ error: "Not found" }, 404)
  }

  if (!stored.payload) {
    // Slot was claimed but no snapshot has landed yet (rare race window
    // between TOFU claim and the first push tick).  Return a friendly
    // waiting state.
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
