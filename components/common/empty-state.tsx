import * as React from "react"
import { cn } from "@/lib/utils"

export function EmptyState({
  icon,
  title,
  description,
  actions,
  hint,
  className,
}: {
  icon: React.ReactNode
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  hint?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("h-full grid place-items-center p-[30px]", className)}>
      <div className="max-w-[380px] text-center">
        <div className="size-[58px] rounded-[14px] bg-bg2 border border-line grid place-items-center text-acc mx-auto mb-[18px] [&_svg]:size-[26px]">
          {icon}
        </div>
        <h2 className="text-[16px] font-semibold">{title}</h2>
        {description && (
          <p className="text-muted-foreground text-[12.5px] mt-[9px] leading-[1.6]">
            {description}
          </p>
        )}
        {actions && (
          <div className="mt-5 flex gap-[9px] justify-center flex-wrap">
            {actions}
          </div>
        )}
        {hint && (
          <div className="mt-4 font-mono text-[11px] text-faint">{hint}</div>
        )}
      </div>
    </div>
  )
}
