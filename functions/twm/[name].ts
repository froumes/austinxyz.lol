// Cloudflare Pages Function: `/twm/<vanity-or-slot>`.
//
// The TWM stats page is a static export that normally lives at `/twm/`.
// We want the **pretty** URL `/twm/<discord-username>` (or `/twm/<slot_id>`
// as a fallback) to serve the same page, without changing the URL the
// visitor sees in their address bar.
//
// On top of the original "internally rewrite to /twm/index.html" trick,
// this function ALSO injects per-slot Open Graph / Twitter / theme-color
// meta tags so Discord (and Slack/Twitter/iMessage) render a rich card
// with the operator's vanity name and live-ish profit numbers when the
// link is shared, instead of the generic site-wide embed.
//
// The injection runs against the static HTML response via Cloudflare's
// streaming `HTMLRewriter` API so we don't have to buffer the whole
// document into memory.  Existing meta tags from the Next.js layout get
// stripped first to avoid duplicate `og:title` / `twitter:image` etc.
//
// We do NOT resolve the vanity → slot for the *page* — the React app
// still does that against `/api/twm/stats/<identifier>` so the live
// chart can poll.  This function only reads KV to populate the static
// embed metadata; if KV is cold or unlinked we fall back to a generic
// "TWM Stats" card.

import {
  isValidSlotId,
  looksLikeSlotId,
  normaliseVanityName,
  twmSlotKey,
  twmSlotVanityKey,
  twmVanityKey,
  type PublicFlipEntry,
  type PublicShareStats,
  type StoredTwmSlot,
  type StoredTwmSlotVanity,
  type StoredTwmVanity,
} from "../../lib/twm"

interface AssetsLike {
  fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>
}

// Minimal local typings for Cloudflare's `HTMLRewriter`.  This project
// doesn't depend on `@cloudflare/workers-types` (the rest of the
// functions only touch `Request`/`Response`/`KVNamespace`), so we
// declare just enough surface here to satisfy TypeScript without
// pulling in the full type package.  The runtime is provided by
// the Workers/Pages platform.
interface HTMLRewriterElement {
  remove(): void
  setInnerContent(content: string, options?: { html?: boolean }): void
  append(content: string, options?: { html?: boolean }): void
}
interface HTMLRewriterElementHandlers {
  element?: (el: HTMLRewriterElement) => void | Promise<void>
}
interface HTMLRewriterInstance {
  on(selector: string, handlers: HTMLRewriterElementHandlers): HTMLRewriterInstance
  transform(response: Response): Response
}
declare const HTMLRewriter: {
  new (): HTMLRewriterInstance
}

interface KVNamespaceLike {
  get: (key: string, type?: "json") => Promise<unknown>
}

interface TwmNameEnv {
  ASSETS?: AssetsLike
  TELEMETRY_KV?: KVNamespaceLike
}

interface TwmNameContext {
  request: Request
  env: TwmNameEnv
  params: { name?: string | string[] }
  next?: () => Promise<Response>
}

/** Brand color used for the Discord embed sidebar (purple, matches site). */
const EMBED_THEME_COLOR = "#7c3aed"

const SITE_NAME = "austinxyz.lol"

/** How many top-profit session flips to surface in the embed. */
const TOP_FLIPS_LIMIT = 3
/** Truncate item names so each "1. Foo +1.2M" line stays embed-friendly. */
const FLIP_NAME_MAX_LEN = 28

interface ResolvedSlot {
  /** The path segment as the operator typed it (already URL-decoded). */
  rawIdentifier: string
  /** The 64-char hex slot id, or null if the identifier didn't resolve. */
  slotId: string | null
  /** Display name to put in the embed title.  Vanity if known, else the
   *  raw identifier so unlinked slots still get a sensible card. */
  displayName: string
  /** True when the identifier is a vanity name we found in KV. */
  isLinkedVanity: boolean
}

/**
 * Pretty-print a coin amount the same way the React page does, so the
 * embed numbers match what the viewer sees once the page loads.  Kept
 * inline (not imported from app/) because the function bundle must not
 * pull in Next.js / React-specific code.
 */
function formatCoins(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  const sign = value < 0 ? "-" : ""
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(2)}B`
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(2)}k`
  return `${sign}${Math.round(abs).toLocaleString("en-US")}`
}

/**
 * Compute "5m ago" / "2h ago" style relative timestamps for the embed
 * footer.  Discord re-renders the embed each time the link is hovered
 * so this is "fresh enough" without needing per-second precision.
 */
function formatRelative(unixSecs: number, nowSecs: number): string {
  const diff = Math.max(0, nowSecs - unixSecs)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

/** HTML-escape attribute values.
 *
 *  Newlines matter here because Discord/Slack respect `\n` in
 *  `og:description` and render them as line breaks in the embed.
 *  We encode them as `&#10;` so the literal newline survives both
 *  Cloudflare's `HTMLRewriter` and any whitespace-collapsing parser
 *  on the consumer side.  Tab is encoded for the same reason. */
function htmlAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, "&#10;")
    .replace(/\t/g, "&#9;")
}

/** Compact "1h12m" / "47m" / "23s" uptime formatter for the embed. */
function formatUptime(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0 || Number.isNaN(seconds)) return "—"
  const s = Math.floor(seconds)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem > 0 ? `${h}h${rem}m` : `${h}h`
}

/** Truncate a flip's item name so each list line stays under the
 *  width Discord renders comfortably in a slim text card. */
function truncateName(name: string, maxLen: number = FLIP_NAME_MAX_LEN): string {
  const trimmed = (name || "").trim()
  if (trimmed.length <= maxLen) return trimmed
  return `${trimmed.slice(0, Math.max(1, maxLen - 1))}…`
}

/**
 * Pick the highest-profit flips that landed during the current session.
 *
 * If the session window has no flips yet (e.g. the bot just started),
 * fall back to the highest-profit entries in the full `recent_flips`
 * window so the embed isn't blank for fresh sessions.  Either way we
 * sort by absolute profit descending so the most impressive flip
 * shows first, and skip non-positive flips (losses don't belong in a
 * "top flips" highlight reel).
 */
function topSessionFlips(
  payload: PublicShareStats,
  limit: number = TOP_FLIPS_LIMIT,
): PublicFlipEntry[] {
  const all = Array.isArray(payload.recent_flips) ? payload.recent_flips : []
  if (all.length === 0) return []

  const sessionStart = payload.session_started_at_unix || 0
  const inSession = sessionStart > 0
    ? all.filter((f) => f && f.sold_at_unix >= sessionStart && f.profit > 0)
    : []

  const pool = inSession.length > 0
    ? inSession
    : all.filter((f) => f && f.profit > 0)

  return [...pool]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, Math.max(0, limit))
}

function paramName(params: TwmNameContext["params"]): string {
  const raw = params.name
  if (!raw) return ""
  if (Array.isArray(raw)) return raw.join("/")
  return raw
}

/**
 * Resolve `/twm/<x>` to a slot id + display name.  Three cases:
 *   • `<x>` is a 64-hex slot id        → use it verbatim, no display name
 *   • `<x>` is a vanity in KV          → return its slot id + the username
 *   • otherwise                        → return null slotId, raw display
 *
 * The third case still produces a usable embed (just generic, no
 * profit numbers), which matches what the React page would render.
 */
async function resolveIdentifier(
  kv: KVNamespaceLike | undefined,
  identifier: string,
): Promise<ResolvedSlot> {
  const decoded = (() => {
    try {
      return decodeURIComponent(identifier)
    } catch {
      return identifier
    }
  })()

  if (looksLikeSlotId(decoded)) {
    return {
      rawIdentifier: decoded,
      slotId: decoded,
      displayName: "TWM",
      isLinkedVanity: false,
    }
  }

  const vanity = normaliseVanityName(decoded)
  if (!vanity || !kv) {
    return {
      rawIdentifier: decoded,
      slotId: null,
      displayName: decoded || "TWM",
      isLinkedVanity: false,
    }
  }

  try {
    const raw = (await kv.get(twmVanityKey(vanity), "json")) as
      | StoredTwmVanity
      | null
    if (raw && typeof raw === "object" && isValidSlotId(raw.slot_id)) {
      return {
        rawIdentifier: decoded,
        slotId: raw.slot_id,
        displayName: vanity,
        isLinkedVanity: true,
      }
    }
  } catch (err) {
    console.warn("twm/[name]: vanity KV.get failed", err)
  }

  return {
    rawIdentifier: decoded,
    slotId: null,
    displayName: vanity,
    isLinkedVanity: true,
  }
}

interface SlotEmbedData {
  payload: PublicShareStats | null
  receivedAtUnix: number | null
  /** When the vanity record was last refreshed (Discord re-link). */
  linkedAtUnix: number | null
  /** Pretty Discord display name when we have it (e.g. "Austin"). */
  globalName: string | null
}

async function loadSlotEmbedData(
  kv: KVNamespaceLike | undefined,
  slotId: string | null,
): Promise<SlotEmbedData> {
  const empty: SlotEmbedData = {
    payload: null,
    receivedAtUnix: null,
    linkedAtUnix: null,
    globalName: null,
  }
  if (!kv || !slotId) return empty

  // Fire both lookups in parallel — they hit different keys and are
  // independent.  Network round-trip cost dominates KV lookup cost so
  // this halves embed-render latency vs sequential.
  const [slotRaw, vanityRaw] = await Promise.all([
    kv.get(twmSlotKey(slotId), "json").catch((err) => {
      console.warn("twm/[name]: slot KV.get failed", err)
      return null
    }),
    kv.get(twmSlotVanityKey(slotId), "json").catch((err) => {
      console.warn("twm/[name]: slot-vanity KV.get failed", err)
      return null
    }),
  ])

  const slot = slotRaw && typeof slotRaw === "object"
    ? (slotRaw as StoredTwmSlot)
    : null
  const slotVanity = vanityRaw && typeof vanityRaw === "object"
    ? (vanityRaw as StoredTwmSlotVanity)
    : null

  return {
    payload: slot?.payload ?? null,
    receivedAtUnix: slot?.received_at_unix ?? null,
    linkedAtUnix: slotVanity?.linked_at ?? null,
    globalName: slotVanity?.global_name ?? null,
  }
}

interface EmbedMeta {
  title: string
  /**
   * Multi-line, stat-dense card description.  Newlines are intentional
   * — Discord, Slack, and Telegram all render `\n` in `og:description`
   * as literal line breaks (htmlAttr encodes them as `&#10;`).
   */
  description: string
  themeColor: string
  canonicalUrl: string
}

/**
 * Build the multi-line description that fills the slim text-card embed.
 *
 * Layout target (Discord renders ~6-8 lines comfortably):
 *
 *   Lifetime 1.23B · Session +45.5M (72M/hr in 2h12m)
 *   Active 7 flips · Updated 2m ago
 *
 *   Top session flips:
 *   1. Hyperion +5.2M
 *   2. Necron Chestplate +3.8M
 *   3. Bonzo's Mask +1.2M
 *
 * Every section is conditional so newer slots (no session, no flips
 * yet, no first push) gracefully degrade to a shorter card instead
 * of showing "—" placeholders that look broken.
 */
function buildDescription(
  resolved: ResolvedSlot,
  data: SlotEmbedData,
  nowUnix: number,
): string {
  const payload = data.payload
  if (!payload) {
    if (resolved.slotId) {
      return "Waiting for the bot's first snapshot…"
    }
    return "Live Hypixel SkyBlock auction-house flipping numbers."
  }

  const lines: string[] = []

  // ── Headline row: lifetime + session profit + per-hour rate ──
  const headline: string[] = []
  headline.push(`Lifetime ${formatCoins(payload.all_time_total)}`)

  const sessionPieces: string[] = []
  const sessionSign = payload.session_total > 0 ? "+" : ""
  if (payload.session_total) {
    sessionPieces.push(`${sessionSign}${formatCoins(payload.session_total)}`)
  } else {
    sessionPieces.push("idle")
  }
  const rateBits: string[] = []
  if (payload.session_per_hour) {
    rateBits.push(`${formatCoins(payload.session_per_hour)}/hr`)
  }
  if (payload.session_uptime_seconds) {
    rateBits.push(`in ${formatUptime(payload.session_uptime_seconds)}`)
  }
  const sessionLabel = rateBits.length > 0
    ? `${sessionPieces[0]} (${rateBits.join(" ")})`
    : sessionPieces[0]
  headline.push(`Session ${sessionLabel}`)
  lines.push(headline.join(" · "))

  // ── Activity row: open auctions + bazaar + freshness ──
  const activity: string[] = []
  if (payload.active_auctions_count) {
    activity.push(`${payload.active_auctions_count} active flip${payload.active_auctions_count === 1 ? "" : "s"}`)
  }
  if (payload.active_bazaar_orders_count) {
    activity.push(`${payload.active_bazaar_orders_count} BZ order${payload.active_bazaar_orders_count === 1 ? "" : "s"}`)
  }
  if (data.receivedAtUnix) {
    activity.push(`Updated ${formatRelative(data.receivedAtUnix, nowUnix)}`)
  }
  if (activity.length > 0) {
    lines.push(activity.join(" · "))
  }

  // ── Top flips highlight reel ──
  const top = topSessionFlips(payload, TOP_FLIPS_LIMIT)
  if (top.length > 0) {
    lines.push("") // blank line for visual breathing room
    lines.push("Top session flips:")
    top.forEach((flip, idx) => {
      const name = truncateName(flip.item_name)
      lines.push(`${idx + 1}. ${name} +${formatCoins(flip.profit)}`)
    })
  }

  return lines.join("\n")
}

/**
 * Build the meta payload.  Falls back to a generic-but-still-pretty
 * card whenever we don't have live data — important because the URL
 * may be shared seconds before the bot's first push lands.
 *
 * No image is emitted by design: the operator wanted a stats-dense
 * text card, not the previous big-logo card.  Discord renders the
 * resulting OG response as a slim sidebar embed, which has way more
 * room for description content than the large-image variant.
 */
function buildEmbedMeta(
  origin: string,
  resolved: ResolvedSlot,
  data: SlotEmbedData,
  nowUnix: number,
): EmbedMeta {
  const friendly = data.globalName || resolved.displayName

  // Title carries the headline number when we have it so the card
  // is informative even before the user reads the description.
  let title: string
  if (data.payload) {
    const headline = formatCoins(data.payload.all_time_total)
    if (resolved.isLinkedVanity) {
      title = `${friendly} · ${headline} lifetime · TWM Stats`
    } else {
      title = `${headline} lifetime · TWM Stats`
    }
  } else if (resolved.isLinkedVanity) {
    title = `${friendly} · TWM Auction House Stats`
  } else if (resolved.slotId) {
    title = `TWM Auction House Stats`
  } else {
    title = `TWM Stats — ${friendly}`
  }

  return {
    title,
    description: buildDescription(resolved, data, nowUnix),
    themeColor: EMBED_THEME_COLOR,
    canonicalUrl: `${origin}/twm/${encodeURIComponent(resolved.rawIdentifier)}`,
  }
}

/**
 * Render the meta tags as a single HTML fragment ready to append to
 * `<head>`.  All values are HTML-attribute-escaped (incl. newlines)
 * before substitution.  Note that we deliberately omit `og:image`,
 * `twitter:image`, and `twitter:card=summary_large_image` so the
 * rendered Discord card uses the slim text variant — there's far
 * more room for stat lines without a 1200×630 banner eating the
 * vertical real estate.
 */
function renderMetaFragment(meta: EmbedMeta): string {
  const t = htmlAttr(meta.title)
  const d = htmlAttr(meta.description)
  const u = htmlAttr(meta.canonicalUrl)
  return [
    `<meta name="theme-color" content="${htmlAttr(meta.themeColor)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${htmlAttr(SITE_NAME)}">`,
    `<meta property="og:title" content="${t}">`,
    `<meta property="og:description" content="${d}">`,
    `<meta property="og:url" content="${u}">`,
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${t}">`,
    `<meta name="twitter:description" content="${d}">`,
    `<meta name="description" content="${d}">`,
    `<link rel="canonical" href="${u}">`,
  ].join("")
}

export async function onRequestGet(context: TwmNameContext): Promise<Response> {
  const { request, env, next } = context

  if (!env.ASSETS) {
    if (next) return next()
    return new Response("ASSETS binding unavailable", { status: 500 })
  }

  // Fetch the static export of the stats page.  The browser still sees
  // the original `/twm/<name>` URL because we don't 30x — we just
  // return ASSETS' response (with rewritten head) under the original
  // request URL.
  const target = new URL("/twm/", request.url)
  const rewriteReq = new Request(target.toString(), {
    method: "GET",
    headers: request.headers,
    redirect: "manual",
  })
  const assetResp = await env.ASSETS.fetch(rewriteReq)

  // Resolve metadata in parallel with the asset fetch having already
  // started.  We can't actually await both with `Promise.all` cleanly
  // because we need the asset response to apply the rewriter, but KV
  // lookups are very fast (<10ms) so the serial wait is acceptable.
  const identifier = paramName(context.params)
  const resolved = await resolveIdentifier(env.TELEMETRY_KV, identifier)
  const slotData = await loadSlotEmbedData(env.TELEMETRY_KV, resolved.slotId)

  const reqUrl = new URL(request.url)
  const origin = `${reqUrl.protocol}//${reqUrl.host}`
  const nowUnix = Math.floor(Date.now() / 1000)
  const meta = buildEmbedMeta(origin, resolved, slotData, nowUnix)
  const metaFragment = renderMetaFragment(meta)

  // Strip the inherited site-wide meta tags so Discord doesn't see
  // both "austinxyz.lol" AND our per-slot title — most consumers
  // respect the LAST occurrence but Discord in particular has been
  // inconsistent.  Then inject the fresh block at the end of <head>
  // so it always wins regardless of consumer behavior.
  const rewriter = new HTMLRewriter()
    .on('meta[property^="og:"]', { element: (el) => el.remove() })
    .on('meta[name^="twitter:"]', { element: (el) => el.remove() })
    .on('meta[name="theme-color"]', { element: (el) => el.remove() })
    .on('meta[name="description"]', { element: (el) => el.remove() })
    .on('link[rel="canonical"]', { element: (el) => el.remove() })
    .on("title", {
      element: (el) => el.setInnerContent(meta.title),
    })
    .on("head", {
      element: (el) => el.append(metaFragment, { html: true }),
    })

  // Apply the rewriter and override cache headers — the head changes
  // per identifier and per push, so a shared CDN copy would leak
  // user A's stats into user B's embed.
  const rewritten = rewriter.transform(assetResp)
  const headers = new Headers(rewritten.headers)
  headers.set("Cache-Control", "public, max-age=0, must-revalidate")
  // Tell Discord/Slack-like crawlers it's safe to cache the resulting
  // embed for ~5 min so they don't re-hammer KV on every link hover.
  headers.set("X-Robots-Tag", "all")

  return new Response(rewritten.body, {
    status: rewritten.status,
    statusText: rewritten.statusText,
    headers,
  })
}
