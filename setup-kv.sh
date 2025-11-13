#!/bin/bash

# Cloudflare KV Setup Script
# This script helps set up the KV namespace for telemetry storage

echo "🔧 Cloudflare KV Setup"
echo "======================"
echo ""

# Check if wrangler is available
if ! command -v wrangler &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    echo ""
    echo "Please run one of these commands first:"
    echo "  npm install -g wrangler"
    echo "  or"
    echo "  pnpm add -g wrangler"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Use npx if wrangler not in PATH
WRANGLER_CMD="wrangler"
if ! command -v wrangler &> /dev/null; then
    WRANGLER_CMD="npx wrangler"
fi

echo "📦 Step 1: Creating KV namespace..."
echo ""

# Create KV namespace
$WRANGLER_CMD kv:namespace create "TELEMETRY_KV" 2>&1 | tee /tmp/kv_output.txt

# Extract namespace ID from output
NAMESPACE_ID=$(grep -oP 'id = "\K[^"]+' /tmp/kv_output.txt | head -1)

if [ -z "$NAMESPACE_ID" ]; then
    echo ""
    echo "⚠️  Could not automatically extract namespace ID."
    echo ""
    echo "Please manually:"
    echo "1. Go to https://dash.cloudflare.com"
    echo "2. Navigate to Workers & Pages > KV"
    echo "3. Find the 'TELEMETRY_KV' namespace"
    echo "4. Copy its ID"
    echo "5. Update wrangler.toml with the ID"
    echo ""
    exit 1
fi

echo ""
echo "✅ KV namespace created!"
echo "   Namespace ID: $NAMESPACE_ID"
echo ""

# Update wrangler.toml
echo "📝 Step 2: Updating wrangler.toml..."

# Check if wrangler.toml exists
if [ ! -f "wrangler.toml" ]; then
    echo "❌ wrangler.toml not found!"
    exit 1
fi

# Create backup
cp wrangler.toml wrangler.toml.backup

# Update wrangler.toml with namespace ID
cat > wrangler.toml << EOF
name = "austinxyz-lol"
compatibility_date = "2024-01-01"
pages_build_output_dir = "out"

# KV namespace binding for telemetry data
[[kv_namespaces]]
binding = "TELEMETRY_KV"
id = "$NAMESPACE_ID"
EOF

echo "✅ wrangler.toml updated!"
echo ""

echo "🔗 Step 3: Binding KV to Pages project..."
echo ""
echo "Now you need to bind the KV namespace to your Cloudflare Pages project:"
echo ""
echo "1. Go to https://dash.cloudflare.com"
echo "2. Navigate to Workers & Pages > Pages"
echo "3. Select your 'austinxyz.lol' project"
echo "4. Go to Settings > Functions"
echo "5. Under 'KV namespace bindings', click 'Add binding'"
echo "6. Set:"
echo "   - Variable name: TELEMETRY_KV"
echo "   - KV namespace: TELEMETRY_KV"
echo "7. Click 'Save'"
echo ""
echo "✅ Setup complete! After binding in the dashboard, run ./test-telemetry.sh to test."
echo ""

