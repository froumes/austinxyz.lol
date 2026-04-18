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
 * Auto-expire idle slots.  As long as the bot keeps pushing on its
 * configured interval (default 30s) the TTL is refreshed on every write,
 * so a healthy slot lives forever.  Stop pushing for ~12h and the slot
 * vanishes — the next click of "Share Stats" will TOFU-claim a fresh one.
 */
export const TWM_SLOT_TTL_SECONDS = 12 * 60 * 60

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
