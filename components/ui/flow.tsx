import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { IconLeft } from "@/components/ui/icons"

export function FlowShell({
  back,
  children,
  wide,
}: {
  back?: string
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div
      className="h-full overflow-auto flex flex-col"
      style={{
        background:
          "radial-gradient(120% 80% at 50% -10%, oklch(0.235 0.022 262), transparent 60%), var(--bg1)",
      }}
    >
      <div className="flex items-center gap-[10px] p-[16px_20px]">
        <div className="flex items-center gap-[9px] font-semibold">
          <span className="grid place-items-center size-[26px] rounded-[7px] bg-acc text-acc-on font-bold">
            C
          </span>
          Carlo
        </div>
        <div className="flex-1" />
        {back ? (
          <Link
            href={back}
            className="inline-flex items-center gap-[7px] text-muted-foreground text-[12.5px] hover:text-ink [&_svg]:size-[15px]"
          >
            <IconLeft />
            Back
          </Link>
        ) : (
          <span className="font-mono text-faint text-[11px]">v1.0</span>
        )}
      </div>
      <div className="flex-1 grid place-items-center p-5 max-nav:p-[14px]">
        <div
          className={cn(
            "w-full bg-bg2 border border-line rounded-[14px] p-[26px] shadow-[0_30px_60px_-34px_oklch(0_0_0/0.8)] max-nav:p-[22px]",
            wide ? "max-w-[560px]" : "max-w-[404px]"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export function FlowTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-[20px] font-semibold">{children}</h1>
}

export function FlowLead({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-[13px] mt-2 leading-[1.55]">
      {children}
    </p>
  )
}
