import { badRequest, Env, isSafeReturnTo, json, oauthStateKey, PendingLogin, randomToken, requireKv } from "../../../lib/twm-auth"

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const kv = requireKv(env)
  if (kv instanceof Response) return kv

  const clientId = env.DISCORD_CLIENT_ID || ""
  const authBaseUrl = (env.TWM_AUTH_BASE_URL || "").replace(/\/+$/, "")
  if (!clientId) return json({ error: "DISCORD_CLIENT_ID is not configured" }, 503)
  if (!authBaseUrl) return json({ error: "TWM_AUTH_BASE_URL is not configured" }, 503)

  const url = new URL(request.url)
  const licenseKey = url.searchParams.get("license_key")?.trim() || ""
  const returnTo = url.searchParams.get("return_to")?.trim() || ""
  const panelState = url.searchParams.get("state")?.trim() || ""
  if (!licenseKey) return badRequest("Missing license_key")
  if (!returnTo || !isSafeReturnTo(returnTo)) return badRequest("Invalid return_to")
  if (!panelState) return badRequest("Missing state")

  const state = randomToken()
  const pending: PendingLogin = { license_key: licenseKey, return_to: returnTo, panel_state: panelState }
  await kv.put(oauthStateKey(state), JSON.stringify(pending), { expirationTtl: 600 })

  const redirectUri = `${authBaseUrl}/api/twm/callback`
  const discord = new URL("https://discord.com/oauth2/authorize")
  discord.searchParams.set("client_id", clientId)
  discord.searchParams.set("redirect_uri", redirectUri)
  discord.searchParams.set("response_type", "code")
  discord.searchParams.set("scope", "identify")
  discord.searchParams.set("state", state)
  return Response.redirect(discord.toString(), 302)
}
