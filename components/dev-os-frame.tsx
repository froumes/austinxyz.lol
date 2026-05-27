"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowRight,
  FolderCode,
  Github,
  House,
  Menu,
  Rss,
  Settings,
  TerminalSquare,
  ChartColumnBig,
} from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { LogoSimple } from "@/components/logo"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home", icon: House },
  { href: "/portfolio", label: "Portfolio", icon: FolderCode },
  { href: "/stats", label: "Stats", icon: ChartColumnBig },
  { href: "/badscripthub", label: "BadScriptHub", icon: TerminalSquare },
]

type FrameProps = {
  active: "/" | "/portfolio" | "/stats" | "/badscripthub"
  children: React.ReactNode
  sidebar?: React.ReactNode
  footerMetrics?: string[]
}

export function AppFrame({ active, children, sidebar, footerMetrics }: FrameProps) {
  return (
    <div className="site-shell">
      <div className="site-content flex min-h-[100dvh] flex-col">
        <TopNav active={active} />
        <div className="flex flex-1">
          {sidebar ? <DesktopSidebar active={active}>{sidebar}</DesktopSidebar> : null}
          <main className="flex-1">{children}</main>
        </div>
        <FrameFooter metrics={footerMetrics} />
      </div>
    </div>
  )
}

function TopNav({ active }: { active: FrameProps["active"] }) {
  const pathname = usePathname()

  return (
    <nav className="safe-area-top sticky top-0 z-50 border-b border-white/10 bg-surface/90 backdrop-blur-md">
      <div className="container-wide flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="grid size-10 place-items-center rounded-[0.35rem] border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:border-primary/35 hover:text-primary md:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="border-white/10 bg-background p-0 text-foreground sm:max-w-sm">
              <div className="flex h-full flex-col">
                <SheetHeader className="border-b border-white/10 p-5 text-left">
                  <div className="flex items-center gap-3">
                    <LogoSimple size={34} alt="austinxyz.lol logo" />
                    <div>
                      <SheetTitle className="text-left text-base font-semibold text-foreground">
                        DEV_OS v2.4
                      </SheetTitle>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/42">
                        austinxyz.lol
                      </p>
                    </div>
                  </div>
                </SheetHeader>
                <div className="flex-1 p-3">
                  <div className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 border border-transparent px-4 py-3 text-sm transition-colors",
                            isActive
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : "text-white/68 hover:border-white/10 hover:bg-white/[0.04] hover:text-white",
                          )}
                        >
                          <Icon className="size-4" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                  <div className="mt-5 space-y-2 border-t border-white/10 pt-5">
                    <a
                      href="https://github.com/froumes"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70"
                    >
                      <span className="flex items-center gap-3">
                        <Github className="size-4" />
                        GitHub
                      </span>
                      <ArrowRight className="size-4" />
                    </a>
                    <div className="flex items-center justify-between border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                      <span className="flex items-center gap-3">
                        <Rss className="size-4" />
                        Feed
                      </span>
                      <span className="status-dot bg-primary" />
                    </div>
                    <div className="flex items-center justify-between border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                      <span className="flex items-center gap-3">
                        <Settings className="size-4" />
                        Settings
                      </span>
                      <ArrowRight className="size-4" />
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="group flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-[0.35rem] border border-white/10 bg-white/[0.04]">
              <LogoSimple size={24} alt="austinxyz.lol logo" className="transition-transform duration-500 group-hover:scale-105" />
            </span>
            <span>
              <span className="mono-label block text-[0.72rem] text-primary">DEV_OS v2.4</span>
              <span className="hidden text-xs text-white/42 sm:block">austinxyz.lol</span>
            </span>
          </Link>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <div className="flex items-center gap-5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = active === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 border-b-2 pb-1 text-sm transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-white/60 hover:border-primary/35 hover:text-primary",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <IconButton icon={Rss} label="Feed" />
          <IconButton icon={Settings} label="Settings" />
          <IconButton icon={TerminalSquare} label="Terminal" />
          <a
            href="https://github.com/froumes"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/72 transition-colors hover:border-primary/35 hover:text-white sm:inline-flex"
          >
            <Github className="size-4" />
            GitHub
          </a>
          <span className="ml-1 grid size-8 place-items-center rounded-[0.3rem] border border-primary/25 bg-primary/8">
            <LogoSimple size={18} alt="System administrator avatar" />
          </span>
        </div>
      </div>
    </nav>
  )
}

function IconButton({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      disabled
      aria-label={label}
      className="grid size-10 place-items-center border border-transparent text-white/32 opacity-50 transition-colors hover:border-white/10 hover:bg-white/[0.04] hover:text-primary disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:bg-transparent disabled:hover:text-white/32"
    >
      <Icon className="size-4" />
    </button>
  )
}

function DesktopSidebar({
  active,
  children,
}: {
  active: FrameProps["active"]
  children: React.ReactNode
}) {
  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 border-r border-white/10 bg-sidebar lg:flex lg:flex-col">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <LogoSimple size={38} alt="User profile" className="rounded-[0.35rem] border border-primary/25 bg-background/30 p-1" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">ROOT_USER</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary/85">
              Local: 127.0.0.1
            </div>
          </div>
        </div>
        <button
          type="button"
          className="tactile-btn mt-5 flex w-full items-center justify-center gap-2 border border-primary bg-primary/10 px-3 py-2 font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-primary hover:bg-primary/18"
        >
          <TerminalSquare className="size-4" />
          Execute cmd
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 border-r-4 px-5 py-3 text-sm transition-colors",
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent text-white/60 hover:border-white/10 hover:bg-white/[0.035] hover:text-white",
              )}
            >
              <Icon className="size-4" />
              <span className="font-mono text-[12px] uppercase tracking-[0.12em]">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.035] hover:text-white"
        >
          <Settings className="size-4" />
          <span className="font-mono text-[12px] uppercase tracking-[0.12em]">Settings</span>
        </Link>
        <a
          href="https://github.com/froumes"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.035] hover:text-white"
        >
          <Github className="size-4" />
          <span className="font-mono text-[12px] uppercase tracking-[0.12em]">Logs</span>
        </a>
      </div>

      <div className="border-t border-white/10 p-4">{children}</div>
    </aside>
  )
}

function FrameFooter({ metrics }: { metrics?: string[] }) {
  const items = metrics ?? ["ENV: PROD", "LATENCY: 24ms", "UPTIME: 99.9%"]

  return (
    <footer className="border-t border-white/10 bg-surface-container-lowest/95 safe-area-inset">
      <div className="container-wide flex min-h-12 flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center">
        <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/46">
          {items[0] ?? "austinxyz.lol"}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/42">
          {items.slice(1).map((item) => (
            <span key={item} className="transition-colors hover:text-foreground">
              {item}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}

export function Panel({
  title,
  eyebrow,
  action,
  children,
  className,
}: {
  title: string
  eyebrow?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("panel overflow-hidden rounded-[0.375rem]", className)}>
      <div className="panel-header flex items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          {eyebrow ? <div className="mono-label text-[11px] text-white/42">{eyebrow}</div> : null}
          <h2 className="mt-1 text-[1.05rem] font-semibold tracking-tight text-foreground">{title}</h2>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </section>
  )
}

export function StatTile({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string
  sub?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="panel rounded-[0.375rem] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="mono-label text-[11px] text-white/48">{label}</div>
        {icon ? <div className="text-primary">{icon}</div> : null}
      </div>
      <div className="mt-4 truncate font-mono text-[1.75rem] font-bold tracking-[-0.04em] text-foreground tabular-nums">
        {value}
      </div>
      {sub ? <div className="mt-1 text-sm text-white/45">{sub}</div> : null}
    </div>
  )
}

export function StatusBadge({
  label,
  tone = "default",
}: {
  label: string
  tone?: "default" | "success" | "warning" | "danger"
}) {
  const toneClasses: Record<typeof tone, string> = {
    default: "border-primary/20 bg-primary/10 text-primary",
    success: "border-primary/20 bg-primary/10 text-primary",
    warning: "border-[#ffd1aa]/25 bg-[#ffd1aa]/10 text-[#ffd1aa]",
    danger: "border-destructive/25 bg-destructive/10 text-destructive",
  }

  return (
    <span className={cn("inline-flex items-center gap-2 border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em]", toneClasses[tone])}>
      <span className={cn("status-dot", tone === "danger" ? "bg-destructive" : tone === "warning" ? "bg-[#ffd1aa]" : "bg-primary", tone === "default" ? "status-pulse" : "")} />
      {label}
    </span>
  )
}
