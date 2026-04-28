import {
  Env,
  json,
  licenseKey,
  LicenseRecord,
  loginTokenKey,
  oauthStateKey,
  PendingLogin,
  randomToken,
  requireKv,
  roleForDiscordId,
} from "../../../lib/twm-auth"

type DiscordToken = { access_token: string; token_type: string }
type DiscordUser = { id: string; username?: string; global_name?: string }

function redirectBack(pending: PendingLogin, params: Record<string, string>): Response {
  const url = new URL(pending.return_to)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  url.searchParams.set("state", pending.panel_state)
  return Response.redirect(url.toString(), 302)
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const kv = requireKv(env)
  if (kv instanceof Response) return kv

  const clientId = env.DISCORD_CLIENT_ID || ""
  const clientSecret = env.DISCORD_CLIENT_SECRET || ""
  const authBaseUrl = (env.TWM_AUTH_BASE_URL || "").replace(/\/+$/, "")
  if (!clientId || !clientSecret || !authBaseUrl) {
    return json({ error: "Discord OAuth environment is not configured" }, 503)
  }

  const url = new URL(request.url)
  const state = url.searchParams.get("state") || ""
  const code = url.searchParams.get("code") || ""
  const error = url.searchParams.get("error") || ""
  const pending = state ? await kv.get<PendingLogin>(oauthStateKey(state), "json") : null
  if (!pending) return json({ error: "Invalid or expired OAuth state" }, 401)
  await kv.delete(oauthStateKey(state))
  if (error) return redirectBack(pending, { error })
  if (!code) return redirectBack(pending, { error: "missing_code" })

  const redirectUri = `${authBaseUrl}/api/twm/callback`
  const tokenResp = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  })
  if (!tokenResp.ok) return redirectBack(pending, { error: "token_exchange_failed" })
  const token = (await tokenResp.json()) as DiscordToken

  const userResp = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  })
  if (!userResp.ok) return redirectBack(pending, { error: "user_lookup_failed" })
  const user = (await userResp.json()) as DiscordUser

  const license = await kv.get<LicenseRecord>(licenseKey(pending.license_key), "json")
  if (!license) return redirectBack(pending, { error: "license_not_found" })
  const role = roleForDiscordId(license, user.id)
  if (!role) return redirectBack(pending, { error: "not_allowed" })

  const loginToken = randomToken()
  await kv.put(
    loginTokenKey(loginToken),
    JSON.stringify({ license_key: pending.license_key, discord_id: user.id, role }),
    { expirationTtl: 120 },
  )
  return redirectBack(pending, { token: loginToken })
}
