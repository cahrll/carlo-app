"use client"

import * as React from "react"
import { Btn } from "@/components/ui/pm"
import { PmDialog, PmInput } from "@/components/ui/pm-form"

export function ConfirmDialog({
  trigger,
  title,
  description,
  body,
  confirmLabel = "Delete",
  danger = true,
  confirmPhrase,
  onConfirm,
}: {
  trigger: React.ReactNode
  title: string
  description?: string
  body?: React.ReactNode
  confirmLabel?: string
  danger?: boolean
  // type-to-confirm: must match to enable confirm
  confirmPhrase?: string
  onConfirm: () => Promise<unknown> | void
}) {
  const [open, setOpen] = React.useState(false)
  const [typed, setTyped] = React.useState("")
  const [pending, startTransition] = React.useTransition()

  React.useEffect(() => {
    if (!open) setTyped("")
  }, [open])

  const phraseOk =
    !confirmPhrase || typed.trim() === confirmPhrase.trim()

  function handleConfirm() {
    if (!phraseOk) return
    startTransition(async () => {
      await onConfirm()
      setOpen(false)
    })
  }

  return (
    <PmDialog
      open={open}
      onOpenChange={setOpen}
      title={title}
      description={description}
      trigger={trigger}
      footer={
        <>
          <span className="flex-1" />
          <Btn variant="ghost" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Btn>
          <Btn
            type="button"
            variant={danger ? "danger" : "primary"}
            onClick={handleConfirm}
            disabled={pending || !phraseOk}
          >
            {pending ? "..." : confirmLabel}
          </Btn>
        </>
      }
    >
      <p className="text-[12.5px] leading-[1.6] text-muted-foreground">
        {body ?? description}
      </p>
      {confirmPhrase && (
        <div className="flex flex-col gap-[6px]">
          <label className="text-[11.5px] text-muted-foreground">
            Type{" "}
            <span className="font-mono text-ink">{confirmPhrase}</span> to
            confirm.
          </label>
          <PmInput
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}
    </PmDialog>
  )
}
