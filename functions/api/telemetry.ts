export async function onRequestPost(context: any) {
  const { request, env } = context
  
  try {
    const body = await request.json()
    
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

