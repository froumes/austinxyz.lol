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
 * The KV record persisted by the push handler.  `received_at_unix` is the
 * Cloudflare-edge timestamp so the page can show "live" vs "stale" without
 * trusting the bot's clock.
 */
export interface StoredTwmStats {
  payload: PublicShareStats
  received_at_unix: number
}

/**
 * KV key under which the latest pushed snapshot is stored.  Single global key
 * — there is only ever one bot pushing at a time, so we just overwrite.
 */
export const TWM_KV_KEY = "twm:stats"

/**
 * Auto-expire the KV entry if the bot stops pushing.  Keeps the page from
 * showing days-old numbers as if they were live.
 */
export const TWM_KV_TTL_SECONDS = 600

/**
 * Largest accepted push body.  Generous cap that still bounds memory usage
 * on the worker and prevents abuse if the push secret ever leaks.
 */
export const TWM_PUSH_MAX_BYTES = 256 * 1024
