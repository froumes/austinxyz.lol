// Cloudflare Pages Function: `/auth/discord/start`.
//
// Entry point of the "Link Discord" flow.  The bot panel opens this URL in a
// new tab with three query parameters:
//
//   slot = <slot_id>    (the bot's currently claimed share slot)
//   ts   = <unix_secs>  (when the bot signed the request)
//   sig  = <hex>        (HMAC-SHA256(push_secret, `${slot}:${ts}`))
//
// We use the already-stored `push_secret` (written on the very first push)
// as the signing key.  Since only the bot knows `push_secret`, a valid
// signature proves the click came from an operator with control of that
// slot — nobody can craft a link that attaches their Discord account to
// someone else's stats page.
//
// If the signature checks out, we mint an OAuth2 `state` nonce, persist
// the `state → slot_id` association in KV with a 5-minute TTL, and redirect
// the user to Discord's authorisation endpoint.

import {
  OAUTH_STATE_TTL_SECONDS,
  isValidSlotId,
  twmOAuthStateKey,
  twmSlotKey,
  type StoredTwmOAuthState,
  type StoredTwmSlot,
} from "../../../lib/twm"

interface KVNamespaceLike {
  get: (key: string, type?: "json") => Promise<unknown>
  put: (
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ) => Promise<void>
}

interface StartEnv {
  TELEMETRY_KV?: KVNamespaceLike
  DISCORD_CLIENT_ID?: string
  DISCORD_REDIRECT_URI?: string
}

interface StartContext {
  request: Request
  env: StartEnv
}

/** How far (in seconds) the bot's signed timestamp may drift from edge time. */
const MAX_SIG_AGE_SECS = 5 * 60

function textResponse(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })
}

function htmlResponse(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })
}

/** Classic "oops" page used when the deep link is invalid or expired. */
function errorPage(title: string, detail: string, status: number): Response {
  const safeTitle = title.replace(/[&<>]/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;",
  )
  const safeDetail = detail.replace(/[&<>]/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : "&gt;",
  )
  return htmlResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#0b0b0f;color:#e7e7ea;font:16px/1.5 system-ui,sans-serif;margin:0;padding:2rem;display:flex;min-height:100vh;align-items:center;justify-content:center}main{max-width:32rem;padding:2rem;border:1px solid #2a2a33;border-radius:16px;background:#14141a}h1{margin:0 0 .5rem;font-size:1.25rem}p{margin:.25rem 0;color:#a3a3ad}a{color:#7aa2ff}</style></head><body><main><h1>${safeTitle}</h1><p>${safeDetail}</p><p><a href="/">Back to austinxyz.lol</a></p></main></body></html>`,
    status,
  )
}

async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message))
  const bytes = new Uint8Array(sig)
  let out = ""
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0")
  }
  return out
}

/** Constant-time hex-string compare.  See twm/push for the same primitive. */
function constantTimeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length)
  let diff = a.length === b.length ? 0 : 1
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diff === 0
}

function randomStateNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  let hex = ""
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0")
  }
  return hex
}

export async function onRequestGet(context: StartContext): Promise<Response> {
  const { request, env } = context

  if (!env.TELEMETRY_KV) {
    return textResponse("Storage not configured", 503)
  }
  if (!env.DISCORD_CLIENT_ID || !env.DISCORD_REDIRECT_URI) {
    return errorPage(
      "Discord linking not configured",
      "The site operator has not set DISCORD_CLIENT_ID / DISCORD_REDIRECT_URI yet. Ping them and try again later.",
      503,
    )
  }

  const url = new URL(request.url)
  const slotId = url.searchParams.get("slot") || ""
  const tsRaw = url.searchParams.get("ts") || ""
  const sig = url.searchParams.get("sig") || ""

  if (!isValidSlotId(slotId) || !tsRaw || !sig) {
    return errorPage(
      "Invalid link",
      "This Discord-link URL is missing required parameters. Click the button in the bot panel to generate a fresh one.",
      400,
    )
  }

  const ts = Number(tsRaw)
  if (!Number.isFinite(ts) || ts <= 0) {
    return errorPage("Invalid link", "Bad timestamp on the link.", 400)
  }

  const nowSec = Math.floor(Date.now() / 1000)
  if (Math.abs(nowSec - ts) > MAX_SIG_AGE_SECS) {
    return errorPage(
      "Link expired",
      "This Discord-link URL is older than 5 minutes. Click the button in the bot panel again to generate a fresh one.",
      400,
    )
  }

  let stored: StoredTwmSlot | null = null
  try {
    const raw = (await env.TELEMETRY_KV.get(twmSlotKey(slotId), "json")) as
      | StoredTwmSlot
      | null
    stored = raw && typeof raw === "object" ? raw : null
  } catch (err) {
    console.error("auth/discord/start: KV.get failed", err)
    return textResponse("Storage read failed", 500)
  }

  if (!stored || !stored.push_secret) {
    return errorPage(
      "Slot not found",
      "The bot hasn't pushed any stats to this slot yet, or the slot has expired. Click Share Stats in the bot panel first, then retry.",
      404,
    )
  }

  const expected = await hmacSha256Hex(stored.push_secret, `${slotId}:${ts}`)
  if (!constantTimeEqual(expected, sig)) {
    return errorPage(
      "Signature invalid",
      "This Discord-link URL wasn't signed by the bot that owns this slot. Regenerate it from the bot panel.",
      401,
    )
  }

  const stateNonce = randomStateNonce()
  const stateRecord: StoredTwmOAuthState = {
    slot_id: slotId,
    created_at: nowSec,
  }

  try {
    await env.TELEMETRY_KV.put(
      twmOAuthStateKey(stateNonce),
      JSON.stringify(stateRecord),
      { expirationTtl: OAUTH_STATE_TTL_SECONDS },
    )
  } catch (err) {
    console.error("auth/discord/start: KV.put failed", err)
    return textResponse("Storage write failed", 500)
  }

  const discordUrl = new URL("https://discord.com/api/oauth2/authorize")
  discordUrl.searchParams.set("client_id", env.DISCORD_CLIENT_ID)
  discordUrl.searchParams.set("response_type", "code")
  discordUrl.searchParams.set("redirect_uri", env.DISCORD_REDIRECT_URI)
  discordUrl.searchParams.set("scope", "identify")
  discordUrl.searchParams.set("state", stateNonce)
  discordUrl.searchParams.set("prompt", "none")

  return new Response(null, {
    status: 302,
    headers: {
      Location: discordUrl.toString(),
      "Cache-Control": "no-store",
    },
  })
}
