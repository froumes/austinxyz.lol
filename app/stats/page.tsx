import StatsDashboard from "@/components/stats-dashboard"
import { RebuildShell } from "@/components/rebuild-shell"

const currentTheme = {
  BackgroundColor: "rgb(18, 20, 20)",
  SurfaceColor: "rgb(30, 32, 32)",
  AccentColor: "rgb(255, 182, 141)",
  TextColor: "rgb(226, 226, 226)",
  SecondaryTextColor: "rgb(184, 184, 184)",
  BorderColor: "rgb(86, 67, 56)",
}

export default function StatsPage() {
  return (
    <RebuildShell
      eyebrow="route / stats"
      title="Telemetry made legible."
      body="Live execution trends, distribution charts, and time-based usage are surfaced in a cleaner dashboard built for review."
      primaryHref="/badscripthub"
      primaryLabel="Open BadScriptHub"
      secondaryHref="/portfolio"
      secondaryLabel="View portfolio"
      stats={[
        { label: "refresh cadence", value: "30s" },
        { label: "series tracked", value: "4" },
        { label: "live state", value: "on" },
      ]}
      notes={[
        {
          title: "Observability",
          body: "The dashboard pulls from the same API route and refreshes automatically.",
        },
        {
          title: "Readable ranges",
          body: "Daily, weekly, and monthly views stay accessible without changing routes.",
        },
      ]}
      logLines={[
        { command: "$ api/stats --watch", detail: "pulling the latest telemetry stream" },
        { command: "[ok] charts online", detail: "distribution, timelines, and top targets active" },
        { command: "[ok] refresh loop", detail: "stats update every 30 seconds" },
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="reveal-element is-visible">
          <div className="mono-label">live metrics</div>
          <h2 className="mt-5 max-w-xl font-[family-name:var(--font-display)] text-balance text-4xl leading-[0.96] tracking-[-0.05em] text-white sm:text-5xl">
            Execution traffic and game distribution.
          </h2>
          <p className="body-copy mt-4 max-w-xl text-base sm:text-lg">
            The current dashboard keeps the visual hierarchy tight so the data reads like a premium
            control panel instead of a utilitarian dump.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                label: "Timeline",
                value: "Daily / weekly / monthly views",
              },
              {
                label: "Signals",
                value: "Games, executors, and targets",
              },
              {
                label: "Refresh",
                value: "Auto sync from /api/stats",
              },
              {
                label: "Motion",
                value: "Ambient transitions and hover states",
              },
            ].map((item) => (
              <div key={item.label} className="glass-panel rounded-[1.15rem] p-5">
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/42">
                  {item.label}
                </div>
                <div className="mt-3 text-sm leading-7 text-white/72">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal-element is-visible">
          <StatsDashboard currentTheme={currentTheme} />
        </div>
      </div>

      <div className="reveal-element mt-12 grid gap-4 md:grid-cols-3">
        {[
          {
            label: "focus",
            value: "clear telemetry surfaces",
          },
          {
            label: "interaction",
            value: "simple filters and readable charts",
          },
          {
            label: "system",
            value: "pulls from the live stats endpoint",
          },
        ].map((item) => (
          <div key={item.label} className="panel rounded-[1.25rem] p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-white/42">{item.label}</div>
            <div className="mt-3 text-sm text-white/76">{item.value}</div>
          </div>
        ))}
      </div>
    </RebuildShell>
  )
}
