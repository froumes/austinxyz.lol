// Cloudflare Pages Function: `/api/twm/share/vanity/<slot>`.
//
// Bot-only lookup endpoint.  The bot panel calls this from its
// "Share Stats" handler to ask "is my slot already linked to a Discord
// vanity?" so it can decide between copying the pretty URL or kicking
// off the OAuth flow.
//
// Auth model mirrors `/api/twm/push/<slot>`: the caller proves
// ownership of the slot by presenting the same `X-TWM-Push-Secret`
// header that was stored on the very first push (TOFU).  We do *not*
// issue any new tokens here — this endpoint only reads existing KV
// records.
//
// Why a separate endpoint instead of stuffing the vanity into the push
// response: pushes happen every ~30s and would balloon the response
// body for no reason most of the time.  Looking up the vanity is a
// one-shot UI-driven action.

import {
  isValidSlotId,
  twmSlotKey,
  twmSlotVanityKey,
  type StoredTwmSlot,
  type StoredTwmSlotVanity,
} from "../../../../../lib/twm"

interface KVNamespaceLike {
  get: (key: string, type?: "json") => Promise<unknown>
}

interface VanityEnv {
  TELEMETRY_KV?: KVNamespaceLike
}

interface VanityContext {
  request: Request
  env: VanityEnv
  params: { slot?: string | string[] }
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  })
}

/** Constant-time compare — see `/api/twm/push/<slot>`.ts for rationale. */
function constantTimeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length)
  let diff = a.length === b.length ? 0 : 1
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diff === 0
}

function paramSlot(params: VanityContext["params"]): string | undefined {
  const raw = params.slot
  if (Array.isArray(raw)) return raw.join("/")
  return raw
}

export async function onRequestPost(context: VanityContext): Promise<Response> {
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

  let slot: StoredTwmSlot | null = null
  try {
    const raw = (await env.TELEMETRY_KV.get(twmSlotKey(slotId), "json")) as
      | StoredTwmSlot
      | null
    slot = raw && typeof raw === "object" ? raw : null
  } catch (err) {
    console.error("twm/share/vanity: slot KV.get failed", err)
    return jsonResponse({ error: "Storage read failed" }, 500)
  }

  // Treat "slot not yet claimed" as 404 instead of 401 so the panel can
  // distinguish "we haven't pushed yet" from "your secret is wrong" and
  // surface a useful error.
  if (!slot || !slot.push_secret) {
    return jsonResponse(
      {
        error:
          "Slot not yet claimed in KV — push at least once before checking vanity",
      },
      404,
    )
  }

  if (!constantTimeEqual(slot.push_secret, pushSecret)) {
    return jsonResponse({ error: "Invalid push secret" }, 401)
  }

  let mapping: StoredTwmSlotVanity | null = null
  try {
    const raw = (await env.TELEMETRY_KV.get(
      twmSlotVanityKey(slotId),
      "json",
    )) as StoredTwmSlotVanity | null
    mapping = raw && typeof raw === "object" ? raw : null
  } catch (err) {
    console.error("twm/share/vanity: vanity KV.get failed", err)
    return jsonResponse({ error: "Storage read failed" }, 500)
  }

  if (!mapping) {
    return jsonResponse({ vanity: null }, 200)
  }

  return jsonResponse(
    {
      vanity: mapping.username,
      global_name: mapping.global_name,
      linked_at: mapping.linked_at,
    },
    200,
  )
}

/** Reject GETs explicitly so the route is discoverable. */
export function onRequestGet(): Response {
  return jsonResponse({ error: "Method not allowed" }, 405)
}
