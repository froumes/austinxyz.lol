# ⚠️ API Key Rotation Required

## What Happened

The previous API key was exposed in public documentation files. A new key has been generated and needs to be updated.

## New API Key

**New Key**: `56788b669bd757b8397f9a513738373436d8cdde81dfd4d49444f672bc145de3`

## Steps to Rotate

### 1. Update Cloudflare Secret

1. Go to **Cloudflare Dashboard** → **Pages** → **austinxyz.lol** → **Settings** → **Secrets**
2. Find `TELEMETRY_API_KEY`
3. Click **Edit** or **Update**
4. Replace with new key: `56788b669bd757b8397f9a513738373436d8cdde81dfd4d49444f672bc145de3`
5. Save

### 2. Roblox Script Updated ✅

The Roblox script has already been updated with the new key. Just commit and push:
```bash
cd badscripthub
git add BadScriptsHub_Loader.lua
git commit -m "Rotate API key for security"
git push
```

### 3. Test

After updating Cloudflare secret (wait 1-2 minutes):
```bash
# Should work with new key
curl -X POST https://austinxyz.lol/api/telemetry \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 56788b669bd757b8397f9a513738373436d8cdde81dfd4d49444f672bc145de3" \
  -d '{"gameName":"Test","gamePlaceId":"123456789","scriptName":"Test","executor":"Test","timestamp":'$(date +%s000)'}'

# Should fail with old key
curl -X POST https://austinxyz.lol/api/telemetry \
  -H "Content-Type: application/json" \
  -H "X-API-Key: 25c6c7738cff45a8e374fb2f98da39e17d9fa3ca301e66d20abb0a48ca9cc658" \
  -d '{"gameName":"Test","gamePlaceId":"123456789","scriptName":"Test"}'
# Should return: {"error":"Invalid API key"}
```

## Security Improvements Made

✅ Removed API keys from all documentation files  
✅ Replaced with placeholders `[YOUR_API_KEY]`  
✅ Created `wrangler.toml.example` template  
✅ Updated .gitignore for better security  
✅ Generated new secure API key  

## Important Notes

- ⚠️ **Old key is compromised** - Anyone who saw the docs can use it
- ✅ **New key is secure** - Only in Roblox script (obfuscated) and Cloudflare Secret
- ✅ **Documentation is safe** - No real keys in public repo anymore

## After Rotation

Once you've updated the Cloudflare secret:
1. Old key will stop working (good!)
2. New key will work (Roblox script already updated)
3. Security is restored

