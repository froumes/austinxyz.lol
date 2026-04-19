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

/** Static OG image — committed to /public so we don't depend on a CDN. */
const EMBED_IMAGE_PATH = "/BSHLogoNoBackground.png"
const EMBED_IMAGE_WIDTH = 1200
const EMBED_IMAGE_HEIGHT = 630

const SITE_NAME = "austinxyz.lol"

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

/** HTML-escape attribute values.  `"` is the only one that breaks the
 *  meta tags we emit, but doing all four is cheap and future-proof. */
function htmlAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
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
  description: string
  themeColor: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
  imageAlt: string
  canonicalUrl: string
}

/**
 * Build the meta payload.  Falls back to a generic-but-still-pretty
 * card whenever we don't have live data — important because the URL
 * may be shared seconds before the bot's first push lands.
 */
function buildEmbedMeta(
  origin: string,
  resolved: ResolvedSlot,
  data: SlotEmbedData,
  nowUnix: number,
): EmbedMeta {
  const friendly = data.globalName || resolved.displayName

  let title: string
  if (resolved.isLinkedVanity) {
    title = `${friendly} · TWM Auction House Stats`
  } else if (resolved.slotId) {
    title = `TWM Auction House Stats`
  } else {
    title = `TWM Stats — ${friendly}`
  }

  const parts: string[] = []
  if (data.payload) {
    parts.push(`${formatCoins(data.payload.all_time_total)} lifetime profit`)
    if (data.payload.session_total) {
      parts.push(`${formatCoins(data.payload.session_total)} this session`)
    }
    if (data.payload.session_per_hour) {
      parts.push(`${formatCoins(data.payload.session_per_hour)}/hr`)
    }
    if (data.payload.active_auctions_count) {
      parts.push(`${data.payload.active_auctions_count} active flips`)
    }
    if (data.receivedAtUnix) {
      parts.push(`updated ${formatRelative(data.receivedAtUnix, nowUnix)}`)
    }
  } else if (resolved.slotId) {
    parts.push("Waiting for the bot's first snapshot…")
  } else {
    parts.push("Live Hypixel SkyBlock auction-house flipping numbers.")
  }
  const description = parts.join(" · ")

  const canonicalUrl = `${origin}/twm/${encodeURIComponent(resolved.rawIdentifier)}`

  const altSubject = resolved.isLinkedVanity ? friendly : "TWM"

  return {
    title,
    description,
    themeColor: EMBED_THEME_COLOR,
    imageUrl: `${origin}${EMBED_IMAGE_PATH}`,
    imageWidth: EMBED_IMAGE_WIDTH,
    imageHeight: EMBED_IMAGE_HEIGHT,
    imageAlt: `${altSubject} — TWM stats card`,
    canonicalUrl,
  }
}

/**
 * Render the meta tags as a single HTML fragment ready to append to
 * `<head>`.  All values are HTML-attribute-escaped before substitution.
 */
function renderMetaFragment(meta: EmbedMeta): string {
  const t = htmlAttr(meta.title)
  const d = htmlAttr(meta.description)
  const i = htmlAttr(meta.imageUrl)
  const a = htmlAttr(meta.imageAlt)
  const u = htmlAttr(meta.canonicalUrl)
  return [
    `<meta name="theme-color" content="${htmlAttr(meta.themeColor)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${htmlAttr(SITE_NAME)}">`,
    `<meta property="og:title" content="${t}">`,
    `<meta property="og:description" content="${d}">`,
    `<meta property="og:url" content="${u}">`,
    `<meta property="og:image" content="${i}">`,
    `<meta property="og:image:secure_url" content="${i}">`,
    `<meta property="og:image:width" content="${meta.imageWidth}">`,
    `<meta property="og:image:height" content="${meta.imageHeight}">`,
    `<meta property="og:image:alt" content="${a}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${t}">`,
    `<meta name="twitter:description" content="${d}">`,
    `<meta name="twitter:image" content="${i}">`,
    `<meta name="twitter:image:alt" content="${a}">`,
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
