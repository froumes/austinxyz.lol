import Link from "next/link"
import { ArrowUpRight, Boxes, Code2, Globe2, Radio, Star, TerminalSquare, Users } from "lucide-react"
import { AppFrame, Panel, StatusBadge } from "@/components/dev-os-frame"
import { Reveal } from "@/components/reveal"

const projects = [
  {
    name: "Bad Infinite Yield",
    type: "Roblox command framework",
    description:
      "A large command-line script with developer tooling, command discovery, plugin support, and teleport-safe loading.",
    href: "https://github.com/froumes/badinfiniteyield",
    icon: TerminalSquare,
    stats: ["400+ commands", "plugin system", "dev tools"],
    tag: "RBX_ENGINE",
  },
  {
    name: "BadScriptHub",
    type: "Automation hub",
    description:
      "A script hub surface with access links, live telemetry, and a compact preview of the Nozomi-style interface.",
    href: "/badscripthub",
    icon: Boxes,
    stats: ["11+ scripts", "live stats", "multi-game"],
    tag: "AUTOMATION",
  },
  {
    name: "austinxyz.lol",
    type: "Personal web system",
    description:
      "This site: a Next.js workspace that combines portfolio pages, telemetry dashboards, and project surfaces.",
    href: "/",
    icon: Globe2,
    stats: ["Next.js", "TypeScript", "Cloudflare"],
    tag: "WEB",
  },
]

const principles = [
  {
    title: "Build the working thing",
    body: "Interfaces stay close to the underlying tool instead of hiding it behind marketing gloss.",
    icon: Code2,
  },
  {
    title: "Make state visible",
    body: "Dashboards and product pages show status, empty states, and context without forcing a guess.",
    icon: Radio,
  },
  {
    title: "Keep shipping small",
    body: "The best projects here are practical, specific, and maintained instead of over-scoped.",
    icon: Star,
  },
  {
    title: "Design for repeated use",
    body: "Controls are compact, readable, and calm enough to come back to every day.",
    icon: Users,
  },
]

export default function PortfolioPage() {
  return (
    <AppFrame
      active="/portfolio"
      footerMetrics={["austinxyz.lol // BUILD_REV: 0x44A2", "STATUS: ARCHIVE_ACCESSIBLE", "ITEMS: 03"]}
      sidebar={
        <div className="grid gap-4">
          <Panel title="Operating principles" eyebrow="sidebar note">
            <ul className="space-y-4">
              {principles.slice(0, 3).map((principle, index) => {
                const Icon = principle.icon
                return (
                  <li key={principle.title} className={index === 0 ? "border-l-2 border-primary pl-3" : "border-l-2 border-white/14 pl-3"}>
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Icon className="size-4 text-primary" />
                      {principle.title}
                    </div>
                    <p className="mt-1 text-sm text-white/46">{principle.body}</p>
                  </li>
                )
              })}
            </ul>
          </Panel>

          <Panel title="System stats" eyebrow="archive health">
            <div className="grid grid-cols-2 gap-2">
              <div className="quiet-panel rounded-[0.35rem] p-3">
                <div className="mono-label text-[11px] text-white/42">UPTIME</div>
                <div className="mt-2 font-mono text-xl font-bold text-foreground">99.98%</div>
              </div>
              <div className="quiet-panel rounded-[0.35rem] p-3">
                <div className="mono-label text-[11px] text-white/42">DEPLOYMENTS</div>
                <div className="mt-2 font-mono text-xl font-bold text-foreground">1,402</div>
              </div>
              <div className="quiet-panel col-span-2 rounded-[0.35rem] p-3">
                <div className="flex items-center justify-between">
                  <span className="mono-label text-[11px] text-white/42">CI/CD PIPELINE</span>
                  <span className="mono-label text-[11px] text-primary">PASSING</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden border border-white/10 bg-white/6">
                  <div className="h-full w-[100%] bg-primary" />
                </div>
              </div>
            </div>
          </Panel>
        </div>
      }
    >
      <section className="container-wide pb-24 pt-10 lg:pt-14">
        <Reveal>
          <div className="border-b border-white/10 pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <StatusBadge label="archive accessible" />
                <h1 className="display-title mt-5 text-4xl sm:text-5xl xl:text-[4.5rem]">
                  Project Index
                </h1>
              </div>
              <div className="mono-label text-[11px] text-white/42">STATUS: ARCHIVE_ACCESSIBLE // ITEMS: 03</div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-4 flex gap-2 overflow-x-auto border-b border-white/10 pb-2 font-mono text-[11px] uppercase tracking-[0.14em]">
            <button className="border border-primary bg-primary/10 px-3 py-1 text-primary">All</button>
            <button className="border border-transparent px-3 py-1 text-white/58 hover:border-white/10 hover:text-white">Roblox</button>
            <button className="border border-transparent px-3 py-1 text-white/58 hover:border-white/10 hover:text-white">Automation</button>
            <button className="border border-transparent px-3 py-1 text-white/58 hover:border-white/10 hover:text-white">Web</button>
          </div>
        </Reveal>

        <div className="mt-5 grid gap-4">
          {projects.map((project, index) => {
            const Icon = project.icon
            const isExternal = project.href.startsWith("http")
            return (
              <Reveal key={project.name} delay={index * 70} asChild>
                <article className="group panel magnetic-link flex flex-col gap-4 rounded-[0.375rem] p-4 hover:border-primary/30 hover:bg-primary/[0.04] sm:flex-row">
                  <div className="flex min-h-32 w-full flex-col justify-between border border-white/10 bg-[#07101f] p-4 sm:w-56">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid size-12 place-items-center border border-primary/20 bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <span className="mono-label text-[11px] text-white/36">{project.tag}</span>
                    </div>
                    <div className="grid gap-2">
                      <div className="h-px bg-white/10" />
                      <p className="mono-label text-[11px] text-white/48">{project.type}</p>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="mono-label text-[11px] text-primary/72">{project.type}</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{project.name}</h2>
                      </div>
                      <StatusBadge label={project.type === "Automation hub" ? "active" : "maintenance"} />
                    </div>
                    <p className="body-copy mt-4 max-w-3xl text-sm">{project.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {project.stats.map((stat) => (
                        <span
                          key={stat}
                          className="border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/58"
                        >
                          {stat}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {isExternal ? (
                        <a
                          href={project.href}
                          target="_blank"
                          rel="noreferrer"
                          className="magnetic-link tactile-btn inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                        >
                          View source
                          <ArrowUpRight className="size-4" />
                        </a>
                      ) : (
                        <Link
                          href={project.href}
                          className="magnetic-link tactile-btn inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                        >
                          Open route
                          <ArrowUpRight className="size-4" />
                        </Link>
                      )}
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/28 opacity-60"
                      >
                        Docs
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </section>
    </AppFrame>
  )
}
