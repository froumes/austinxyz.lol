export type KVNamespace = {
  get<T = unknown>(key: string, type: "json"): Promise<T | null>
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
  delete(key: string): Promise<void>
}

export type Env = {
  TWM_AUTH_KV?: KVNamespace
  DISCORD_CLIENT_ID?: string
  DISCORD_CLIENT_SECRET?: string
  TWM_AUTH_BASE_URL?: string
  TWM_ADMIN_API_KEY?: string
}

export type LicenseRecord = {
  active: boolean
  admin_discord_ids?: string[]
  macro_discord_ids?: string[]
  users?: Record<string, "admin" | "macro">
  expires_at?: string | null
  note?: string
}

export type PendingLogin = {
  license_key: string
  return_to: string
  panel_state: string
}

export type LoginToken = {
  license_key: string
  discord_id: string
  role: "admin" | "macro"
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  })
}

export function badRequest(message: string): Response {
  return json({ error: message }, 400)
}

export function unauthorized(message = "Unauthorized"): Response {
  return json({ error: message }, 401)
}

export function requireKv(env: Env): KVNamespace | Response {
  if (!env.TWM_AUTH_KV) return json({ error: "TWM_AUTH_KV is not configured" }, 503)
  return env.TWM_AUTH_KV
}

export function requireAdmin(request: Request, env: Env): Response | null {
  const expected = env.TWM_ADMIN_API_KEY || ""
  if (!expected) return json({ error: "TWM_ADMIN_API_KEY is not configured" }, 503)
  const provided = request.headers.get("X-Admin-Key") || ""
  return provided === expected ? null : unauthorized("Invalid admin key")
}

export function licenseKey(key: string): string {
  return `twm:license:${key}`
}

export function oauthStateKey(state: string): string {
  return `twm:oauth-state:${state}`
}

export function loginTokenKey(token: string): string {
  return `twm:login:${token}`
}

export function randomToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
}

export function normalizeIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return []
  return Array.from(new Set(ids.map((id) => String(id).trim()).filter(Boolean)))
}

export function normalizeLicense(input: any): LicenseRecord {
  const users: Record<string, "admin" | "macro"> = {}
  if (input && typeof input.users === "object" && !Array.isArray(input.users)) {
    for (const [id, role] of Object.entries(input.users)) {
      if (role === "admin" || role === "macro") users[String(id).trim()] = role
    }
  }
  return {
    active: Boolean(input?.active),
    admin_discord_ids: normalizeIds(input?.admin_discord_ids),
    macro_discord_ids: normalizeIds(input?.macro_discord_ids),
    users,
    expires_at: input?.expires_at ? String(input.expires_at) : null,
    note: input?.note ? String(input.note) : undefined,
  }
}

export function licenseExpired(record: LicenseRecord): boolean {
  if (!record.expires_at) return false
  const expires = Date.parse(record.expires_at)
  return Number.isFinite(expires) && Date.now() > expires
}

export function roleForDiscordId(record: LicenseRecord, discordId: string): "admin" | "macro" | null {
  if (!record.active || licenseExpired(record)) return null
  if (record.users?.[discordId] === "admin" || record.admin_discord_ids?.includes(discordId)) return "admin"
  if (record.users?.[discordId] === "macro" || record.macro_discord_ids?.includes(discordId)) return "macro"
  return null
}

export function isSafeReturnTo(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.hostname === "localhost" || url.hostname === "127.0.0.1"
  } catch {
    return false
  }
}
