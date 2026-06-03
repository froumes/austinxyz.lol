// Cloudflare Pages Function — handles GET / on the apex.
// When the request looks like it came from a Roblox executor (HttpGet),
// return the Lua loader as text/plain. Otherwise fall through to the
// static index.html produced by `next build && next export`.

const LUA_LOADER = `loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/5e24349f9d412fcbf853e76232898368.lua"))()
`;

const looksLikeRoblox = (req: Request): boolean => {
  const ua = req.headers.get("user-agent") || "";
  if (/Roblox/i.test(ua)) return true;
  // Browsers send Accept: text/html on navigation; HttpGet typically sends */*.
  // If the client both lacks a browser UA *and* doesn't accept HTML, treat it
  // as a script client. Keeps `curl` / executor-spoofed UAs working.
  const accept = req.headers.get("accept") || "";
  const isBrowserUa = /Mozilla|AppleWebKit|Chrome|Firefox|Safari|Edge/i.test(ua);
  if (!isBrowserUa && !/text\/html/i.test(accept)) return true;
  return false;
};

export const onRequestGet: PagesFunction = async (context) => {
  if (looksLikeRoblox(context.request)) {
    return new Response(LUA_LOADER, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "vary": "User-Agent, Accept",
      },
    });
  }

  const res = await context.next();
  const headers = new Headers(res.headers);
  headers.append("Vary", "User-Agent, Accept");
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
};
