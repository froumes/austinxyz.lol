import {
  badRequest,
  Env,
  json,
  licenseKey,
  LicenseRecord,
  loginTokenKey,
  LoginToken,
  requireKv,
  roleForDiscordId,
} from "../../../lib/twm-auth"

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const kv = requireKv(env)
  if (kv instanceof Response) return kv

  let body: any
  try {
    body = await request.json()
  } catch {
    return badRequest("Invalid JSON")
  }

  const license = String(body?.license_key || "").trim()
  const token = String(body?.login_token || "").trim()
  if (!license || !token) return badRequest("Missing license_key or login_token")

  const login = await kv.get<LoginToken>(loginTokenKey(token), "json")
  if (!login || login.license_key !== license) {
    return json({ allowed: false, reason: "invalid_login_token" }, 401)
  }
  await kv.delete(loginTokenKey(token))

  const record = await kv.get<LicenseRecord>(licenseKey(license), "json")
  if (!record) return json({ allowed: false, reason: "license_not_found" }, 403)
  const currentRole = roleForDiscordId(record, login.discord_id)
  if (!currentRole || currentRole !== login.role) {
    return json({ allowed: false, reason: "license_inactive_or_user_removed" }, 403)
  }

  return json({
    allowed: true,
    role: currentRole,
    discord_id: login.discord_id,
  })
}
