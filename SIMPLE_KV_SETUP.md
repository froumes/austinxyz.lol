# Simple KV Setup (No npm needed!)

You don't need npm to test the telemetry system. Just follow these steps:

## Setup KV in Cloudflare Dashboard (2 minutes)

### Step 1: Create KV Namespace
1. Go to: **https://dash.cloudflare.com**
2. Click: **Workers & Pages** → **KV** (left sidebar)
3. Click: **Create a namespace**
4. Name: `TELEMETRY_KV`
5. Click: **Add**

### Step 2: Bind to Pages Project
1. Click: **Workers & Pages** → **Pages**
2. Click your **austinxyz.lol** project
3. Click: **Settings** → **Functions** (left sidebar)
4. Scroll to: **KV namespace bindings**
5. Click: **Add binding**
6. Fill in:
   - **Variable name**: `TELEMETRY_KV`
   - **KV namespace**: Select `TELEMETRY_KV`
7. Click: **Save**

## Test It (No npm needed!)

The test script uses `curl` which you already have:

```bash
cd austinxyz.lol
./test-telemetry.sh austinxyz.lol
```

Or test manually with curl:

```bash
# Send test data
curl -X POST https://austinxyz.lol/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"gameName":"Test Game","gamePlaceId":"123456","scriptName":"Test Script","executor":"Test"}'

# Check stats
curl https://austinxyz.lol/api/stats
```

## That's it!

No npm, no node, no wrangler needed. Just:
1. ✅ Set up KV in dashboard (2 minutes)
2. ✅ Run test script (uses curl)
3. ✅ View stats on your website

The test script works perfectly without npm! 🎉

