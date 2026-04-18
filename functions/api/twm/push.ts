// Cloudflare Pages Function: receives a stats snapshot pushed by the TWM bot
// running on the operator's VPS and stores it in KV.  The browser-facing
// `/api/twm/stats` reads from the same KV key, so the VPS never needs to be
// publicly reachable — Cloudflare is the only thing visible.
//
// Auth model:
//   • The bot computes HMAC-SHA256(body_bytes, TWM_PUSH_SECRET) and sends it
//     as a hex string in the `X-TWM-Signature` header.  The function verifies
//     in constant time before accepting the body.
//   • The pushed payload itself is the anonymised `PublicShareStats` JSON.
//     We do not re-sign or re-shape it; the browser just renders what the bot
//     sent.
//
// Failure modes:
//   • Missing / wrong signature → 401, no KV write, no information leaked.
//   • Body too large → 413 before KV write.
//   • KV not bound → 503 (operator forgot to wire TELEMETRY_KV).

import {
  TWM_KV_KEY,
  TWM_KV_TTL_SECONDS,
  TWM_PUSH_MAX_BYTES,
  type StoredTwmStats,
  type PublicShareStats,
} from "../../../lib/twm"

interface KVNamespaceLike {
  put: (
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ) => Promise<void>
}

interface PushEnv {
  TELEMETRY_KV?: KVNamespaceLike
  /** Shared HMAC secret. Configure via Cloudflare dashboard / wrangler secrets. */
  TWM_PUSH_SECRET?: string
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/**
 * Constant-time hex string comparison.  Avoids timing-channel leaks of which
 * byte first diverges, which would let an attacker recover the signature
 * one byte at a time over many requests.
 */
function constantTimeEqualHex(a: string, b: string): boolean {
  const aLower = a.toLowerCase()
  const bLower = b.toLowerCase()
  // Use a length-independent OR-accumulator over the longer of the two inputs.
  // We deliberately do not short-circuit on length mismatch: returning early
  // there would itself be a (tiny) timing signal.
  const len = Math.max(aLower.length, bLower.length)
  let diff = aLower.length === bLower.length ? 0 : 1
  for (let i = 0; i < len; i++) {
    diff |= (aLower.charCodeAt(i) || 0) ^ (bLower.charCodeAt(i) || 0)
  }
  return diff === 0
}

/**
 * Lightweight runtime validator for the pushed payload.  We do not parse it
 * with a full schema (it could be expensive on every request), but we do
 * reject anything that obviously isn't a stats snapshot so the page never
 * has to defend against arbitrary KV contents.
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

export async function onRequestPost(context: {
  request: Request
  env: PushEnv
}): Promise<Response> {
  const { request, env } = context

  if (!env.TELEMETRY_KV) {
    return jsonResponse({ error: "Storage not configured" }, 503)
  }
  if (!env.TWM_PUSH_SECRET) {
    return jsonResponse({ error: "Push secret not configured" }, 503)
  }

  // Reject oversized bodies before reading them all into memory.  Some
  // runtimes ignore content-length, so we also enforce the cap below by
  // measuring the actual text length.
  const declaredLength = Number(request.headers.get("content-length") || "0")
  if (declaredLength > TWM_PUSH_MAX_BYTES) {
    return jsonResponse({ error: "Payload too large" }, 413)
  }

  const signatureHeader = request.headers.get("x-twm-signature") || ""
  if (!signatureHeader) {
    return jsonResponse({ error: "Missing signature" }, 401)
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

  const expected = await hmacSha256Hex(env.TWM_PUSH_SECRET, rawBody)
  if (!constantTimeEqualHex(expected, signatureHeader)) {
    return jsonResponse({ error: "Invalid signature" }, 401)
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

  // Stamp with the edge time of receipt so the page can render an honest
  // "last updated" badge regardless of any clock skew on the bot.
  const stored: StoredTwmStats = {
    payload: parsed,
    received_at_unix: Math.floor(Date.now() / 1000),
  }

  try {
    await env.TELEMETRY_KV.put(TWM_KV_KEY, JSON.stringify(stored), {
      expirationTtl: TWM_KV_TTL_SECONDS,
    })
  } catch (err) {
    console.error("twm/push: KV.put failed", err)
    return jsonResponse({ error: "Storage write failed" }, 500)
  }

  return jsonResponse({ ok: true, received_at_unix: stored.received_at_unix }, 200)
}

/** Convenience for health-checks; returns 405 to confirm the route exists. */
export function onRequestGet(): Response {
  return jsonResponse({ error: "Method not allowed" }, 405)
}
