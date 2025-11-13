# API Key Setup Guide

## Step 1: Generated API Key

Your secure API key has been generated. Use this key in both places below.

## Step 2: Add to Cloudflare Pages (Environment Variable)

1. Go to **https://dash.cloudflare.com**
2. **Workers & Pages** → **Pages** → your **austinxyz.lol** project
3. Click **Settings** tab
4. Click **Environment variables** (in left sidebar)
5. Click **Add variable**
6. Fill in:
   - **Variable name**: `TELEMETRY_API_KEY`
   - **Value**: `[YOUR_GENERATED_KEY]` (paste the key from Step 1)
   - **Environment**: Select **Production** (and **Preview** if you want to test)
7. Click **Save**

⚠️ **Important**: Make sure the variable name is exactly `TELEMETRY_API_KEY` (case-sensitive)

## Step 3: Update Roblox Script

Update `badscripthub/BadScriptsHub_Loader.lua`:

Find line 69:
```lua
TELEMETRY_API_KEY = "",  -- Set your API key here
```

Replace with:
```lua
TELEMETRY_API_KEY = "[YOUR_GENERATED_KEY]",  -- Same key as Cloudflare env var
```

## Step 4: Test

After setting both:
1. Wait 1-2 minutes for Cloudflare to deploy
2. Test with API key:
   ```bash
   curl -X POST https://austinxyz.lol/api/telemetry \
     -H "Content-Type: application/json" \
     -H "X-API-Key: [YOUR_GENERATED_KEY]" \
     -d '{
       "gameName": "Test Game",
       "gamePlaceId": "123456789",
       "scriptName": "Test Script",
       "executor": "Test",
       "timestamp": '$(date +%s000)'
     }'
   ```

3. Test without API key (should fail):
   ```bash
   curl -X POST https://austinxyz.lol/api/telemetry \
     -H "Content-Type: application/json" \
     -d '{"gameName":"Test","gamePlaceId":"123","scriptName":"Test"}'
   # Should return: {"error":"Invalid API key"}
   ```

## Security Notes

- ✅ Keep the API key secret
- ✅ Don't commit it to public repositories
- ✅ Rotate the key if compromised
- ✅ The key is stored securely in Cloudflare (encrypted)

## Troubleshooting

**"Invalid API key" error:**
- Check variable name is exactly `TELEMETRY_API_KEY`
- Make sure key matches in both Cloudflare and Roblox script
- Wait 1-2 minutes after adding env var for deployment

**Still getting "Storage not configured":**
- This is different - make sure KV is set up (wrangler.toml)

