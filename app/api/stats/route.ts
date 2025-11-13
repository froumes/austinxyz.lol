import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const TELEMETRY_FILE = path.join(process.cwd(), 'data', 'telemetry.json')

interface TelemetryEvent {
  timestamp: number
  gameName: string
  gamePlaceId: string
  scriptName: string
  executor?: string
}

interface GameStats {
  gameName: string
  count: number
  percentage: number
}

interface TimeStats {
  date: string
  count: number
}

export async function GET() {
  try {
    // Read telemetry data
    let events: TelemetryEvent[] = []
    try {
      const fileContent = await fs.readFile(TELEMETRY_FILE, 'utf-8')
      events = JSON.parse(fileContent)
    } catch (error) {
      // File doesn't exist or is invalid, return empty stats
      return NextResponse.json({
        totalExecutions: 0,
        gameDistribution: [],
        dailyStats: [],
        weeklyStats: [],
        monthlyStats: [],
      })
    }

    // Calculate total executions
    const totalExecutions = events.length

    // Calculate game distribution
    const gameCounts: Record<string, number> = {}
    events.forEach((event) => {
      const key = event.gameName
      gameCounts[key] = (gameCounts[key] || 0) + 1
    })

    const gameDistribution: GameStats[] = Object.entries(gameCounts)
      .map(([gameName, count]) => ({
        gameName,
        count,
        percentage: totalExecutions > 0 ? (count / totalExecutions) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)

    // Calculate daily stats (last 30 days)
    const dailyStatsMap: Record<string, number> = {}
    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

    events
      .filter((event) => event.timestamp >= thirtyDaysAgo)
      .forEach((event) => {
        const date = new Date(event.timestamp)
        const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD
        dailyStatsMap[dateKey] = (dailyStatsMap[dateKey] || 0) + 1
      })

    const dailyStats: TimeStats[] = Object.entries(dailyStatsMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate weekly stats (last 12 weeks)
    const weeklyStatsMap: Record<string, number> = {}
    const twelveWeeksAgo = now - 12 * 7 * 24 * 60 * 60 * 1000

    events
      .filter((event) => event.timestamp >= twelveWeeksAgo)
      .forEach((event) => {
        const date = new Date(event.timestamp)
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0]
        weeklyStatsMap[weekKey] = (weeklyStatsMap[weekKey] || 0) + 1
      })

    const weeklyStats: TimeStats[] = Object.entries(weeklyStatsMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate monthly stats (last 12 months)
    const monthlyStatsMap: Record<string, number> = {}
    const twelveMonthsAgo = now - 12 * 30 * 24 * 60 * 60 * 1000

    events
      .filter((event) => event.timestamp >= twelveMonthsAgo)
      .forEach((event) => {
        const date = new Date(event.timestamp)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthlyStatsMap[monthKey] = (monthlyStatsMap[monthKey] || 0) + 1
      })

    const monthlyStats: TimeStats[] = Object.entries(monthlyStatsMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      totalExecutions,
      gameDistribution,
      dailyStats,
      weeklyStats,
      monthlyStats,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

