# Setting Up API Key as Secret

Since your project uses `wrangler.toml` for bindings, you need to add the API key as a **Secret** (not a regular environment variable) in the Cloudflare Dashboard.

## Step 1: Add Secret in Cloudflare Dashboard

1. Go to **https://dash.cloudflare.com**
2. **Workers & Pages** → **Pages** → your **austinxyz.lol** project
3. Click **Settings** tab
4. Look for **"Secrets"** section (or **"Environment variables"** → **"Secrets"** tab)
5. Click **"Add secret"** or **"Create secret"**
6. Fill in:
   - **Variable name**: `TELEMETRY_API_KEY`
   - **Value**: `[YOUR_API_KEY]` (generate with: `openssl rand -hex 32`)
   - **Environment**: Select **Production** (and **Preview** if you want)
7. Click **Save** or **Create**

⚠️ **Important**: 
- Make sure it's a **Secret** (encrypted), not a regular environment variable
- Variable name must be exactly `TELEMETRY_API_KEY` (case-sensitive)
- Secrets are encrypted and not visible in the dashboard after creation

## Step 2: Verify Code is Ready

The code already uses `env.TELEMETRY_API_KEY`, so it will automatically access the secret once you add it. No changes needed to `wrangler.toml` or the function code!

## Step 3: Test After Deployment

After adding the secret, wait 1-2 minutes for deployment, then test:

```bash
# With API key (should work)
curl -X POST https://austinxyz.lol/api/telemetry \
  -H "Content-Type: application/json" \
  -H "X-API-Key: [YOUR_API_KEY]" \
  -d '{
    "gameName": "Test Game",
    "gamePlaceId": "123456789",
    "scriptName": "Test Script",
    "executor": "Test",
    "timestamp": '$(date +%s000)'
  }'

# Without API key (should fail)
curl -X POST https://austinxyz.lol/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"gameName":"Test","gamePlaceId":"123","scriptName":"Test"}'
# Should return: {"error":"Invalid API key"}
```

## How It Works

- **Secrets** are encrypted and stored securely by Cloudflare
- They're accessible in Functions via `env.SECRET_NAME`
- They're NOT stored in `wrangler.toml` (that's why they're secure!)
- The Roblox script has the key hardcoded (which is fine since it's obfuscated)

## Security Notes

✅ **Good**: Secret is encrypted in Cloudflare  
✅ **Good**: Not visible in dashboard after creation  
✅ **Good**: Not in git repository  
⚠️ **Note**: Key is in Roblox script (but scripts are obfuscated, so it's acceptable)

## Troubleshooting

**"Invalid API key" error:**
- Make sure you added it as a **Secret**, not a regular environment variable
- Check the variable name is exactly `TELEMETRY_API_KEY`
- Wait 1-2 minutes after adding for deployment
- Verify the key matches in both Cloudflare Secret and Roblox script

**Can't find "Secrets" section:**
- Look for **"Environment variables"** → **"Secrets"** tab
- Or **"Variables"** → **"Secrets"**
- It might be under **"Functions"** → **"Secrets"**

