import Link from "next/link"
import {
  ArrowLeft,
  ArrowUpRight,
  Boxes,
  Code2,
  Github,
  Globe2,
  Radio,
  Star,
  TerminalSquare,
  Users,
} from "lucide-react"
import { LogoSimple } from "@/components/logo"
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
  },
  {
    name: "BadScriptHub",
    type: "Automation hub",
    description:
      "A script hub surface with access links, live telemetry, and a compact preview of the Nozomi-style interface.",
    href: "/badscripthub",
    icon: Boxes,
    stats: ["11+ scripts", "live stats", "multi-game"],
  },
  {
    name: "austinxyz.lol",
    type: "Personal web system",
    description:
      "This site: a Next.js workspace that combines portfolio pages, telemetry dashboards, and project surfaces.",
    href: "/",
    icon: Globe2,
    stats: ["Next.js", "TypeScript", "Cloudflare"],
  },
]

const principles = [
  { title: "Build the working thing", body: "Interfaces stay close to the underlying tool instead of hiding it behind marketing gloss.", icon: Code2 },
  { title: "Make state visible", body: "Dashboards and product pages show status, empty states, and context without forcing a guess.", icon: Radio },
  { title: "Keep shipping small", body: "The best projects here are practical, specific, and maintained instead of over-scoped.", icon: Star },
  { title: "Design for repeated use", body: "Controls are compact, readable, and calm enough to come back to every day.", icon: Users },
]

export default function PortfolioPage() {
  return (
    <main className="site-shell">
      <div className="site-content">
        <header className="container-wide flex items-center justify-between py-6">
          <Link href="/" className="magnetic-link inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm text-white/72 hover:text-white">
            <ArrowLeft className="size-4" />
            Home
          </Link>
          <div className="flex items-center gap-3">
            <LogoSimple size={25} alt="austinxyz.lol logo" />
            <span className="hidden text-sm font-semibold text-white/82 sm:inline">portfolio</span>
          </div>
          <a
            href="https://github.com/froumes"
            target="_blank"
            rel="noopener noreferrer"
            className="magnetic-link inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm text-white/72 hover:border-primary/35 hover:text-white"
          >
            <Github className="size-4" />
            GitHub
          </a>
        </header>

        <section className="container-wide grid gap-12 pb-14 pt-12 lg:grid-cols-[0.88fr_1.12fr] lg:pb-20 lg:pt-24">
          <Reveal>
            <div>
              <span className="eyebrow">selected work</span>
              <h1 className="display-title mt-7 max-w-4xl text-6xl sm:text-7xl lg:text-8xl xl:text-[8rem]">
                Code with a surface people can actually use.
              </h1>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid content-end gap-6 lg:min-h-[520px]">
              <p className="body-copy max-w-2xl text-lg">
                This portfolio is intentionally practical: scripts, dashboards, project pages, and web tools that expose
                the underlying work clearly. The redesign keeps the tone sharper while preserving direct paths to the projects.
              </p>
              <div className="glass-panel grid gap-4 rounded-[2rem] p-5 sm:grid-cols-3">
                {[
                  ["Repositories", "10+"],
                  ["Projects", "15+"],
                  ["Stack", "Next"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.35rem] bg-white/[0.045] p-4">
                    <div className="text-3xl font-black text-white">{value}</div>
                    <div className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section className="container-wide pb-20">
          <div className="grid gap-5 lg:grid-cols-2">
            {projects.map((project, index) => {
              const Icon = project.icon
              const isExternal = project.href.startsWith("http")
              const content = (
                <>
                  <div className="flex items-start justify-between gap-6">
                    <span className="grid size-13 place-items-center rounded-[1.15rem] bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </span>
                    <ArrowUpRight className="size-5 text-white/36 transition-all duration-700 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
                  </div>
                  <div className="mt-14">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/72">{project.type}</p>
                    <h2 className="mt-3 text-3xl font-bold text-white">{project.name}</h2>
                    <p className="body-copy mt-4 max-w-2xl">{project.description}</p>
                    <div className="mt-7 flex flex-wrap gap-2">
                      {project.stats.map((stat) => (
                        <span key={stat} className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-medium text-white/62">
                          {stat}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )
              return (
                <Reveal key={project.name} delay={index * 80} asChild>
                  {isExternal ? (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group magnetic-link glass-panel min-h-[360px] rounded-[2rem] p-6 hover:border-primary/30"
                    >
                      {content}
                    </a>
                  ) : (
                    <Link href={project.href} className="group magnetic-link glass-panel min-h-[360px] rounded-[2rem] p-6 hover:border-primary/30">
                      {content}
                    </Link>
                  )}
                </Reveal>
              )
            })}
          </div>
        </section>

        <section className="container-wide pb-24">
          <Reveal>
            <div className="border-t border-white/10 pt-10">
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {principles.map((principle, index) => {
                  const Icon = principle.icon
                  return (
                    <div key={principle.title} className="quiet-panel rounded-[1.55rem] p-5">
                      <Icon className="size-5 text-primary" />
                      <h3 className="mt-6 text-lg font-bold text-white">{principle.title}</h3>
                      <p className="body-copy mt-3 text-sm">{principle.body}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  )
}
