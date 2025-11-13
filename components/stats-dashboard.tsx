"use client"

import React, { useState, useEffect } from "react"
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { TrendingUp, Gamepad2, Calendar } from "lucide-react"

interface GameStats {
  gameName: string
  count: number
  percentage: number
}

interface TimeStats {
  date: string
  count: number
}

interface StatsData {
  totalExecutions: number
  gameDistribution: GameStats[]
  dailyStats: TimeStats[]
  weeklyStats: TimeStats[]
  monthlyStats: TimeStats[]
}

interface StatsDashboardProps {
  currentTheme: {
    BackgroundColor: string
    SurfaceColor: string
    AccentColor: string
    TextColor: string
    SecondaryTextColor: string
    BorderColor: string
  }
}

const COLORS = [
  "#FF7A90", "#7A90FF", "#90FF7A", "#FF907A", "#7AFF90",
  "#FFAA7A", "#AA7AFF", "#7AFFAA", "#FF7AAA", "#AAFF7A"
]

export default function StatsDashboard({ currentTheme }: StatsDashboardProps) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">("daily")

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/stats")
        if (!response.ok) {
          throw new Error("Failed to fetch stats")
        }
        const data = await response.json()
        setStats(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load statistics")
        console.error("Error fetching stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div
        className="backdrop-blur-sm border-2 rounded-xl p-8 text-center"
        style={{
          backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
          borderColor: currentTheme.BorderColor,
        }}
      >
        <p style={{ color: currentTheme.SecondaryTextColor }}>Loading statistics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="backdrop-blur-sm border-2 rounded-xl p-8 text-center"
        style={{
          backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
          borderColor: currentTheme.BorderColor,
        }}
      >
        <p style={{ color: currentTheme.AccentColor }}>Error: {error}</p>
      </div>
    )
  }

  if (!stats || stats.totalExecutions === 0) {
    return (
      <div
        className="backdrop-blur-sm border-2 rounded-xl p-8 text-center"
        style={{
          backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
          borderColor: currentTheme.BorderColor,
        }}
      >
        <p style={{ color: currentTheme.SecondaryTextColor }}>No statistics available yet</p>
      </div>
    )
  }

  const timeStats = timeRange === "daily" ? stats.dailyStats : timeRange === "weekly" ? stats.weeklyStats : stats.monthlyStats
  const topGames = stats.gameDistribution.slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Total Executions Card */}
      <div
        className="backdrop-blur-sm border-2 rounded-xl p-6 transition-all duration-300"
        style={{
          backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
          borderColor: currentTheme.BorderColor,
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.1)"),
            }}
          >
            <TrendingUp
              className="w-6 h-6"
              style={{ color: currentTheme.AccentColor }}
            />
          </div>
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: currentTheme.TextColor }}
            >
              Total Executions
            </h3>
            <p
              className="text-3xl font-bold mt-1"
              style={{ color: currentTheme.AccentColor }}
            >
              {stats.totalExecutions.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Game Distribution Chart */}
        <div
          className="backdrop-blur-sm border-2 rounded-xl p-6 transition-all duration-300"
          style={{
            backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
            borderColor: currentTheme.BorderColor,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Gamepad2
              className="w-5 h-5"
              style={{ color: currentTheme.AccentColor }}
            />
            <h3
              className="text-lg font-semibold"
              style={{ color: currentTheme.TextColor }}
            >
              Game Distribution
            </h3>
          </div>
          <ChartContainer
            config={topGames.reduce((acc, game, index) => {
              acc[game.gameName] = {
                label: game.gameName,
                color: COLORS[index % COLORS.length],
              }
              return acc
            }, {} as Record<string, { label: string; color: string }>)}
            className="h-[350px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topGames}
                  dataKey="count"
                  nameKey="gameName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={30}
                  paddingAngle={0}
                >
                  {topGames.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [
                      `${value.toLocaleString()} executions`,
                      name
                    ]}
                  />} 
                />
                <ChartLegend 
                  content={<ChartLegendContent 
                    nameKey="gameName"
                    className="mt-4"
                  />}
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Time-based Stats Chart */}
        <div
          className="backdrop-blur-sm border-2 rounded-xl p-6 transition-all duration-300"
          style={{
            backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
            borderColor: currentTheme.BorderColor,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar
                className="w-5 h-5"
                style={{ color: currentTheme.AccentColor }}
              />
              <h3
                className="text-lg font-semibold"
                style={{ color: currentTheme.TextColor }}
              >
                Usage Over Time
              </h3>
            </div>
            <div className="flex gap-2">
              {(["daily", "weekly", "monthly"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className="px-3 py-1 rounded-md text-sm transition-all"
                  style={{
                    backgroundColor:
                      timeRange === range
                        ? currentTheme.AccentColor.replace("rgb", "rgba").replace(")", ", 0.2)")
                        : "transparent",
                    color: timeRange === range ? currentTheme.AccentColor : currentTheme.SecondaryTextColor,
                    border: `1px solid ${timeRange === range ? currentTheme.AccentColor : currentTheme.BorderColor}`,
                  }}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ChartContainer
            config={{
              executions: {
                label: "Executions",
                color: currentTheme.AccentColor,
              },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeStats} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.BorderColor} opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke={currentTheme.SecondaryTextColor}
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    if (timeRange === "daily") {
                      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    } else if (timeRange === "weekly") {
                      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    } else {
                      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
                    }
                  }}
                />
                <YAxis
                  stroke={currentTheme.SecondaryTextColor}
                  style={{ fontSize: "12px" }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: currentTheme.SurfaceColor,
                    borderColor: currentTheme.BorderColor,
                    color: currentTheme.TextColor,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={currentTheme.AccentColor}
                  strokeWidth={2}
                  dot={{ fill: currentTheme.AccentColor, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      {/* Top Games List */}
      <div
        className="backdrop-blur-sm border-2 rounded-xl p-6 transition-all duration-300"
        style={{
          backgroundColor: currentTheme.SurfaceColor.replace("rgb", "rgba").replace(")", ", 0.5)"),
          borderColor: currentTheme.BorderColor,
        }}
      >
        <h3
          className="text-lg font-semibold mb-4"
          style={{ color: currentTheme.TextColor }}
        >
          Top Games
        </h3>
        <div className="space-y-2">
          {topGames.map((game, index) => (
            <div
              key={game.gameName}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                backgroundColor: currentTheme.BackgroundColor.replace("rgb", "rgba").replace(")", ", 0.3)"),
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: COLORS[index % COLORS.length],
                    color: "#fff",
                  }}
                >
                  {index + 1}
                </div>
                <span style={{ color: currentTheme.TextColor }}>{game.gameName}</span>
              </div>
              <div className="flex items-center gap-4">
                <span style={{ color: currentTheme.SecondaryTextColor }}>
                  {game.count.toLocaleString()} executions
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: currentTheme.AccentColor }}
                >
                  {game.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
