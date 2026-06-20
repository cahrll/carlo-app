import * as React from "react"
import { cn } from "@/lib/utils"

export function Kbd({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono text-[10.5px] leading-[1.4] text-faint border border-line rounded-[5px] bg-bg2 px-[6px] py-px",
        className
      )}
      {...props}
    />
  )
}
