"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default" | "lg"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none",

        // sizes
        "data-[size=default]:h-[1.15rem] data-[size=default]:w-8",
        "data-[size=sm]:h-3.5 data-[size=sm]:w-6",
        "data-[size=lg]:h-9 data-[size=lg]:w-16",

        // 👇 FORCE thumb size from parent (reliable)
        "data-[size=default]:**:data-[slot=switch-thumb]:h-4",
        "data-[size=default]:**:data-[slot=switch-thumb]:w-4",

        "data-[size=sm]:**:data-[slot=switch-thumb]:h-3",
        "data-[size=sm]:**:data-[slot=switch-thumb]:w-3",

        "data-[size=lg]:**:data-[slot=switch-thumb]:h-8",
        "data-[size=lg]:**:data-[slot=switch-thumb]:w-8",

        // states
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",

        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-background transition-transform",
          "data-[state=checked]:translate-x-[calc(100%-2px)]",
          "data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch }
