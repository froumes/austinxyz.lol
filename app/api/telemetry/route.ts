import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const TELEMETRY_FILE = path.join(process.cwd(), 'data', 'telemetry.json')

interface TelemetryEvent {
  timestamp: number
  gameName: string
  gamePlaceId: string
  scriptName: string
  executor?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.gameName || !body.gamePlaceId || !body.scriptName) {
      return NextResponse.json(
        { error: 'Missing required fields: gameName, gamePlaceId, scriptName' },
        { status: 400 }
      )
    }

    // Create telemetry event
    const event: TelemetryEvent = {
      timestamp: body.timestamp || Date.now(),
      gameName: String(body.gameName).trim(),
      gamePlaceId: String(body.gamePlaceId).trim(),
      scriptName: String(body.scriptName).trim(),
      executor: body.executor ? String(body.executor).trim() : undefined,
    }

    // Read existing data
    let events: TelemetryEvent[] = []
    try {
      const fileContent = await fs.readFile(TELEMETRY_FILE, 'utf-8')
      events = JSON.parse(fileContent)
    } catch (error) {
      // File doesn't exist or is invalid, start with empty array
      events = []
    }

    // Add new event
    events.push(event)

    // Write back to file
    await fs.writeFile(TELEMETRY_FILE, JSON.stringify(events, null, 2), 'utf-8')

    return NextResponse.json({ success: true, message: 'Telemetry recorded' })
  } catch (error) {
    console.error('Error recording telemetry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

