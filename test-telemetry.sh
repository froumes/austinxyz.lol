#!/bin/bash

# Test script for telemetry API
# Usage: ./test-telemetry.sh [your-domain]
# Example: ./test-telemetry.sh austinxyz.lol

DOMAIN=${1:-"austinxyz.lol"}
API_URL="https://${DOMAIN}/api/telemetry"
STATS_URL="https://${DOMAIN}/api/stats"

echo "🧪 Testing Telemetry API"
echo "========================"
echo ""

# Test 1: Send a single telemetry event
echo "📤 Sending test telemetry event..."
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "gameName": "Test Game",
    "gamePlaceId": "123456789",
    "scriptName": "Test Script",
    "executor": "Test Executor",
    "timestamp": '$(date +%s000)'
  }')

echo "Response: $RESPONSE"
echo ""

# Test 2: Send multiple events with different games
echo "📤 Sending multiple test events..."
for i in {1..5}; do
  GAME_NAMES=("Adopt Me" "Brookhaven" "Blox Fruits" "Pet Simulator X" "Tower of Hell")
  SCRIPT_NAMES=("Auto Farm" "ESP" "Aimbot" "Speed Hack" "Fly Script")
  
  GAME_NAME=${GAME_NAMES[$((RANDOM % ${#GAME_NAMES[@]}))]}
  SCRIPT_NAME=${SCRIPT_NAMES[$((RANDOM % ${#SCRIPT_NAMES[@]}))]}
  PLACE_ID=$((1000000000 + RANDOM % 1000000000))
  
  curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"gameName\": \"$GAME_NAME\",
      \"gamePlaceId\": \"$PLACE_ID\",
      \"scriptName\": \"$SCRIPT_NAME\",
      \"executor\": \"Test Executor\",
      \"timestamp\": $(date +%s000)
    }" > /dev/null
  
  echo "  ✓ Sent event $i: $GAME_NAME - $SCRIPT_NAME"
  sleep 0.5
done

echo ""
echo "📊 Fetching statistics..."
echo ""

# Test 3: Get stats
STATS=$(curl -s "$STATS_URL")
echo "$STATS" | python3 -m json.tool 2>/dev/null || echo "$STATS"
echo ""

echo "✅ Test complete!"
echo ""
echo "💡 Tips:"
echo "  - View stats on your website: https://${DOMAIN}/badscripthub"
echo "  - Check stats API directly: $STATS_URL"
echo "  - Send more test data by running this script again"

