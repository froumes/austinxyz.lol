// Cloudflare Pages Function: `/twm/<vanity-or-slot>`.
//
// The TWM stats page is a static export that normally lives at `/twm/`.
// We want the **pretty** URL `/twm/<discord-username>` (or `/twm/<slot_id>`
// as a fallback) to serve the same page, without changing the URL the
// visitor sees in their address bar.
//
// Cloudflare Pages supports this via an internal `env.ASSETS.fetch()` call:
// the function intercepts the request, then asks the static asset server
// to produce `/twm/index.html` and returns that response unchanged.  The
// browser's URL stays as `/twm/austinxyz` — clean, linkable, embeddable.
//
// We do NOT resolve the vanity → slot here.  The client page handles that
// by reading the path segment out of `window.location.pathname` and
// hitting `/api/twm/stats/<identifier>`; the stats endpoint resolves
// vanity names against KV.  Keeping routing dumb here means a static
// HTML response (cacheable, fast) for every visit, regardless of whether
// the slot is live yet.

interface AssetsLike {
  fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>
}

interface TwmNameEnv {
  ASSETS?: AssetsLike
}

interface TwmNameContext {
  request: Request
  env: TwmNameEnv
  params: { name?: string | string[] }
  next?: () => Promise<Response>
}

export async function onRequestGet(context: TwmNameContext): Promise<Response> {
  const { request, env, next } = context

  if (!env.ASSETS) {
    if (next) return next()
    return new Response("ASSETS binding unavailable", { status: 500 })
  }

  // Internally rewrite to the static export of the stats page.  The
  // browser sees nothing different — the URL bar keeps `/twm/<name>`.
  const target = new URL("/twm/", request.url)
  const rewrite = new Request(target.toString(), {
    method: "GET",
    headers: request.headers,
    redirect: "manual",
  })

  const resp = await env.ASSETS.fetch(rewrite)

  // Pass the original response body through but override cache headers —
  // the identifier in the URL changes per-user, and we don't want a CDN
  // edge to serve the same KV content to everyone.  (The stats JSON is
  // uncached separately; this is just the HTML shell.)
  const headers = new Headers(resp.headers)
  headers.set("Cache-Control", "public, max-age=0, must-revalidate")

  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers,
  })
}
