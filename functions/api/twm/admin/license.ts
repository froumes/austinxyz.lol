import {
  badRequest,
  Env,
  json,
  licenseKey,
  normalizeLicense,
  requireAdmin,
  requireKv,
} from "../../../../lib/twm-auth"

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const adminError = requireAdmin(request, env)
  if (adminError) return adminError
  const kv = requireKv(env)
  if (kv instanceof Response) return kv

  const url = new URL(request.url)
  const key = url.searchParams.get("license_key")?.trim() || ""
  if (!key) return badRequest("Missing license_key")
  const record = await kv.get(licenseKey(key), "json")
  return json({ license_key: key, record })
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const adminError = requireAdmin(request, env)
  if (adminError) return adminError
  const kv = requireKv(env)
  if (kv instanceof Response) return kv

  let body: any
  try {
    body = await request.json()
  } catch {
    return badRequest("Invalid JSON")
  }

  const key = String(body?.license_key || "").trim()
  if (!key) return badRequest("Missing license_key")
  const record = normalizeLicense(body)
  await kv.put(licenseKey(key), JSON.stringify(record))
  return json({ ok: true, license_key: key, record })
}
