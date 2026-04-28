# TWM Central Auth Setup

This site now includes Cloudflare Pages Functions for TWM panel licensing.
The bot redirects panel users to this site for Discord OAuth, then validates a
short-lived login token before creating a local `twm_session` cookie.

## Cloudflare Environment Variables

Set these in Cloudflare Pages > Settings > Environment variables:

```text
DISCORD_CLIENT_ID=your_discord_application_client_id
DISCORD_CLIENT_SECRET=your_discord_application_client_secret
TWM_AUTH_BASE_URL=https://auth.austinxyz.lol
TWM_ADMIN_API_KEY=random_admin_api_key
```

`TWM_ADMIN_API_KEY` is only for you. Use it to create and update licenses.

## KV Binding

`wrangler.toml` binds `TWM_AUTH_KV`. It currently points at the same KV namespace
as telemetry, using separate key prefixes:

```text
twm:license:<license_key>
twm:oauth-state:<state>
twm:login:<token>
```

You can create a separate KV namespace later and replace the `TWM_AUTH_KV` id.

## Discord Application

Create a Discord application and add this OAuth redirect URI:

```text
https://auth.austinxyz.lol/api/twm/callback
```

Only the `identify` scope is used.

## Create Or Update A License

Generate a license key:

```bash
openssl rand -hex 24
```

Create/update a license:

```bash
curl -X POST https://auth.austinxyz.lol/api/twm/admin/license \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: YOUR_TWM_ADMIN_API_KEY" \
  -d '{
    "license_key": "CUSTOMER_LICENSE_KEY",
    "active": true,
    "admin_discord_ids": ["YOUR_DISCORD_ID"],
    "macro_discord_ids": ["CUSTOMER_DISCORD_ID"],
    "expires_at": null,
    "note": "Customer name or order id"
  }'
```

Read a license:

```bash
curl "https://auth.austinxyz.lol/api/twm/admin/license?license_key=CUSTOMER_LICENSE_KEY" \
  -H "X-Admin-Key: YOUR_TWM_ADMIN_API_KEY"
```

Disable a license:

```bash
curl -X POST https://auth.austinxyz.lol/api/twm/admin/license \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: YOUR_TWM_ADMIN_API_KEY" \
  -d '{
    "license_key": "CUSTOMER_LICENSE_KEY",
    "active": false,
    "admin_discord_ids": [],
    "macro_discord_ids": [],
    "expires_at": null
  }'
```

## Bot Config

On the machine running the bot:

```toml
web_gui_cookie_secure = true
web_auth_server_url = "https://auth.austinxyz.lol"
web_auth_license_key = "CUSTOMER_LICENSE_KEY"
```

Keep `web_gui_password` set if you want a local admin fallback.

## Panel URL

Expose the bot's local panel through Cloudflare Tunnel:

```text
https://panel.austinxyz.lol -> http://127.0.0.1:8080
```

When the user clicks **Login with Discord**, the bot sends them to
`auth.austinxyz.lol`, and `auth.austinxyz.lol` redirects back to that panel URL.
