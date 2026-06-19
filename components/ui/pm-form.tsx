import * as React from "react"
import { cn } from "@/lib/utils"
import { IconX } from "@/components/ui/icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const inputBase =
  "w-full bg-bg3 border border-line rounded-sm text-foreground outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-faint focus:border-acc focus:shadow-[0_0_0_3px_var(--acc-ring)] disabled:opacity-70 aria-[invalid=true]:border-bad"

export const PmInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { mono?: boolean }
>(function PmInput({ className, mono, ...props }, ref) {
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

export const PmTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(function PmTextarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(inputBase, "px-[11px] py-[9px] resize-none leading-[1.5]", className)}
      {...props}
    />
  )
})

export function PmField({
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

/** input with a leading icon */
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

/* ---- dialog frame ---- */
export const pmDialogContentClass =
  "p-0 gap-0 bg-panel border border-line2 rounded-[13px] sm:max-w-[460px] overflow-hidden shadow-[0_40px_80px_-30px_oklch(0_0_0/0.85)]"

export function PmDialogHeader({
  title,
  onClose,
}: {
  title: string
  onClose?: () => void
}) {
  return (
    <div className="flex items-center gap-[10px] px-[17px] py-[15px] border-b border-line">
      <h3 className="text-[14px] font-semibold">{title}</h3>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-auto grid place-items-center size-[30px] rounded-sm text-muted-foreground hover:bg-bg3 hover:text-ink [&_svg]:size-4"
          aria-label="Close"
        >
          <IconX />
        </button>
      )}
    </div>
  )
}

export function PmDialogBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("p-[17px] flex flex-col gap-[14px]", className)}
      {...props}
    />
  )
}

export function PmDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center gap-[9px] px-[17px] py-[13px] border-t border-line bg-bg1",
        className
      )}
      {...props}
    />
  )
}

// styled dialog frame
export function PmDialog({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  children,
  footer,
  className,
  contentClassName,
}: {
  open?: boolean
  onOpenChange?: (v: boolean) => void
  title: string
  description?: string
  trigger?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        showCloseButton={false}
        className={cn(pmDialogContentClass, contentClassName)}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          {description ?? title}
        </DialogDescription>
        <PmDialogHeader title={title} onClose={() => onOpenChange?.(false)} />
        <PmDialogBody className={className}>{children}</PmDialogBody>
        {footer && <PmDialogFooter>{footer}</PmDialogFooter>}
      </DialogContent>
    </Dialog>
  )
}

/** Compact segmented control. */
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
