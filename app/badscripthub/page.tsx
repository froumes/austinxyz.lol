"use client"

import type React from "react"
import { useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Code2,
  Copy,
  Gamepad2,
  Github,
  KeyRound,
  Radio,
  ShieldCheck,
  TerminalSquare,
  WandSparkles,
} from "lucide-react"
import { LogoSimple } from "@/components/logo"
import { Reveal } from "@/components/reveal"

const StatsDashboard = dynamic(() => import("@/components/stats-dashboard"), {
  ssr: false,
  loading: () => (
    <div className="quiet-panel rounded-[1.55rem] p-8 text-center text-sm text-white/52">
      Loading statistics...
    </div>
  ),
})

const loadstring = 'loadstring(game:HttpGet("https://raw.githubusercontent.com/froumes/austinxyz.lol/main/badscripthub/loader.lua"))()'

const theme = {
  BackgroundColor: "rgb(7, 16, 15)",
  SurfaceColor: "rgb(18, 30, 28)",
  AccentColor: "rgb(116, 235, 190)",
  TextColor: "rgb(238, 246, 242)",
  SecondaryTextColor: "rgb(160, 179, 171)",
  BorderColor: "rgb(45, 67, 61)",
}

const scripts = [
  { name: "Anime Eternal", type: "farm loop", status: "active" },
  { name: "Clash Clicker", type: "progression", status: "active" },
  { name: "Prospecting", type: "collection", status: "active" },
  { name: "Hunty Zombie", type: "combat", status: "active" },
  { name: "Steal a Brainrot", type: "utility", status: "active" },
  { name: "Multi-game tools", type: "shared systems", status: "maintained" },
]

const steps = [
  { icon: KeyRound, title: "Get a key", body: "Use either access route and finish the short verification." },
  { icon: Copy, title: "Copy loader", body: "Paste the loadstring into your executor after verification." },
  { icon: TerminalSquare, title: "Run script", body: "Launch BadScriptHub and pick the supported game module." },
]

export default function BadScriptHubPage() {
  const [copied, setCopied] = useState(false)

  async function copyLoadstring() {
    await navigator.clipboard.writeText(loadstring)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <main className="site-shell">
      <div className="site-content">
        <header className="container-wide flex items-center justify-between py-6">
          <Link href="/" className="magnetic-link inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm text-white/72 hover:text-white">
            <ArrowLeft className="size-4" />
            Home
          </Link>
          <div className="flex items-center gap-3">
            <LogoSimple size={27} alt="BadScriptHub logo" />
            <span className="hidden text-sm font-semibold text-white/82 sm:inline">BadScriptHub</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/stats" className="magnetic-link hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm text-white/72 hover:border-primary/35 hover:text-white sm:inline-flex">
              <Activity className="size-4" />
              Stats
            </Link>
            <a
              href="https://github.com/froumes"
              target="_blank"
              rel="noopener noreferrer"
              className="magnetic-link inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-sm text-white/72 hover:border-primary/35 hover:text-white"
            >
              <Github className="size-4" />
              GitHub
            </a>
          </div>
        </header>

        <section className="container-wide grid gap-10 pb-16 pt-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(380px,0.72fr)] lg:items-center lg:pb-24 lg:pt-24">
          <Reveal>
            <div>
              <span className="eyebrow">script hub / keys / loader</span>
              <h1 className="display-title mt-7 max-w-4xl text-6xl sm:text-7xl lg:text-8xl xl:text-[6.35rem]">
                BadScriptHub, stripped down to launch.
              </h1>
              <p className="body-copy mt-8 max-w-2xl text-lg">
                A cleaner access page for the scripts: get a key, copy the loader, open the full stats dashboard,
                and see what is currently supported without a fake interface sitting in the way.
              </p>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  ["11+", "scripts"],
                  ["2", "key routes"],
                  ["live", "telemetry"],
                ].map(([value, label]) => (
                  <div key={label} className="quiet-panel rounded-[1.35rem] p-4">
                    <div className="text-3xl font-black text-white">{value}</div>
                    <div className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/38">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="glass-panel rounded-[2rem] p-2">
              <div className="relative overflow-hidden rounded-[1.55rem] bg-[#07100f]/92 p-5 md:p-7">
                <div className="absolute inset-x-0 top-0 h-px scanline" />
                <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/72">launch kit</p>
                    <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">Copy once. Run where you play.</h2>
                  </div>
                  <span className="grid size-13 shrink-0 place-items-center rounded-[1.2rem] bg-primary/10 text-primary">
                    <TerminalSquare className="size-6" />
                  </span>
                </div>

                <pre className="mt-6 max-h-[220px] overflow-x-auto rounded-[1.35rem] border border-white/10 bg-black/30 p-5 font-mono text-sm leading-relaxed text-white/72">
                  <code>{loadstring}</code>
                </pre>

                <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <button
                    onClick={copyLoadstring}
                    className="magnetic-link group inline-flex items-center justify-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
                  >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {copied ? "Copied loader" : "Copy loader"}
                  </button>
                  <Link href="/stats" className="magnetic-link inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-5 py-3 text-sm font-semibold text-white/72 hover:border-primary/35 hover:text-white">
                    View stats
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <a
                    href="https://ads.luarmor.net/get_key?for=badscripthub-rKXsLWcPlUCN"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group magnetic-link quiet-panel rounded-[1.35rem] p-4 hover:border-primary/30"
                  >
                    <AccessCard icon={KeyRound} title="Linkvertise" body="Primary key route" />
                  </a>
                  <a
                    href="https://ads.luarmor.net/get_key?for=badscripthub-makxYXFZnUta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group magnetic-link quiet-panel rounded-[1.35rem] p-4 hover:border-primary/30"
                  >
                    <AccessCard icon={ShieldCheck} title="Work.ink" body="Alternate key route" />
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="container-wide pb-20">
          <Reveal>
            <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <span className="eyebrow">supported modules</span>
                <h2 className="display-title mt-6 text-5xl md:text-6xl">Active scripts.</h2>
                <p className="body-copy mt-6 max-w-xl">
                  The page now reads like a launcher, not a mock app. Supported modules are listed directly so visitors
                  can scan what is available before copying anything.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {scripts.map((script, index) => (
                  <Reveal key={script.name} delay={index * 50} asChild>
                    <div className="quiet-panel magnetic-link rounded-[1.55rem] p-5 hover:border-primary/30 hover:bg-primary/[0.055]">
                      <div className="flex items-start justify-between gap-4">
                        <span className="grid size-11 place-items-center rounded-[1.1rem] bg-primary/10 text-primary">
                          <Gamepad2 className="size-5" />
                        </span>
                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary">
                          {script.status}
                        </span>
                      </div>
                      <h3 className="mt-7 text-xl font-bold text-white">{script.name}</h3>
                      <p className="mt-2 text-sm text-white/42">{script.type}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <section className="container-wide pb-20">
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <Reveal key={step.title} delay={index * 80} asChild>
                  <div className="glass-panel rounded-[1.7rem] p-5">
                    <div className="flex items-center justify-between">
                      <span className="grid size-11 place-items-center rounded-[1.1rem] bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <span className="font-mono text-sm text-white/32">0{index + 1}</span>
                    </div>
                    <h3 className="mt-8 text-xl font-bold text-white">{step.title}</h3>
                    <p className="body-copy mt-3 text-sm">{step.body}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </section>

        <section className="container-wide grid gap-5 pb-24 lg:grid-cols-[0.72fr_1.28fr]">
          <Reveal>
            <div className="sticky top-8">
              <span className="eyebrow">live telemetry</span>
              <h2 className="display-title mt-6 text-5xl md:text-6xl">Usage, readable at a glance.</h2>
              <p className="body-copy mt-6">
                The existing statistics component stays connected to the same API, framed as a secondary dashboard
                instead of competing with the launch actions.
              </p>
              <Link href="/stats" className="magnetic-link mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-5 py-3 text-sm font-semibold text-white/72 hover:border-primary/35 hover:text-white">
                Open full dashboard
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="glass-panel rounded-[2rem] p-3 md:p-5">
              <StatsDashboard currentTheme={theme} />
            </div>
          </Reveal>
        </section>

        <section className="container-wide pb-24">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: WandSparkles, title: "Fast setup", body: "The key links and loader are above the fold, so the main path is obvious." },
              { icon: Code2, title: "Plain instructions", body: "No fake product UI. Just what to copy, where to verify, and what is supported." },
              { icon: Radio, title: "Public stats", body: "Execution data stays visible through the anonymous telemetry endpoint." },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <Reveal key={item.title} delay={index * 70} asChild>
                  <div className="quiet-panel rounded-[1.55rem] p-5">
                    <Icon className="size-5 text-primary" />
                    <h3 className="mt-6 text-lg font-bold text-white">{item.title}</h3>
                    <p className="body-copy mt-3 text-sm">{item.body}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}

function AccessCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="grid size-11 place-items-center rounded-[1.1rem] bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="body-copy mt-0.5 text-sm">{body}</p>
      </div>
      <ArrowUpRight className="size-5 text-white/34 transition-all duration-700 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
    </div>
  )
}
