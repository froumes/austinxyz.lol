// Shape of the JSON payload pushed by the TWM bot to /api/twm/push.
//
// Keep this in sync with `PublicShareStats` in baf/src/web/server.rs — the
// Rust side defines the wire format, this file mirrors it for the page and
// the Cloudflare Functions.
//
// Everything here is intentionally anonymous: no IGN, no Minecraft UUID, no
// auction UUIDs, no Discord ID.  The bot strips all identifying fields before
// signing and pushing the body.

/**
 * `[unix_seconds, cumulative_coins]` tuple.  Matches the Rust `ProfitPoint`
 * type alias which serialises as a 2-element JSON array.
 */
export type ProfitPoint = [number, number]

export interface PublicFlipEntry {
  sold_at_unix: number
  item_name: string
  buy_price: number
  sell_price: number
  profit: number
  time_to_sell_secs: number
}

export interface PublicActiveAuction {
  item_name: string
  starting_bid: number
  highest_bid: number
  bin: boolean
  time_remaining_seconds: number
}

export interface PublicBazaarOrder {
  item_name: string
  amount: number
  price_per_unit: number
  is_buy_order: boolean
  /** "open" or "filled". */
  status: string
  placed_at: number
}

export interface PublicShareStats {
  all_time_ah_points: ProfitPoint[]
  all_time_bz_points: ProfitPoint[]
  all_time_ah_total: number
  all_time_bz_total: number
  all_time_total: number
  session_ah_points: ProfitPoint[]
  session_bz_points: ProfitPoint[]
  session_ah_total: number
  session_bz_total: number
  session_total: number
  session_per_hour: number
  session_uptime_seconds: number
  session_started_at_unix: number
  recent_flips: PublicFlipEntry[]
  active_auctions_count: number
  active_bazaar_orders_count: number
  active_auctions: PublicActiveAuction[]
  active_bazaar_orders: PublicBazaarOrder[]
  /** Unix seconds at the bot when the snapshot was generated. */
  now_unix: number
}

/**
 * The KV record persisted by the push handler for one share slot.
 *
 * The `push_secret` is set on the very first push to a fresh `slot_id`
 * (TOFU — trust on first use) and compared in constant time on every
 * subsequent push.  This means the bot self-provisions: no env vars and
 * no manual KV setup are needed.  The `slot_id` itself is unguessable
 * (32 bytes of random hex from the bot) so collision and brute-force
 * are infeasible.
 */
export interface StoredTwmSlot {
  push_secret: string
  payload: PublicShareStats | null
  /** Unix seconds when the slot was first claimed (set once, never updated). */
  created_at: number
  /** Unix seconds of the most recent successful push to this slot. */
  received_at_unix: number
}

/**
 * Build the KV key for a given slot.  Slots are isolated so a viewer
 * scanning one URL learns nothing about any other.
 */
export function twmSlotKey(slotId: string): string {
  return `twm:slot:${slotId}`
}

/**
 * Vanity → slot lookup written by the Discord OAuth callback.  The key is
 * namespaced under `twm:vanity:<username>` (lower-cased Discord username)
 * so collisions with slot keys are impossible.  `isValidVanityName` below
 * is the gate on what `<username>` can contain.
 */
export function twmVanityKey(vanity: string): string {
  return `twm:vanity:${vanity.toLowerCase()}`
}

/**
 * Reverse mapping: Discord user id → linked slot + current username.  Used
 * by the OAuth callback to detect renames (old username differs) and
 * slot re-assignments (old slot differs), then clean up the stale
 * vanity key before writing the new one.
 */
export function twmDiscordKey(discordUserId: string): string {
  return `twm:discord:${discordUserId}`
}

/**
 * Short-lived OAuth2 state key.  Generated in /auth/discord/start, carries
 * the slot id into /auth/discord/callback across the Discord redirect
 * bounce.  Deleted on use; auto-expires after OAUTH_STATE_TTL_SECONDS.
 */
export function twmOAuthStateKey(nonce: string): string {
  return `twm:oauth_state:${nonce}`
}

/**
 * Forward index: slot id → linked vanity record.  Written alongside
 * `twm:vanity:<username>` in the OAuth callback so the bot can answer
 * "is this slot linked yet?" with a single GET keyed on its `slot_id`
 * (which is the only identifier it owns).  Without this, the callback
 * would have to scan every vanity key to find one pointing at the slot.
 */
export function twmSlotVanityKey(slotId: string): string {
  return `twm:slotvanity:${slotId}`
}

/**
 * KV record for a vanity → slot mapping.  Kept small so the stats
 * endpoint's extra hop on vanity lookups is cheap.
 */
export interface StoredTwmVanity {
  slot_id: string
  discord_id: string
  /** Lower-cased Discord username this vanity was claimed for. */
  username: string
  /** Cached Discord display name, if present. Purely informational. */
  global_name: string | null
  /** Unix seconds when the link was last refreshed (rewritten on every login). */
  linked_at: number
}

/**
 * KV record for a Discord user → slot link.  One per Discord account.
 * Updated on every successful OAuth callback; used to detect renames
 * and clean stale vanity keys.
 */
export interface StoredTwmDiscordLink {
  slot_id: string
  /** Lower-cased, normalised.  The exact string used for the vanity URL. */
  username: string
  global_name: string | null
  linked_at: number
}

/**
 * Pending OAuth flow.  Written by /auth/discord/start, consumed and
 * deleted by /auth/discord/callback.  Expires after 5 minutes if the
 * user never completes the Discord prompt.
 */
export interface StoredTwmOAuthState {
  slot_id: string
  /** Unix seconds when the state was issued; also enforced by KV TTL. */
  created_at: number
}

/**
 * Slot → vanity record (forward index).  Same data as `StoredTwmVanity`,
 * indexed by slot so the bot can ask "what vanity is attached to my
 * slot?" without knowing the username.  Cleaned up by the OAuth
 * callback when a slot is reassigned.
 */
export interface StoredTwmSlotVanity {
  username: string
  discord_id: string
  global_name: string | null
  linked_at: number
}

/**
 * Auto-expire idle slots.  As long as the bot keeps pushing on its
 * configured interval (default 30s) the TTL is refreshed on every write,
 * so a healthy slot lives forever.  Stop pushing for ~12h and the slot
 * vanishes — the next click of "Share Stats" will TOFU-claim a fresh one.
 */
export const TWM_SLOT_TTL_SECONDS = 12 * 60 * 60

/**
 * Vanity/Discord link TTL.  Longer than slot TTL because we don't want a
 * user's vanity URL to 404 just because their bot was offline overnight.
 * Refreshed on every successful Discord login.
 */
export const TWM_VANITY_TTL_SECONDS = 60 * 60 * 24 * 365

/** OAuth2 `state` lifetime.  Kept short — the user is mid-flow. */
export const OAUTH_STATE_TTL_SECONDS = 5 * 60

/**
 * Largest accepted push body.  Generous cap that still bounds memory
 * usage on the worker and prevents abuse if a push secret ever leaks.
 */
export const TWM_PUSH_MAX_BYTES = 256 * 1024

/**
 * Reject obviously-bogus slot ids before doing any KV work.  The bot
 * generates 64-hex-char strings, but we accept anything alphanumeric of
 * a reasonable length so future encodings (base32, URL-safe base64)
 * keep working.
 */
export function isValidSlotId(slotId: unknown): slotId is string {
  return (
    typeof slotId === "string" &&
    slotId.length >= 16 &&
    slotId.length <= 128 &&
    /^[A-Za-z0-9_-]+$/.test(slotId)
  )
}

/**
 * Tight form of `isValidSlotId` used to distinguish a raw slot id from a
 * vanity name in the stats endpoint.  We only accept the exact 64-char
 * hex the bot emits so a vanity like "deadbeef" (valid hex, valid
 * username) doesn't accidentally route into slot lookup.
 */
export function looksLikeSlotId(value: string): boolean {
  return value.length === 64 && /^[0-9a-f]{64}$/.test(value)
}

/**
 * Discord post-Pomelo usernames are 2-32 characters of lowercase letters,
 * digits, `.`, and `_`.  We lower-case before comparing so a rename from
 * "Austin" → "austin" doesn't create two vanity keys.  Returns the
 * normalised form (or null if rejected).
 */
export function normaliseVanityName(value: unknown): string | null {
  if (typeof value !== "string") return null
  const lowered = value.trim().toLowerCase()
  if (lowered.length < 2 || lowered.length > 32) return null
  if (!/^[a-z0-9_.]+$/.test(lowered)) return null
  return lowered
}

export function isValidVanityName(value: unknown): value is string {
  return normaliseVanityName(value) !== null
}
