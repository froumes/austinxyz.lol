# Quick KV Setup Instructions

I've created an automated setup script, but since Cloudflare requires authentication, here's the fastest way to set it up:

## Option 1: Automated Setup (Recommended)

1. **Install Wrangler CLI** (if not already installed):
   ```bash
   npm install -g wrangler
   # or
   pnpm add -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Run the setup script**:
   ```bash
   ./setup-kv.sh
   ```

4. **Bind KV to Pages** (manual step in dashboard):
   - Go to https://dash.cloudflare.com
   - Workers & Pages > Pages > austinxyz.lol
   - Settings > Functions
   - Add KV binding: `TELEMETRY_KV` → `TELEMETRY_KV`
   - Save

## Option 2: Manual Setup (5 minutes)

### Step 1: Create KV Namespace
1. Go to https://dash.cloudflare.com
2. Click **Workers & Pages** → **KV**
3. Click **Create a namespace**
4. Name: `TELEMETRY_KV`
5. Click **Add**
6. **Copy the namespace ID** (you'll need it)

### Step 2: Bind to Pages Project
1. Go to **Workers & Pages** → **Pages**
2. Click your **austinxyz.lol** project
3. Go to **Settings** → **Functions**
4. Scroll to **KV namespace bindings**
5. Click **Add binding**
6. Fill in:
   - **Variable name**: `TELEMETRY_KV`
   - **KV namespace**: Select `TELEMETRY_KV` from dropdown
7. Click **Save**

### Step 3: Test
```bash
./test-telemetry.sh austinxyz.lol
```

## Verification

After setup, you should see:
- ✅ Test script sends data successfully
- ✅ Stats API returns data (not empty arrays)
- ✅ Website shows statistics

## Troubleshooting

**"Storage not configured" error:**
- Make sure KV namespace is created
- Make sure it's bound in Pages Settings > Functions
- Wait 1-2 minutes after binding for changes to propagate

**Stats still empty:**
- Run the test script again to send data
- Check Cloudflare Functions logs for errors
- Verify the binding variable name is exactly `TELEMETRY_KV`

