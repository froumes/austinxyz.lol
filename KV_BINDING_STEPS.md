# KV Setup - Step by Step with Screenshots Guide

## Step 1: Create KV Namespace

1. Go to **https://dash.cloudflare.com**
2. In the left sidebar, click **Workers & Pages**
3. Click **KV** (it's in the submenu under Workers & Pages)
4. Click the **Create a namespace** button
5. Enter name: `TELEMETRY_KV`
6. Click **Add**

✅ You now have a KV namespace created!

## Step 2: Bind KV to Your Pages Project (This is the "bindings" part!)

1. Still in Cloudflare Dashboard
2. Click **Workers & Pages** → **Pages** (in left sidebar)
3. Find and click your **austinxyz.lol** project
4. Click the **Settings** tab (at the top)
5. In the left sidebar under Settings, click **Functions**
6. Scroll down to find **KV namespace bindings** section
7. Click **Add binding** button
8. Fill in the form:
   - **Variable name**: `TELEMETRY_KV` (must match exactly)
   - **KV namespace**: Click dropdown and select `TELEMETRY_KV`
9. Click **Save**

✅ That's it! The binding is now configured.

## Step 3: Test It

Wait about 30 seconds for the binding to propagate, then:

```bash
cd austinxyz.lol
./test-telemetry.sh austinxyz.lol
```

You should now see:
- ✅ "success: true" responses
- ✅ Stats showing actual numbers (not zeros)

## What "Bindings" Means

**Bindings** = Connecting your KV storage to your Cloudflare Pages Functions so they can access it.

Think of it like:
- **KV Namespace** = The storage box
- **Binding** = The key that lets your Functions access that storage box

Both steps are required:
1. ✅ Create the storage box (KV namespace)
2. ✅ Give your Functions the key (binding)

## Troubleshooting

**"Storage not configured" error:**
- Make sure you completed BOTH steps (namespace + binding)
- Wait 1-2 minutes after binding for changes to take effect
- Check that variable name is exactly `TELEMETRY_KV` (case-sensitive)

**Stats still empty:**
- Run the test script to send some data first
- Check that binding variable name matches exactly: `TELEMETRY_KV`

