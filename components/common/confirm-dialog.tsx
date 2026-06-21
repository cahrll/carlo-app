"use client"

import * as React from "react"
import { Btn } from "@/components/common/ui-elements"
import { Input } from "@/components/common/form"
import { Modal } from "@/components/common/modal"

export function ConfirmDialog({
  trigger,
  title,
  description,
  body,
  confirmLabel = "Delete",
  pendingLabel = "Working...",
  danger = true,
  confirmPhrase,
  onConfirm,
}: {
  trigger: React.ReactNode
  title: string
  description?: string
  body?: React.ReactNode
  confirmLabel?: string
  pendingLabel?: string
  danger?: boolean
  // type-to-confirm: must match to enable confirm
  confirmPhrase?: string
  onConfirm: () => Promise<unknown> | void
}) {
  const [open, setOpen] = React.useState(false)
  const [typed, setTyped] = React.useState("")
  const [pending, setPending] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setTyped("")
      setPending(false)
    }
  }, [open])

  const phraseOk =
    !confirmPhrase || typed.trim() === confirmPhrase.trim()

  async function handleConfirm() {
    if (!phraseOk || pending) return
    setPending(true)
    const result = await onConfirm()
    // close only on success (a truthy error keeps it open)
    if (
      result &&
      typeof result === "object" &&
      "error" in result &&
      (result as { error?: unknown }).error
    ) {
      setPending(false)
      return
    }
    setOpen(false)
  }

  return (
    <Modal
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
            {pending ? pendingLabel : confirmLabel}
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
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}
    </Modal>
  )
}
