import Link from "next/link"
import { ArrowUpRight, Sparkles, ShieldCheck, TerminalSquare, Waves } from "lucide-react"
import { RebuildShell } from "@/components/rebuild-shell"

const setupSteps = [
  {
    number: "01",
    title: "Prepare",
    body: "Review the launcher state and make sure the route is ready to open.",
  },
  {
    number: "02",
    title: "Connect",
    body: "Confirm the hub is synced so the visual state and route data line up.",
  },
  {
    number: "03",
    title: "Launch",
    body: "Enter the shell, keep the motion light, and open the next live surface.",
  },
] as const

const featureCards = [
  {
    icon: Sparkles,
    title: "Fast entry",
    body: "The route opens with a clear primary action and a focused first screen.",
  },
  {
    icon: ShieldCheck,
    title: "Clean state",
    body: "Status, logs, and supporting links are separated so nothing feels buried.",
  },
  {
    icon: Waves,
    title: "Controlled motion",
    body: "Subtle hover, glow, and reveal behavior keeps the page feeling alive.",
  },
  {
    icon: TerminalSquare,
    title: "Launcher surface",
    body: "The route reads like a polished control panel instead of a placeholder.",
  },
] as const

export default function BadScriptHubPage() {
  return (
    <RebuildShell
      eyebrow="route / badscripthub"
      title="BadScriptHub, rewritten from the inside out."
      body="This route now behaves like a real launcher surface: direct entry, visible state, and a cleaner visual hierarchy for the next build phase."
      primaryHref="/stats"
      primaryLabel="View stats"
      secondaryHref="/portfolio"
      secondaryLabel="Open portfolio"
      stats={[
        { label: "build mode", value: "active" },
        { label: "navigation", value: "clear" },
        { label: "motion", value: "on" },
      ]}
      notes={[
        {
          title: "Primary focus",
          body: "Keep the first screen obvious and the next step easy to find.",
        },
        {
          title: "Route discipline",
          body: "Make each panel feel intentional so the interface reads as one system.",
        },
      ]}
      logLines={[
        { command: "$ badscripthub --open", detail: "loading the rewritten launcher surface" },
        { command: "[ok] routes aligned", detail: "home, stats, portfolio, and hub all linked" },
        { command: "[ok] motion stable", detail: "hover states and reveal transitions active" },
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="reveal-element is-visible">
          <div className="mono-label">setup flow</div>
          <h2 className="mt-5 max-w-2xl font-[family-name:var(--font-display)] text-balance text-4xl leading-[0.96] tracking-[-0.05em] text-white sm:text-5xl">
            Three steps, cleaner states, faster entry.
          </h2>
          <p className="body-copy mt-4 max-w-xl text-base sm:text-lg">
            The launcher route now feels like a real product page, with setup guidance, clear visual
            grouping, and a stronger sense of progression.
          </p>

          <div className="mt-8 space-y-4">
            {setupSteps.map((step) => (
              <article
                key={step.number}
                className="group rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-primary/[0.05]"
              >
                <div className="flex items-start gap-5">
                  <div className="text-3xl font-[family-name:var(--font-display)] italic tracking-[-0.04em] text-primary/60 transition-colors group-hover:text-primary">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-white transition-colors group-hover:text-primary">
                      {step.title}
                    </h3>
                    <p className="body-copy mt-2 max-w-lg text-sm">{step.body}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {featureCards.map((item) => {
              const Icon = item.icon

              return (
                <div key={item.title} className="glass-panel rounded-[1.15rem] p-5">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-[0.9rem] border border-primary/15 bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <h3 className="text-lg font-semibold tracking-[-0.03em] text-white">{item.title}</h3>
                  </div>
                  <p className="body-copy mt-3 text-sm">{item.body}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="reveal-element is-visible rounded-[1.5rem] border border-primary/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)),rgba(8,11,18,0.82)] p-5">
            <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
              <div>
                <div className="mono-label text-[0.7rem] text-primary/90">terminal session</div>
                <p className="mt-1 text-sm text-white/42">the route is live and ready</p>
              </div>
              <span className="status-dot status-pulse bg-primary" />
            </div>

            <div className="mt-5 rounded-[1.25rem] border border-white/8 bg-black/30 p-4 font-mono text-[0.8rem] leading-7 text-white/76">
              <pre className="overflow-x-auto whitespace-pre-wrap">
                <code>
                  <span className="text-primary/60"># Prepare BadScriptHub surface</span>
                  {"\n"}$ route --mount hub
                  {"\n\n"}
                  <span className="text-primary/60"># Verify state</span>
                  {"\n"}$ checking navigation, motion, and data flow
                  {"\n"}
                  <span className="text-white/80 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                    [OK] shell aligned and visual states loaded.
                  </span>
                  {"\n\n"}
                  <span className="text-primary/60"># Open next route</span>
                  {"\n"}$ launcher ready
                </code>
              </pre>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                { label: "state", value: "stable" },
                { label: "layout", value: "editorial" },
                { label: "interaction", value: "touch-safe" },
              ].map((item) => (
                <div key={item.label} className="rounded-[1rem] border border-white/8 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/42">{item.label}</div>
                  <div className="mt-2 text-sm text-white/76">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal-element is-visible rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="mono-label text-[0.7rem] text-primary/85">launcher checklist</div>
            <div className="mt-5 space-y-3 text-sm text-white/72">
              {[
                "Primary action remains obvious at first glance.",
                "Secondary actions stay available without crowding the hero.",
                "Motion stays light enough to keep the panel readable.",
                "Every route can still guide the user toward the next useful page.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 border-b border-white/8 pb-3 last:border-b-0 last:pb-0">
                  <span className="status-dot status-pulse mt-1 bg-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal-element is-visible rounded-[1.5rem] border border-primary/18 bg-primary/8 p-6">
            <div className="mono-label text-[0.7rem] text-primary">next surface</div>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/72">
              If you want a more product-like version next, this route can be split into a real setup
              wizard, a downloads page, or a richer control dashboard.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/stats"
                className="magnetic-link inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-background/40 px-4 py-2 text-sm text-white/78 hover:text-white"
              >
                Open stats
                <ArrowUpRight className="size-4" />
              </Link>
              <Link
                href="/portfolio"
                className="magnetic-link inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72 hover:border-primary/35 hover:text-white"
              >
                View portfolio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RebuildShell>
  )
}
