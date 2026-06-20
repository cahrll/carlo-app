import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* ---- Button ---- */
const btn = cva(
  "inline-flex items-center justify-center gap-[7px] font-semibold rounded-md whitespace-nowrap transition-[background,transform,border-color] duration-150 ease-precision active:translate-y-0 disabled:opacity-55 disabled:pointer-events-none [&_svg]:size-[15px]",
  {
    variants: {
      variant: {
        primary: "bg-acc text-acc-on hover:bg-acc-h hover:-translate-y-px",
        ghost:
          "bg-transparent border border-line text-ink hover:bg-bg3 hover:border-line2",
        subtle: "bg-bg3 text-ink hover:bg-bg4",
        danger:
          "bg-transparent border border-bad/40 text-bad hover:bg-bad-t",
      },
      size: {
        default: "h-[34px] px-[13px] text-[12.5px]",
        sm: "h-[28px] px-[10px] text-[12px]",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
)

export type BtnProps = React.ComponentProps<"button"> &
  VariantProps<typeof btn> & { asChild?: boolean }

export function Btn({
  className,
  variant,
  size,
  block,
  asChild,
  ...props
}: BtnProps) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp className={cn(btn({ variant, size, block }), className)} {...props} />
  )
}

/* ---- Icon button ---- */
export function IconBtn({
  className,
  asChild,
  danger,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean; danger?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      className={cn(
        "grid place-items-center size-[30px] rounded-sm transition-colors duration-150 [&_svg]:size-4",
        danger
          ? "text-bad hover:bg-bad-t hover:text-bad"
          : "text-muted-foreground hover:bg-bg3 hover:text-ink",
        className
      )}
      {...props}
    />
  )
}

/* ---- Status pill (dot + label) ---- */
const pillTone = {
  ok: "bg-ok-t text-ok",
  warn: "bg-warn-t text-warn",
  bad: "bg-bad-t text-bad",
  idle: "bg-bg3 text-muted-foreground",
} as const
const dotTone = {
  ok: "bg-ok",
  warn: "bg-warn",
  bad: "bg-bad",
  idle: "bg-faint",
} as const

export function Pill({
  tone = "idle",
  dotColor,
  className,
  children,
}: {
  tone?: keyof typeof pillTone
  dotColor?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] font-mono text-[10.5px] px-2 py-[2px] rounded-full",
        pillTone[tone],
        className
      )}
    >
      <span
        className={cn("size-[6px] rounded-full", !dotColor && dotTone[tone])}
        style={dotColor ? { background: dotColor } : undefined}
      />
      {children}
    </span>
  )
}

/* ---- Role badge ---- */
const roleTone = {
  owner: "bg-acc-t text-acc",
  admin: "bg-admin-t text-admin",
  member: "bg-bg3 text-muted-foreground",
} as const

export function RoleBadge({
  role,
  className,
}: {
  role: string
  className?: string
}) {
  const tone = roleTone[role as keyof typeof roleTone] ?? roleTone.member
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] font-mono text-[10.5px] font-medium px-2 py-[2px] rounded-[5px] lowercase tracking-[0.01em]",
        tone,
        className
      )}
    >
      {role}
    </span>
  )
}

/* ---- Toggle switch ---- */
export function Toggle({
  checked,
  onChange,
  className,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  className?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-[38px] h-[22px] rounded-full border border-line transition-colors shrink-0",
        checked ? "bg-acc" : "bg-bg4",
        className
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] left-[2px] size-4 rounded-full transition-transform duration-150 ease-precision",
          checked ? "translate-x-4 bg-acc-on" : "bg-ink"
        )}
      />
    </button>
  )
}

/* ---- Presence dot with pulse ---- */
export function DotPulse({ className }: { className?: string }) {
  return (
    <span
      className={cn("relative inline-block size-[7px] rounded-full bg-ok", className)}
    >
      <span className="absolute -inset-[3px] rounded-full border-[1.5px] border-ok opacity-50 animate-ping" />
    </span>
  )
}
