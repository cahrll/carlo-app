import * as React from "react"
import { cn } from "@/lib/utils"
import { IconX } from "@/components/common/icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// dialog frame
export const modalContentClass =
  "p-0 gap-0 bg-panel border border-line2 rounded-[13px] sm:max-w-[460px] overflow-hidden shadow-[0_40px_80px_-30px_oklch(0_0_0/0.85)]"

export function ModalHeader({
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

export function ModalBody({
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

export function ModalFooter({
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

export function Modal({
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
        className={cn(modalContentClass, contentClassName)}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          {description ?? title}
        </DialogDescription>
        <ModalHeader title={title} onClose={() => onOpenChange?.(false)} />
        <ModalBody className={className}>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </DialogContent>
    </Dialog>
  )
}
