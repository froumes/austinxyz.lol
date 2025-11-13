# Testing the Statistics System

This guide explains how to test the telemetry and statistics features.

## Prerequisites

1. **Cloudflare KV Setup**: Make sure you've set up the KV namespace in Cloudflare Dashboard
   - Go to Workers & Pages > KV
   - Create a namespace named `TELEMETRY_KV`
   - Bind it to your Pages project under Settings > Functions

2. **Deployed Website**: The API endpoints need to be deployed to Cloudflare Pages

## Testing Methods

### Method 1: Using the Test Script (Easiest)

Run the provided test script:

```bash
cd austinxyz.lol
./test-telemetry.sh austinxyz.lol
```

This will:
- Send test telemetry events to your API
- Display the aggregated statistics
- Show you the JSON response

### Method 2: Manual API Testing with curl

#### Send a single telemetry event:

```bash
curl -X POST https://austinxyz.lol/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "gameName": "Adopt Me",
    "gamePlaceId": "920587237",
    "scriptName": "Auto Farm",
    "executor": "ScriptWare",
    "timestamp": 1700000000000
  }'
```

#### Send multiple test events:

```bash
# Send 10 test events with different games
for i in {1..10}; do
  curl -X POST https://austinxyz.lol/api/telemetry \
    -H "Content-Type: application/json" \
    -d "{
      \"gameName\": \"Test Game $i\",
      \"gamePlaceId\": \"$((1000000000 + i))\",
      \"scriptName\": \"Test Script $i\",
      \"executor\": \"Test Executor\",
      \"timestamp\": $(date +%s000)
    }"
  sleep 0.5
done
```

#### View statistics:

```bash
curl https://austinxyz.lol/api/stats | python3 -m json.tool
```

### Method 3: Using the Roblox Script

The easiest way to test with real data:

1. Open Roblox and join any game
2. Run your BadScriptsHub loader script
3. Execute any script from the hub
4. The script will automatically send telemetry data after successful execution
5. Check the website at `https://austinxyz.lol/badscripthub` to see the stats update

### Method 4: Using Browser DevTools

1. Open your website: `https://austinxyz.lol/badscripthub`
2. Open Browser DevTools (F12)
3. Go to the Console tab
4. Run this JavaScript to send test data:

```javascript
// Send a test telemetry event
fetch('https://austinxyz.lol/api/telemetry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    gameName: 'Test Game',
    gamePlaceId: '123456789',
    scriptName: 'Test Script',
    executor: 'Browser Test',
    timestamp: Date.now()
  })
})
.then(r => r.json())
.then(console.log);

// Wait a moment, then check stats
setTimeout(() => {
  fetch('https://austinxyz.lol/api/stats')
    .then(r => r.json())
    .then(console.log);
}, 1000);
```

## Expected Results

### Telemetry API Response (POST /api/telemetry):
```json
{
  "success": true,
  "message": "Telemetry recorded"
}
```

### Stats API Response (GET /api/stats):
```json
{
  "totalExecutions": 10,
  "gameDistribution": [
    {
      "gameName": "Adopt Me",
      "count": 5,
      "percentage": 50.0
    },
    {
      "gameName": "Brookhaven",
      "count": 3,
      "percentage": 30.0
    }
  ],
  "dailyStats": [
    {
      "date": "2024-01-01",
      "count": 10
    }
  ],
  "weeklyStats": [...],
  "monthlyStats": [...]
}
```

## Troubleshooting

### Issue: "Storage not configured" error
**Solution**: Make sure KV namespace is created and bound in Cloudflare Dashboard

### Issue: Stats show 0 executions
**Solution**: 
- Check if telemetry events are being sent successfully
- Verify KV binding is correct
- Check Cloudflare Functions logs for errors

### Issue: Stats not updating on website
**Solution**:
- The stats refresh every 30 seconds automatically
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for errors

### Issue: CORS errors
**Solution**: Cloudflare Functions handle CORS automatically, but if you see errors, check that you're using the correct domain

## Testing Checklist

- [ ] KV namespace created in Cloudflare Dashboard
- [ ] KV namespace bound to Pages project
- [ ] Website deployed to Cloudflare Pages
- [ ] Test script sends data successfully
- [ ] Stats API returns data
- [ ] Stats dashboard displays on website
- [ ] Stats update automatically (every 30 seconds)
- [ ] Real Roblox script sends telemetry correctly

## Next Steps

After testing:
1. Monitor the stats dashboard on your live website
2. Check Cloudflare Analytics for function invocations
3. Verify data is persisting in KV storage
4. Consider adding more telemetry fields if needed

