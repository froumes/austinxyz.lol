# Telemetry Security Setup

I've added multiple security layers to prevent fake telemetry data:

## Security Features Implemented

### 1. **API Key Authentication** ✅
- Requires a secret API key to send telemetry
- Set via Cloudflare Pages environment variable: `TELEMETRY_API_KEY`
- Can be sent in header `X-API-Key` or in request body as `apiKey`

### 2. **Rate Limiting** ✅
- Maximum 10 requests per minute per IP address
- Prevents spam and abuse
- Automatically resets after 1 minute

### 3. **Timestamp Validation** ✅
- Rejects requests with timestamps older than 5 minutes
- Prevents replay attacks
- Rejects future timestamps

### 4. **Input Validation** ✅
- Validates PlaceId format (must be numeric, 6-12 digits)
- Validates field lengths (max 100 chars for game/script names)
- Sanitizes all input data

### 5. **HMAC Signature Verification** (Optional) ✅
- Can verify request signatures using HMAC-SHA256
- More secure but requires crypto in Roblox (optional)

## Setup Instructions

### Step 1: Generate API Key

Generate a secure random API key (32+ characters):

```bash
# Option 1: Using openssl
openssl rand -hex 32

# Option 2: Using Python
python3 -c "import secrets; print(secrets.token_hex(32))"

# Option 3: Online generator
# Use: https://www.random.org/strings/
```

**Example key**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

### Step 2: Set Environment Variable in Cloudflare

1. Go to **Cloudflare Dashboard**
2. **Workers & Pages** → **Pages** → your project
3. **Settings** → **Environment variables**
4. Add new variable:
   - **Variable name**: `TELEMETRY_API_KEY`
   - **Value**: Your generated API key
   - **Environment**: Production (and Preview if you want)
5. Click **Save**

### Step 3: Update Roblox Script

The Roblox script needs to include the API key. Update `BadScriptsHub_Loader.lua`:

```lua
-- Add to URLS configuration (around line 68)
TELEMETRY_API_KEY = "your-api-key-here",  -- Same key as Cloudflare env var

-- Update sendTelemetry function to include API key in header
Headers = {
    ["Content-Type"] = "application/json",
    ["X-API-Key"] = URLS.TELEMETRY_API_KEY
},
```

## Security Levels

### Level 1: API Key Only (Recommended for Start)
- ✅ Easy to implement
- ✅ Good protection against casual abuse
- ⚠️ API key visible in script (but obfuscated scripts help)

### Level 2: API Key + Rate Limiting (Current Implementation)
- ✅ API key authentication
- ✅ Rate limiting (10 req/min per IP)
- ✅ Input validation
- ✅ Timestamp validation

### Level 3: API Key + HMAC Signature (Most Secure)
- ✅ Everything from Level 2
- ✅ HMAC signature verification
- ⚠️ Requires crypto library in Roblox
- ⚠️ More complex to implement

## Testing

### Test with API Key:
```bash
curl -X POST https://austinxyz.lol/api/telemetry \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "gameName": "Test Game",
    "gamePlaceId": "123456789",
    "scriptName": "Test Script",
    "executor": "Test",
    "timestamp": '$(date +%s000)'
  }'
```

### Test without API Key (should fail):
```bash
curl -X POST https://austinxyz.lol/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{"gameName":"Test","gamePlaceId":"123","scriptName":"Test"}'
# Should return: {"error":"Invalid API key"}
```

## Important Notes

1. **Keep API key secret**: Don't commit it to public repos
2. **Rotate keys**: Change API key if compromised
3. **Monitor logs**: Check Cloudflare Functions logs for suspicious activity
4. **Rate limits**: Adjust `MAX_REQUESTS_PER_MINUTE` if needed (currently 10)

## Next Steps

1. ✅ Generate API key
2. ✅ Set `TELEMETRY_API_KEY` in Cloudflare Pages environment variables
3. ✅ Update Roblox script to include API key
4. ✅ Test with valid API key
5. ✅ Verify rate limiting works

After setup, only requests with the correct API key will be accepted!

