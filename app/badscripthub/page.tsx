"use client"

import type React from "react"
import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Copy,
  Crosshair,
  Eye,
  Github,
  KeyRound,
  Radio,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  TerminalSquare,
  WandSparkles,
  Zap,
} from "lucide-react"
import { LogoSimple } from "@/components/logo"
import { Reveal } from "@/components/reveal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

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

const modules = [
  { label: "Aim", icon: Crosshair, active: true },
  { label: "Visuals", icon: Eye, active: false },
  { label: "Movement", icon: Zap, active: false },
  { label: "Settings", icon: Settings2, active: false },
]

export default function BadScriptHubPage() {
  const [enabled, setEnabled] = useState(true)
  const [teamCheck, setTeamCheck] = useState(true)
  const [visibilityCheck, setVisibilityCheck] = useState(true)
  const [fov, setFov] = useState(300)
  const [smoothness, setSmoothness] = useState(3)
  const [targetPart, setTargetPart] = useState("Head")
  const [copied, setCopied] = useState(false)

  const fovSize = useMemo(() => Math.max(90, Math.min(250, fov / 1.45)), [fov])

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

        <section className="container-wide grid gap-12 pb-14 pt-12 lg:grid-cols-[0.95fr_1.05fr] lg:pb-20 lg:pt-24">
          <Reveal>
            <div>
              <span className="eyebrow">script hub / live access / telemetry</span>
              <h1 className="display-title mt-7 max-w-5xl text-6xl sm:text-7xl lg:text-8xl xl:text-[7.5rem]">
                Automation controls without the noisy shell.
              </h1>
              <p className="body-copy mt-8 max-w-2xl text-lg">
                BadScriptHub gets a cleaner product surface: direct key links, a readable loader, live statistics, and a
                compact interface preview that still feels like the actual tool.
              </p>
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  ["11+", "supported scripts"],
                  ["30s", "stats refresh"],
                  ["Nozomi", "UI layer"],
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
              <div className="relative overflow-hidden rounded-[1.55rem] bg-[#07100f]/92 p-5">
                <div className="absolute inset-x-0 top-0 h-px scanline" />
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <LogoSimple size={34} alt="BadScriptHub logo" />
                    <div>
                      <h2 className="text-xl font-bold text-white">Nozomi preview</h2>
                      <p className="text-sm text-white/42">Aim module / tuned controls</p>
                    </div>
                  </div>
                  <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Toggle module" />
                </div>

                <div className="grid gap-5 pt-5 lg:grid-cols-[170px_1fr]">
                  <div className="space-y-2">
                    {modules.map((module) => {
                      const Icon = module.icon
                      return (
                        <button
                          key={module.label}
                          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition-all duration-700 ${
                            module.active ? "bg-primary text-primary-foreground" : "bg-white/[0.045] text-white/58 hover:bg-white/[0.075] hover:text-white"
                          }`}
                        >
                          <Icon className="size-4" />
                          {module.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="grid gap-4">
                    <div className="relative min-h-[280px] overflow-hidden rounded-[1.35rem] border border-white/10 bg-[radial-gradient(circle_at_50%_50%,rgba(116,235,190,0.12),transparent_46%),linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))]">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:42px_42px] opacity-35" />
                      <div
                        className="absolute left-1/2 top-1/2 rounded-full border border-primary/70 bg-primary/5 shadow-[0_0_70px_rgba(116,235,190,0.12)] transition-all duration-700"
                        style={{
                          width: fovSize,
                          height: fovSize,
                          transform: "translate(-50%, -50%)",
                          opacity: enabled ? 1 : 0.35,
                        }}
                      />
                      <div className="absolute left-1/2 top-1/2 h-px w-20 -translate-x-1/2 bg-primary/70" />
                      <div className="absolute left-1/2 top-1/2 h-20 w-px -translate-y-1/2 bg-primary/70" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/28 p-3 font-mono text-xs text-white/60">
                        <span>{enabled ? "module.enabled" : "module.paused"}</span>
                        <span>target.{targetPart.toLowerCase()}</span>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Control label="FOV" value={String(fov)}>
                        <Slider value={[fov]} min={120} max={500} step={10} onValueChange={(value) => setFov(value[0])} />
                      </Control>
                      <Control label="Smoothness" value={smoothness.toFixed(1)}>
                        <Slider value={[smoothness]} min={1} max={8} step={0.1} onValueChange={(value) => setSmoothness(value[0])} />
                      </Control>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="quiet-panel flex items-center justify-between rounded-[1.15rem] p-4 text-sm text-white/72">
                        Team check
                        <Switch checked={teamCheck} onCheckedChange={setTeamCheck} />
                      </label>
                      <label className="quiet-panel flex items-center justify-between rounded-[1.15rem] p-4 text-sm text-white/72">
                        Visibility
                        <Switch checked={visibilityCheck} onCheckedChange={setVisibilityCheck} />
                      </label>
                      <Select value={targetPart} onValueChange={setTargetPart}>
                        <SelectTrigger className="quiet-panel h-full rounded-[1.15rem] border-white/10 bg-transparent text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Head", "Torso", "HumanoidRootPart"].map((part) => (
                            <SelectItem key={part} value={part}>
                              {part}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="container-wide grid gap-5 pb-20 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <div className="glass-panel rounded-[2rem] p-6">
              <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/72">loader</p>
                  <h2 className="mt-2 text-3xl font-bold text-white">Copy the loadstring</h2>
                </div>
                <button
                  onClick={copyLoadstring}
                  className="magnetic-link group inline-flex items-center justify-center gap-3 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="mt-5 overflow-x-auto rounded-[1.35rem] bg-black/28 p-5 font-mono text-sm leading-relaxed text-white/70">
                <code>{loadstring}</code>
              </pre>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid gap-5">
              <a
                href="https://ads.luarmor.net/get_key?for=badscripthub-rKXsLWcPlUCN"
                target="_blank"
                rel="noopener noreferrer"
                className="group magnetic-link quiet-panel rounded-[1.7rem] p-5 hover:border-primary/30"
              >
                <AccessCard icon={KeyRound} title="Linkvertise key" body="Complete verification through the primary access route." />
              </a>
              <a
                href="https://ads.luarmor.net/get_key?for=badscripthub-makxYXFZnUta"
                target="_blank"
                rel="noopener noreferrer"
                className="group magnetic-link quiet-panel rounded-[1.7rem] p-5 hover:border-primary/30"
              >
                <AccessCard icon={ShieldCheck} title="Work.ink key" body="Use the alternate verification route if the first one is unavailable." />
              </a>
            </div>
          </Reveal>
        </section>

        <section className="container-wide grid gap-5 pb-24 lg:grid-cols-[0.7fr_1.3fr]">
          <Reveal>
            <div className="sticky top-8">
              <span className="eyebrow">live telemetry</span>
              <h2 className="display-title mt-6 text-5xl md:text-6xl">Usage, without the mess.</h2>
              <p className="body-copy mt-6">
                The existing statistics component stays connected to the same API. The surrounding page now gives it a calmer frame.
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
              { icon: WandSparkles, title: "Fast setup", body: "Copy the loader, verify once, then launch into the script UI." },
              { icon: SlidersHorizontal, title: "Adjustable controls", body: "The preview mirrors the kind of values users actually tune." },
              { icon: Radio, title: "Public stats", body: "Execution data is shown through the same anonymous telemetry endpoint." },
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

function Control({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="quiet-panel rounded-[1.15rem] p-4">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-white/62">{label}</span>
        <span className="font-mono text-primary">{value}</span>
      </div>
      {children}
    </div>
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
      <span className="grid size-12 place-items-center rounded-[1.1rem] bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="body-copy mt-1 text-sm">{body}</p>
      </div>
      <ArrowUpRight className="size-5 text-white/34 transition-all duration-700 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-primary" />
    </div>
  )
}
