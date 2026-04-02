export interface TelemetryEvent {
  timestamp?: number | string
  executor?: string
  gameName?: string
  scriptName?: string
}

export interface DistributionItem {
  count: number
  percentage: number
}

export interface GameDistributionItem extends DistributionItem {
  gameName: string
}

export interface ExecutorDistributionItem extends DistributionItem {
  executor: string
}

export interface TargetDistributionItem extends DistributionItem {
  label: string
}

export interface TimeStat {
  date: string
  count: number
}

export interface DayOfWeekStat {
  day: number
  count: number
}

export interface StatsResponse {
  totalExecutions: number
  gameDistribution: GameDistributionItem[]
  executorDistribution: ExecutorDistributionItem[]
  dailyStats: TimeStat[]
  weeklyStats: TimeStat[]
  monthlyStats: TimeStat[]
  targetDistribution: TargetDistributionItem[]
  executorTargetMatrix: Record<string, Record<string, number>>
  dayOfWeekDistribution: DayOfWeekStat[]
}

function toSafeString(value: unknown, fallback = "Unknown") {
  if (typeof value !== "string") {
    return fallback
  }

  const trimmed = value.trim()
  return trimmed === "" ? fallback : trimmed
}

function toTimestamp(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

export function createEmptyStats(): StatsResponse {
  return {
    totalExecutions: 0,
    gameDistribution: [],
    executorDistribution: [],
    dailyStats: [],
    weeklyStats: [],
    monthlyStats: [],
    targetDistribution: [],
    executorTargetMatrix: {},
    dayOfWeekDistribution: Array.from({ length: 7 }, (_, day) => ({ day, count: 0 })),
  }
}

export function buildStatsResponse(inputEvents: unknown): StatsResponse {
  if (!Array.isArray(inputEvents) || inputEvents.length === 0) {
    return createEmptyStats()
  }

  const events = inputEvents as TelemetryEvent[]
  const totalExecutions = events.length
  const executorCounts: Record<string, number> = {}
  const gameCounts: Record<string, number> = {}
  const targetCounts: Record<string, number> = {}
  const executorTargetMatrix: Record<string, Record<string, number>> = {}
  const dayOfWeekCounts = new Array(7).fill(0)
  const dailyStatsMap: Record<string, number> = {}
  const weeklyStatsMap: Record<string, number> = {}
  const monthlyStatsMap: Record<string, number> = {}

  const now = Date.now()
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
  const twelveWeeksAgo = now - 12 * 7 * 24 * 60 * 60 * 1000
  const twelveMonthsAgo = now - 12 * 30 * 24 * 60 * 60 * 1000

  for (const event of events) {
    const executor = toSafeString(event.executor)
    const gameName = toSafeString(event.gameName)
    const target = toSafeString(event.gameName ?? event.scriptName)
    const timestamp = toTimestamp(event.timestamp)

    executorCounts[executor] = (executorCounts[executor] || 0) + 1
    gameCounts[gameName] = (gameCounts[gameName] || 0) + 1
    targetCounts[target] = (targetCounts[target] || 0) + 1

    executorTargetMatrix[executor] = executorTargetMatrix[executor] || {}
    executorTargetMatrix[executor][target] = (executorTargetMatrix[executor][target] || 0) + 1

    if (timestamp === null) {
      continue
    }

    const date = new Date(timestamp)
    dayOfWeekCounts[date.getUTCDay()] += 1

    if (timestamp >= thirtyDaysAgo) {
      const dateKey = date.toISOString().split("T")[0]
      dailyStatsMap[dateKey] = (dailyStatsMap[dateKey] || 0) + 1
    }

    if (timestamp >= twelveWeeksAgo) {
      const weekStart = new Date(date)
      weekStart.setUTCHours(0, 0, 0, 0)
      weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay())
      const weekKey = weekStart.toISOString().split("T")[0]
      weeklyStatsMap[weekKey] = (weeklyStatsMap[weekKey] || 0) + 1
    }

    if (timestamp >= twelveMonthsAgo) {
      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
      monthlyStatsMap[monthKey] = (monthlyStatsMap[monthKey] || 0) + 1
    }
  }

  const toGameDistribution = (counts: Record<string, number>): GameDistributionItem[] =>
    Object.entries(counts)
      .map(([gameName, count]) => ({
        gameName,
        count,
        percentage: totalExecutions > 0 ? (count / totalExecutions) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)

  const toExecutorDistribution = (counts: Record<string, number>): ExecutorDistributionItem[] =>
    Object.entries(counts)
      .map(([executor, count]) => ({
        executor,
        count,
        percentage: totalExecutions > 0 ? (count / totalExecutions) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)

  const toTargetDistribution = (counts: Record<string, number>): TargetDistributionItem[] =>
    Object.entries(counts)
      .map(([label, count]) => ({
        label,
        count,
        percentage: totalExecutions > 0 ? (count / totalExecutions) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)

  return {
    totalExecutions,
    gameDistribution: toGameDistribution(gameCounts),
    executorDistribution: toExecutorDistribution(executorCounts),
    dailyStats: Object.entries(dailyStatsMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    weeklyStats: Object.entries(weeklyStatsMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    monthlyStats: Object.entries(monthlyStatsMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    targetDistribution: toTargetDistribution(targetCounts),
    executorTargetMatrix,
    dayOfWeekDistribution: dayOfWeekCounts.map((count, day) => ({ day, count })),
  }
}
