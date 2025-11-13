// Simple HMAC verification helper
async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || !secret) return false
  
  // Create HMAC-SHA256 hash
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(body)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  const signatureArray = Array.from(new Uint8Array(signatureBuffer))
  const expectedSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return signature.toLowerCase() === expectedSignature.toLowerCase()
}

export async function onRequestDelete(context: any) {
  const { request, env } = context
  
  try {
    if (!env.TELEMETRY_KV) {
      return new Response(
        JSON.stringify({ error: 'Storage not configured' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Get API key from environment
    const API_KEY = env.TELEMETRY_API_KEY || ''
    
    // Require API key for clearing data
    const providedKey = request.headers.get('X-API-Key')
    if (API_KEY && providedKey !== API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Delete all telemetry data
    const TELEMETRY_KEY = 'telemetry:events'
    await env.TELEMETRY_KV.delete(TELEMETRY_KEY)

    return new Response(
      JSON.stringify({ success: true, message: 'Telemetry data cleared' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error clearing telemetry:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export async function onRequestPost(context: any) {
  const { request, env } = context
  
  try {
    // Get API key from environment (set in Cloudflare Pages settings)
    const API_KEY = env.TELEMETRY_API_KEY || ''
    const RATE_LIMIT_KEY = 'telemetry:ratelimit:'
    
    // Rate limiting: Check if IP has sent too many requests
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown'
    const rateLimitKey = `${RATE_LIMIT_KEY}${clientIP}`
    const MAX_REQUESTS_PER_MINUTE = 10
    
    if (env.TELEMETRY_KV) {
      const rateLimitData = await env.TELEMETRY_KV.get(rateLimitKey, 'json')
      if (rateLimitData) {
        const { count, resetTime } = rateLimitData
        const now = Date.now()
        
        if (now < resetTime) {
          if (count >= MAX_REQUESTS_PER_MINUTE) {
            return new Response(
              JSON.stringify({ error: 'Rate limit exceeded. Please wait before sending more requests.' }),
              { 
                status: 429,
                headers: { 'Content-Type': 'application/json' }
              }
            )
          }
          // Increment count
          await env.TELEMETRY_KV.put(rateLimitKey, JSON.stringify({
            count: count + 1,
            resetTime
          }))
        } else {
          // Reset counter
          await env.TELEMETRY_KV.put(rateLimitKey, JSON.stringify({
            count: 1,
            resetTime: now + 60000 // 1 minute from now
          }))
        }
      } else {
        // First request from this IP
        await env.TELEMETRY_KV.put(rateLimitKey, JSON.stringify({
          count: 1,
          resetTime: Date.now() + 60000
        }))
      }
    }
    
    // Get raw body for signature verification
    const rawBody = await request.text()
    let body: any
    try {
      body = JSON.parse(rawBody)
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    // API Key authentication
    const providedKey = request.headers.get('X-API-Key') || body.apiKey
    if (API_KEY && providedKey !== API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Optional: Signature verification (more secure)
    const signature = request.headers.get('X-Signature')
    if (signature && API_KEY) {
      const isValid = await verifySignature(rawBody, signature, API_KEY)
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }
    
    // Validate required fields
    if (!body.gameName || !body.gamePlaceId || !body.scriptName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: gameName, gamePlaceId, scriptName' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Validate timestamp (reject requests older than 5 minutes or future requests)
    const requestTime = body.timestamp || Date.now()
    const now = Date.now()
    const timeDiff = Math.abs(now - requestTime)
    if (timeDiff > 5 * 60 * 1000) { // 5 minutes
      return new Response(
        JSON.stringify({ error: 'Invalid timestamp' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Validate PlaceId format (should be numeric string)
    // Roblox Place IDs can be 6-19 digits
    const placeId = String(body.gamePlaceId).trim()
    if (!/^\d+$/.test(placeId) || placeId.length < 6 || placeId.length > 19) {
      return new Response(
        JSON.stringify({ error: 'Invalid game PlaceId format' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Sanitize and validate game name and script name length
    const gameName = String(body.gameName).trim()
    const scriptName = String(body.scriptName).trim()
    
    if (gameName.length > 100 || scriptName.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Field length exceeds maximum' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Create telemetry event
    const event = {
      timestamp: body.timestamp || Date.now(),
      gameName: String(body.gameName).trim(),
      gamePlaceId: String(body.gamePlaceId).trim(),
      scriptName: String(body.scriptName).trim(),
      executor: body.executor ? String(body.executor).trim() : undefined,
    }

    // Get existing data from KV
    const TELEMETRY_KEY = 'telemetry:events'
    let events: any[] = []
    
    if (env.TELEMETRY_KV) {
      try {
        const existing = await env.TELEMETRY_KV.get(TELEMETRY_KEY, 'json')
        if (Array.isArray(existing)) {
          events = existing
        }
      } catch (error) {
        // No existing data or invalid, start with empty array
        events = []
      }

      // Add new event
      events.push(event)

      // Store back to KV
      await env.TELEMETRY_KV.put(TELEMETRY_KEY, JSON.stringify(events))
    } else {
      // KV not configured - return error or use alternative storage
      console.warn('TELEMETRY_KV not configured')
      return new Response(
        JSON.stringify({ error: 'Storage not configured' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Telemetry recorded' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error recording telemetry:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

