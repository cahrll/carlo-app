import * as React from "react"
import { cn } from "@/lib/utils"

const inputBase =
  "w-full bg-bg3 border border-line rounded-sm text-foreground outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-faint focus:border-acc focus:shadow-[0_0_0_3px_var(--acc-ring)] disabled:opacity-70 aria-[invalid=true]:border-bad"

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { mono?: boolean }
>(function Input({ className, mono, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        inputBase,
        "h-9 px-[11px]",
        mono && "font-mono text-[12.5px]",
        className
      )}
      {...props}
    />
  )
})

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(inputBase, "px-[11px] py-[9px] resize-none leading-[1.5]", className)}
      {...props}
    />
  )
})

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label?: React.ReactNode
  hint?: React.ReactNode
  htmlFor?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-[6px]", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-[7px] text-[11.5px] font-medium text-muted-foreground [&_svg]:size-[14px] [&_svg]:text-faint"
        >
          {label}
        </label>
      )}
      {children}
      {hint && <span className="text-[11px] text-faint">{hint}</span>}
    </div>
  )
}

// input with leading icon
export function InputWrap({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="relative flex items-center [&>svg]:absolute [&>svg]:left-[11px] [&>svg]:size-[15px] [&>svg]:text-faint [&>svg]:pointer-events-none [&>input]:pl-[34px]">
      {icon}
      {children}
    </div>
  )
}

// compact segmented control
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  full,
}: {
  options: { value: T; label?: React.ReactNode; icon?: React.ReactNode; className?: string }[]
  value: T
  onChange: (v: T) => void
  className?: string
  full?: boolean
}) {
  return (
    <div
      className={cn(
        "inline-flex bg-bg2 border border-line rounded-sm p-[2px] gap-[2px]",
        full && "w-full",
        className
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "h-[26px] px-[10px] rounded-[5px] text-[12px] inline-flex items-center justify-center gap-[6px] [&_svg]:size-[13px] transition-colors",
            full && "flex-1",
            value === o.value
              ? "bg-bg4 text-ink"
              : "text-muted-foreground hover:text-ink",
            o.className
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  )
}
