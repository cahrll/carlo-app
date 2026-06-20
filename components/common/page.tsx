import * as React from "react"
import { cn } from "@/lib/utils"

export function Content({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex-1 min-h-0 overflow-auto", className)} {...props} />
  )
}

export function PageHeader({
  title,
  sub,
  actions,
}: {
  title: React.ReactNode
  sub?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-end gap-[14px] px-[22px] pt-5 pb-4 max-nav:flex-wrap max-nav:px-[14px]">
      <div>
        <h1 className="text-[18px] font-semibold max-[560px]:text-[16px]">
          {title}
        </h1>
        {sub && (
          <div className="font-mono text-[12px] text-muted-foreground mt-[3px]">
            {sub}
          </div>
        )}
      </div>
      {actions && (
        <div className="ml-auto flex gap-2 max-nav:ml-0 max-nav:basis-full max-nav:flex-wrap">
          {actions}
        </div>
      )}
    </div>
  )
}
