// Cloudflare Pages Function: receives a stats snapshot pushed by a TWM bot
// for a specific share slot and stores it in KV.  This is the multi-tenant,
// zero-config replacement for the old singleton `/api/twm/push`.
//
// Provisioning model — TOFU (trust on first use):
//   • The bot generates an unguessable `slot_id` + `push_secret` on its
//     first "Share Stats" click and persists them to `share_state.json`.
//   • The very first push to a fresh `slot_id` claims the slot and stores
//     `{push_secret, payload, created_at, received_at_unix}` in KV.
//   • Every subsequent push must present the same `push_secret` (compared
//     in constant time) or the request is rejected with 401.
//
// What this means in practice:
//   • The operator does not have to set any Cloudflare env vars.  The only
//     binding required is `TELEMETRY_KV` (already configured for the rest
//     of the site).
//   • Anyone who somehow learned a bot's `slot_id` could only *read* via
//     `/api/twm/stats/<slot_id>` — they can't write without the secret.
//   • A leaked push secret is contained to one slot.  The operator just
//     deletes `share_state.json` on the bot, clicks Share again, and the
//     old slot quietly TTLs out of KV.
//
// Auth header: `X-TWM-Push-Secret: <hex>` (HTTPS-encrypted in transit).

import {
  TWM_PUSH_MAX_BYTES,
  TWM_SLOT_TTL_SECONDS,
  isValidSlotId,
  twmSlotKey,
  type PublicShareStats,
  type StoredTwmSlot,
} from "../../../../lib/twm"

interface KVNamespaceLike {
  get: (key: string, type?: "json") => Promise<unknown>
  put: (
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ) => Promise<void>
}

interface PushEnv {
  TELEMETRY_KV?: KVNamespaceLike
}

interface PushContext {
  request: Request
  env: PushEnv
  params: { slot?: string | string[] }
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

/**
 * Constant-time string comparison.  Compares the longer of the two inputs
 * so length differences don't leak via early-return timing.
 */
function constantTimeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length)
  let diff = a.length === b.length ? 0 : 1
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diff === 0
}

/**
 * Lightweight runtime validator for the pushed payload.  Full schema parsing
 * would be expensive on every request, but we do reject anything that
 * obviously isn't a stats snapshot so the page never has to defend against
 * arbitrary KV contents.
 */
function looksLikeStatsPayload(value: unknown): value is PublicShareStats {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  return (
    Array.isArray(v.all_time_ah_points) &&
    Array.isArray(v.all_time_bz_points) &&
    Array.isArray(v.session_ah_points) &&
    Array.isArray(v.session_bz_points) &&
    Array.isArray(v.recent_flips) &&
    Array.isArray(v.active_auctions) &&
    Array.isArray(v.active_bazaar_orders) &&
    typeof v.now_unix === "number"
  )
}

/**
 * Pages Functions deliver `params.slot` as `string` for `[slot].ts` and
 * `string[]` for `[[slot]].ts`.  Normalise to a single string.
 */
function paramSlot(params: PushContext["params"]): string | undefined {
  const raw = params.slot
  if (Array.isArray(raw)) return raw.join("/")
  return raw
}

export async function onRequestPost(context: PushContext): Promise<Response> {
  const { request, env, params } = context

  if (!env.TELEMETRY_KV) {
    return jsonResponse({ error: "Storage not configured" }, 503)
  }

  const slotId = paramSlot(params)
  if (!isValidSlotId(slotId)) {
    return jsonResponse({ error: "Invalid slot id" }, 400)
  }

  const pushSecret = request.headers.get("x-twm-push-secret") || ""
  if (!pushSecret || pushSecret.length < 16 || pushSecret.length > 256) {
    return jsonResponse({ error: "Missing or malformed push secret" }, 401)
  }

  // Reject oversized bodies before reading them all into memory.  Some
  // runtimes ignore content-length, so we also enforce the cap below by
  // measuring the actual text length.
  const declaredLength = Number(request.headers.get("content-length") || "0")
  if (declaredLength > TWM_PUSH_MAX_BYTES) {
    return jsonResponse({ error: "Payload too large" }, 413)
  }

  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return jsonResponse({ error: "Could not read body" }, 400)
  }
  if (rawBody.length > TWM_PUSH_MAX_BYTES) {
    return jsonResponse({ error: "Payload too large" }, 413)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400)
  }
  if (!looksLikeStatsPayload(parsed)) {
    return jsonResponse({ error: "Invalid payload shape" }, 422)
  }

  const key = twmSlotKey(slotId)
  let existing: StoredTwmSlot | null = null
  try {
    const raw = (await env.TELEMETRY_KV.get(key, "json")) as
      | StoredTwmSlot
      | null
    existing = raw && typeof raw === "object" ? raw : null
  } catch (err) {
    console.error("twm/push: KV.get failed", err)
    return jsonResponse({ error: "Storage read failed" }, 500)
  }

  const now = Math.floor(Date.now() / 1000)

  if (existing && existing.push_secret) {
    // Slot is already claimed — verify the secret matches before writing.
    // Constant-time compare prevents recovering the secret one byte at a
    // time over many attempts.
    if (!constantTimeEqual(existing.push_secret, pushSecret)) {
      return jsonResponse({ error: "Invalid push secret" }, 401)
    }
  }
  // If no existing record, this is the TOFU claim — just accept and store.

  const stored: StoredTwmSlot = {
    push_secret: existing?.push_secret ?? pushSecret,
    payload: parsed,
    created_at: existing?.created_at ?? now,
    received_at_unix: now,
  }

  try {
    await env.TELEMETRY_KV.put(key, JSON.stringify(stored), {
      expirationTtl: TWM_SLOT_TTL_SECONDS,
    })
  } catch (err) {
    console.error("twm/push: KV.put failed", err)
    return jsonResponse({ error: "Storage write failed" }, 500)
  }

  return jsonResponse(
    {
      ok: true,
      received_at_unix: stored.received_at_unix,
      claimed: !existing,
    },
    200,
  )
}

/** Convenience for health-checks; returns 405 to confirm the route exists. */
export function onRequestGet(): Response {
  return jsonResponse({ error: "Method not allowed" }, 405)
}
