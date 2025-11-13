export async function onRequestGet(context: any) {
  const { env } = context
  
  try {
    // Get data from KV
    const TELEMETRY_KEY = 'telemetry:events'
    let events: any[] = []
    
    if (!env.TELEMETRY_KV) {
      // KV not configured, return empty stats
      return new Response(
        JSON.stringify({
          totalExecutions: 0,
          gameDistribution: [],
          dailyStats: [],
          weeklyStats: [],
          monthlyStats: [],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    try {
      const existing = await env.TELEMETRY_KV.get(TELEMETRY_KEY, 'json')
      if (Array.isArray(existing)) {
        events = existing
      }
    } catch (error) {
      // No existing data, return empty stats
      return new Response(
        JSON.stringify({
          totalExecutions: 0,
          gameDistribution: [],
          executorDistribution: [],
          dailyStats: [],
          weeklyStats: [],
          monthlyStats: [],
          targetDistribution: [],
          executorTargetMatrix: {},
          dayOfWeekDistribution: [],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Calculate total executions
    const totalExecutions = events.length

    // Executor distribution (normalized)
    const executorCounts: Record<string, number> = {}
    events.forEach((event) => {
      const raw = (event.executor && String(event.executor)) || "Unknown"
      const exec = raw.trim() === "" ? "Unknown" : raw
      executorCounts[exec] = (executorCounts[exec] || 0) + 1
    })
    const executorDistribution = Object.entries(executorCounts)
      .map(([executor, count]) => ({
        executor,
        count,
        percentage: totalExecutions > 0 ? (count / totalExecutions) * 100 : 0,
      }))
      .sort((a: any, b: any) => b.count - a.count)

    // Calculate game distribution
    const gameCounts: Record<string, number> = {}
    events.forEach((event) => {
      const key = event.gameName
      gameCounts[key] = (gameCounts[key] || 0) + 1
    })

    const gameDistribution = Object.entries(gameCounts)
      .map(([gameName, count]) => ({
        gameName,
        count,
        percentage: totalExecutions > 0 ? (count / totalExecutions) * 100 : 0,
      }))
      .sort((a: any, b: any) => b.count - a.count)

    // Unified target distribution (prefer gameName from loader mapping; fallback to scriptName)
    const targetCounts: Record<string, number> = {}
    events.forEach((event) => {
      const label = (event.gameName && String(event.gameName)) || (event.scriptName && String(event.scriptName)) || "Unknown"
      targetCounts[label] = (targetCounts[label] || 0) + 1
    })
    const targetDistribution = Object.entries(targetCounts)
      .map(([label, count]) => ({
        label,
        count,
        percentage: totalExecutions > 0 ? (count / totalExecutions) * 100 : 0,
      }))
      .sort((a: any, b: any) => b.count - a.count)

    // Executor x Target matrix (counts)
    const matrix: Record<string, Record<string, number>> = {}
    events.forEach((event) => {
      const execRaw = (event.executor && String(event.executor)) || "Unknown"
      const exec = execRaw.trim() === "" ? "Unknown" : execRaw
      const target = (event.gameName && String(event.gameName)) || (event.scriptName && String(event.scriptName)) || "Unknown"
      matrix[exec] = matrix[exec] || {}
      matrix[exec][target] = (matrix[exec][target] || 0) + 1
    })

    // Day-of-week distribution (0=Sun..6=Sat)
    const dowCounts = new Array(7).fill(0)
    events.forEach((event) => {
      if (event.timestamp) {
        const d = new Date(event.timestamp)
        dowCounts[d.getUTCDay()]++
      }
    })
    const dayOfWeekDistribution = dowCounts.map((count, day) => ({ day, count }))

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

    const dailyStats = Object.entries(dailyStatsMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a: any, b: any) => a.date.localeCompare(b.date))

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

    const weeklyStats = Object.entries(weeklyStatsMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a: any, b: any) => a.date.localeCompare(b.date))

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

    const monthlyStats = Object.entries(monthlyStatsMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a: any, b: any) => a.date.localeCompare(b.date))

    return new Response(
      JSON.stringify({
        totalExecutions,
        gameDistribution,
        executorDistribution,
        dailyStats,
        weeklyStats,
        monthlyStats,
        targetDistribution,
        executorTargetMatrix: matrix,
        dayOfWeekDistribution,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error fetching stats:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

