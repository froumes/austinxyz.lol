// Cloudflare Pages Function: `/auth/discord/callback`.
//
// Second half of the "Link Discord" flow.  Discord redirects the user back
// here with `?code=...&state=<nonce>` (plus `error=...` on refusal).
//
// We:
//   1. Validate `state` against KV — if missing/expired, reject.
//   2. Look up which slot the flow was started for (written by /auth/discord/start).
//   3. Delete the state key so the code can never be replayed.
//   4. Exchange the `code` at Discord's token endpoint for an access token.
//   5. Call /users/@me to get { id, username, global_name, discriminator }.
//   6. Require a post-Pomelo username (discriminator == "0") so the vanity
//      URL is globally unique.
//   7. Detect renames / slot reassignments and clean up stale vanity keys.
//   8. Persist `twm:discord:<id>` + `twm:vanity:<username>` → slot mappings.
//   9. Redirect the user to `/twm/<username>` so they land on their shiny
//      new pretty URL with live stats.
//
// No cookies, no sessions — a successful login produces KV writes and a
// redirect, nothing more.  Re-linking is idempotent: logging in again just
// refreshes the mappings (useful after a Discord rename).

import {
  TWM_VANITY_TTL_SECONDS,
  normaliseVanityName,
  twmDiscordKey,
  twmOAuthStateKey,
  twmVanityKey,
  type StoredTwmDiscordLink,
  type StoredTwmOAuthState,
  type StoredTwmVanity,
} from "../../../lib/twm"

interface KVNamespaceLike {
  get: (key: string, type?: "json") => Promise<unknown>
  put: (
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ) => Promise<void>
  delete: (key: string) => Promise<void>
}

interface CallbackEnv {
  TELEMETRY_KV?: KVNamespaceLike
  DISCORD_CLIENT_ID?: string
  DISCORD_CLIENT_SECRET?: string
  DISCORD_REDIRECT_URI?: string
}

interface CallbackContext {
  request: Request
  env: CallbackEnv
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

function textResponse(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })
}

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

interface DiscordUser {
  id: string
  username: string
  global_name: string | null
  discriminator: string
  avatar: string | null
}

interface DiscordTokenResponse {
  access_token?: string
  token_type?: string
  error?: string
  error_description?: string
}

export async function onRequestGet(context: CallbackContext): Promise<Response> {
  const { request, env } = context

  if (!env.TELEMETRY_KV) {
    return textResponse("Storage not configured", 503)
  }
  if (
    !env.DISCORD_CLIENT_ID ||
    !env.DISCORD_CLIENT_SECRET ||
    !env.DISCORD_REDIRECT_URI
  ) {
    return errorPage(
      "Discord linking not configured",
      "Site operator must set DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, and DISCORD_REDIRECT_URI in Cloudflare Pages.",
      503,
    )
  }

  const url = new URL(request.url)

  const discordError = url.searchParams.get("error")
  if (discordError) {
    const desc =
      url.searchParams.get("error_description") ||
      "Discord did not authorise the request."
    return errorPage("Discord login cancelled", desc, 400)
  }

  const code = url.searchParams.get("code") || ""
  const stateNonce = url.searchParams.get("state") || ""
  if (!code || !stateNonce) {
    return errorPage(
      "Missing code or state",
      "Discord's callback is missing required parameters. Try starting the link flow again.",
      400,
    )
  }

  // Resolve state → slot_id.  State is single-use, so we delete it
  // before doing any further work — a replayed callback URL must not
  // be able to re-attach a different account to the same slot.
  let stateRecord: StoredTwmOAuthState | null = null
  try {
    const raw = (await env.TELEMETRY_KV.get(
      twmOAuthStateKey(stateNonce),
      "json",
    )) as StoredTwmOAuthState | null
    stateRecord = raw && typeof raw === "object" ? raw : null
  } catch (err) {
    console.error("auth/discord/callback: state KV.get failed", err)
    return textResponse("Storage read failed", 500)
  }

  if (!stateRecord) {
    return errorPage(
      "Login state expired",
      "This Discord login took too long or was already completed. Click Link Discord in the bot panel and try again.",
      400,
    )
  }

  try {
    await env.TELEMETRY_KV.delete(twmOAuthStateKey(stateNonce))
  } catch (err) {
    // Not fatal — the TTL will clear it soon — but worth noting.
    console.warn("auth/discord/callback: state delete failed", err)
  }

  // Exchange the authorisation code for an access token.  We use
  // `client_secret` in the POST body per Discord's OAuth2 docs.
  const tokenBody = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: env.DISCORD_REDIRECT_URI,
  })

  let tokenJson: DiscordTokenResponse
  try {
    const resp = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody.toString(),
    })
    tokenJson = (await resp.json()) as DiscordTokenResponse
    if (!resp.ok || !tokenJson.access_token) {
      const msg = tokenJson.error_description || tokenJson.error || `HTTP ${resp.status}`
      return errorPage("Discord rejected the login", msg, 400)
    }
  } catch (err) {
    console.error("auth/discord/callback: token exchange failed", err)
    return errorPage(
      "Could not reach Discord",
      "Network error while exchanging the authorisation code. Try again.",
      502,
    )
  }

  // Fetch the authenticated user.  The `identify` scope is enough to
  // get id + username + global_name + discriminator + avatar.
  let user: DiscordUser
  try {
    const resp = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    })
    if (!resp.ok) {
      return errorPage("Discord user lookup failed", `HTTP ${resp.status}`, 502)
    }
    user = (await resp.json()) as DiscordUser
  } catch (err) {
    console.error("auth/discord/callback: /users/@me failed", err)
    return errorPage(
      "Could not reach Discord",
      "Network error while fetching your Discord user.",
      502,
    )
  }

  if (!user || typeof user.id !== "string" || typeof user.username !== "string") {
    return errorPage("Malformed Discord response", "Missing id or username.", 502)
  }

  // Reject legacy discriminator-style accounts.  Post-Pomelo users have
  // `discriminator === "0"` and a globally-unique username, which is
  // exactly what we need for the vanity URL.  Legacy users share
  // usernames, so `/twm/bob` wouldn't identify a unique person.
  if (user.discriminator && user.discriminator !== "0") {
    return errorPage(
      "Discord account is still on the legacy username system",
      "Please migrate your Discord account to the new username system (https://dis.gd/usernames) and retry.",
      400,
    )
  }

  const vanity = normaliseVanityName(user.username)
  if (!vanity) {
    return errorPage(
      "Username not accepted",
      `"${user.username}" can't be used as a URL. Only lowercase letters, digits, dots, and underscores are allowed.`,
      400,
    )
  }

  const slotId = stateRecord.slot_id
  const nowSec = Math.floor(Date.now() / 1000)

  // Detect rename or slot reassignment so we don't leave orphaned
  // vanity keys lying around.  These keys are cheap but they matter
  // for "is this name taken?" checks later on.
  let previousLink: StoredTwmDiscordLink | null = null
  try {
    const raw = (await env.TELEMETRY_KV.get(twmDiscordKey(user.id), "json")) as
      | StoredTwmDiscordLink
      | null
    previousLink = raw && typeof raw === "object" ? raw : null
  } catch (err) {
    console.warn("auth/discord/callback: previous-link lookup failed", err)
  }

  if (previousLink) {
    const renamed = previousLink.username !== vanity
    const slotMoved = previousLink.slot_id !== slotId
    if (renamed || slotMoved) {
      try {
        await env.TELEMETRY_KV.delete(twmVanityKey(previousLink.username))
      } catch (err) {
        console.warn("auth/discord/callback: stale vanity delete failed", err)
      }
    }
  }

  const vanityRecord: StoredTwmVanity = {
    slot_id: slotId,
    discord_id: user.id,
    username: vanity,
    global_name: user.global_name ?? null,
    linked_at: nowSec,
  }
  const linkRecord: StoredTwmDiscordLink = {
    slot_id: slotId,
    username: vanity,
    global_name: user.global_name ?? null,
    linked_at: nowSec,
  }

  try {
    await Promise.all([
      env.TELEMETRY_KV.put(twmVanityKey(vanity), JSON.stringify(vanityRecord), {
        expirationTtl: TWM_VANITY_TTL_SECONDS,
      }),
      env.TELEMETRY_KV.put(twmDiscordKey(user.id), JSON.stringify(linkRecord), {
        expirationTtl: TWM_VANITY_TTL_SECONDS,
      }),
    ])
  } catch (err) {
    console.error("auth/discord/callback: KV.put failed", err)
    return textResponse("Storage write failed", 500)
  }

  const target = `/twm/${encodeURIComponent(vanity)}`
  return new Response(null, {
    status: 302,
    headers: {
      Location: target,
      "Cache-Control": "no-store",
    },
  })
}
