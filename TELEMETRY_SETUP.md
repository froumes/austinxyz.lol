# Telemetry System Setup

This project uses Cloudflare Pages Functions with KV storage for the telemetry system.

## Setup Instructions

### 1. Create KV Namespace

1. Go to Cloudflare Dashboard
2. Navigate to Workers & Pages > KV
3. Create a new KV namespace named `TELEMETRY_KV`
4. Copy the namespace ID

### 2. Configure KV Binding in Cloudflare Pages

1. Go to your Cloudflare Pages project
2. Navigate to Settings > Functions
3. Add KV namespace binding:
   - Variable name: `TELEMETRY_KV`
   - KV namespace: Select the `TELEMETRY_KV` namespace you created

### 3. Update wrangler.toml (Optional)

If you want to use wrangler.toml for local development:
- Replace `YOUR_KV_NAMESPACE_ID` in `wrangler.toml` with your actual KV namespace ID

## API Endpoints

- `POST /api/telemetry` - Receives telemetry data from Roblox scripts
- `GET /api/stats` - Returns aggregated statistics

## Notes

- The frontend will work even if KV is not configured (will show empty stats)
- Telemetry data is stored in KV under the key `telemetry:events`
- Functions are located in `/functions/api/` directory

