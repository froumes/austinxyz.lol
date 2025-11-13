"use client"

import React, { useEffect, useRef, useState } from "react"

interface RevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  asChild?: boolean
}

export function Reveal({ children, className, delay = 0, asChild = false }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      setVisible(true)
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisible(true), delay)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  const baseStyle: React.CSSProperties = {
    transition: "opacity 600ms cubic-bezier(0.4,0,0.2,1), transform 600ms cubic-bezier(0.4,0,0.2,1)",
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : "translateY(16px)",
    willChange: "opacity, transform",
  }

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    const mergedClass = [child.props.className, className].filter(Boolean).join(" ")
    const mergedStyle = { ...baseStyle, ...(child.props.style || {}) }
    return React.cloneElement(child, { ref, className: mergedClass, style: mergedStyle })
  }

  return (
    <div ref={ref} className={className} style={baseStyle}>
      {children}
    </div>
  )
}
