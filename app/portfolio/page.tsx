import Link from "next/link"
import { ArrowUpRight, ChartColumnBig, FolderCode, Sparkles, TerminalSquare, Waves } from "lucide-react"
import { RebuildShell } from "@/components/rebuild-shell"

const portfolioItems = [
  {
    title: "Cinematic Home",
    tag: "Launch surface",
    body: "The homepage blends layered motion, pointer parallax, and a cinematic hero while keeping the layout legible.",
    href: "/",
    icon: Sparkles,
  },
  {
    title: "Telemetry Dashboard",
    tag: "Observability",
    body: "A live stats experience with charts, range toggles, and a restrained editorial presentation.",
    href: "/stats",
    icon: ChartColumnBig,
  },
  {
    title: "Route Shell System",
    tag: "Layout framework",
    body: "Shared route treatments keep the secondary pages animated, responsive, and consistent.",
    href: "/badscripthub",
    icon: FolderCode,
  },
  {
    title: "Session Terminal",
    tag: "Motion layer",
    body: "Glass panels, pulsing status dots, and code-style logs bring feedback into the interface.",
    href: "/badscripthub",
    icon: TerminalSquare,
  },
] as const

export default function PortfolioPage() {
  return (
    <RebuildShell
      eyebrow="route / portfolio"
      title="A selected archive of the system."
      body="This route now presents the site as a curated body of work: launch surface, analytics, shell system, and motion language."
      primaryHref="/stats"
      primaryLabel="View stats"
      secondaryHref="/badscripthub"
      secondaryLabel="Open BadScriptHub"
      stats={[
        { label: "case studies", value: "4" },
        { label: "design mode", value: "editorial" },
        { label: "motion", value: "layered" },
      ]}
      notes={[
        {
          title: "Unified system",
          body: "The same palette, spacing logic, and glow treatment carry across the routes.",
        },
        {
          title: "Built to navigate",
          body: "Each card points somewhere useful so the page feels like a real archive.",
        },
      ]}
      logLines={[
        { command: "$ portfolio --scan", detail: "reviewing the current route surface" },
        { command: "[ok] modules indexed", detail: "home, stats, launcher, and shell system" },
        { command: "[ok] links wired", detail: "every card leads to a live route" },
      ]}
    >
      <div className="grid gap-8 lg:grid-cols-[1.03fr_0.97fr]">
        <div className="reveal-element is-visible">
          <div className="mono-label">selected work</div>
          <h2 className="mt-5 max-w-2xl font-[family-name:var(--font-display)] text-balance text-4xl leading-[0.96] tracking-[-0.05em] text-white sm:text-5xl">
            A compact archive of the surfaces built for this site.
          </h2>
          <p className="body-copy mt-4 max-w-xl text-base sm:text-lg">
            The portfolio route is now a curated index of the design systems and live pages that make
            up the rebuild.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {portfolioItems.map((item, index) => {
              const Icon = item.icon

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group glass-panel rounded-[1.4rem] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-primary/[0.05]"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="grid size-11 place-items-center rounded-[1rem] border border-primary/15 bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/38">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="mt-6">
                    <div className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-primary/70">
                      {item.tag}
                    </div>
                    <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white transition-colors group-hover:text-primary">
                      {item.title}
                    </h3>
                    <p className="body-copy mt-3 text-sm">{item.body}</p>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-sm text-white/72 transition-colors group-hover:text-white">
                    Open route
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="reveal-element is-visible rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="mono-label text-[0.7rem] text-primary/85">portfolio lens</div>
            <div className="mt-5 space-y-4">
              {[
                "The home page is now a cinematic landing surface.",
                "Stats has a live dashboard and active telemetry feed.",
                "BadScriptHub is a polished route instead of a dead stub.",
                "Shared motion rules keep every page feeling like one system.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 border-b border-white/8 pb-3 text-sm text-white/72 last:border-b-0 last:pb-0">
                  <span className="status-dot status-pulse mt-1 bg-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal-element is-visible rounded-[1.5rem] border border-primary/18 bg-primary/8 p-6">
            <div className="mono-label text-[0.7rem] text-primary">next moves</div>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/72">
              If you want, the same treatment can be extended to any additional routes or split into
              even more polished sub-sections.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/stats"
                className="magnetic-link inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-background/40 px-4 py-2 text-sm text-white/78 hover:text-white"
              >
                Open stats
              </Link>
              <Link
                href="/badscripthub"
                className="magnetic-link inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72 hover:border-primary/35 hover:text-white"
              >
                Open launcher
              </Link>
            </div>
          </div>

          <div className="reveal-element is-visible rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(255,182,141,0.14),transparent_38%),rgba(255,255,255,0.03)] p-6">
            <div className="mono-label text-[0.7rem] text-primary/85">design principles</div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                {
                  label: "rhythm",
                  value: "section spacing keeps the page from feeling compressed.",
                },
                {
                  label: "contrast",
                  value: "one warm accent leads the eye without breaking the palette.",
                },
                {
                  label: "motion",
                  value: "hover, scroll, and reveal layers stay expressive but controlled.",
                },
                {
                  label: "route flow",
                  value: "every page gives the user a useful next action.",
                },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.15rem] border border-white/8 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/42">{item.label}</div>
                  <div className="mt-2 text-sm text-white/72">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RebuildShell>
  )
}
