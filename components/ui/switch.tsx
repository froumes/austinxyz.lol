"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    accentColor?: string
  }
>(({ className, accentColor, checked, ...props }, ref) => {
  const rootRef = React.useRef<HTMLButtonElement>(null)
  const combinedRef = React.useCallback((node: HTMLButtonElement | null) => {
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
    rootRef.current = node
  }, [ref])

  React.useEffect(() => {
    if (rootRef.current && accentColor) {
      if (checked) {
        rootRef.current.style.backgroundColor = accentColor
      } else {
        rootRef.current.style.backgroundColor = ""
      }
    }
  }, [checked, accentColor])

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-5 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-[#4a4d53]",
        !accentColor && "data-[state=checked]:bg-blue-500",
        className,
      )}
      style={accentColor ? {
        ...(props.style || {}),
        transition: "background-color 1s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease-in-out"
      } : undefined}
      checked={checked}
      {...props}
      ref={combinedRef}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
