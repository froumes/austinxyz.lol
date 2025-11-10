"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    accentColor?: string
  }
>(({ className, accentColor, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track 
      className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[#4a4d53]"
      style={accentColor ? { backgroundColor: accentColor.replace("rgb", "rgba").replace(")", ", 0.2)") } : undefined}
    />
    <SliderPrimitive.Range 
      className="absolute h-full"
      style={accentColor ? { backgroundColor: accentColor } : { backgroundColor: "rgb(59, 130, 246)" }}
    />
    <SliderPrimitive.Thumb 
      className="block h-4 w-4 rounded-full border-2 shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" 
      style={accentColor ? { 
        borderColor: accentColor, 
        backgroundColor: accentColor 
      } : { 
        borderColor: "rgb(59, 130, 246)", 
        backgroundColor: "rgb(59, 130, 246)" 
      }}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
