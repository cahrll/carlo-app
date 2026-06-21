"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Board } from "@/lib/types"
import { updateBoardSchema } from "@/lib/schemas/board"
import { updateBoard } from "@/lib/services/actions/board"
import { Btn } from "@/components/common/ui-elements"
import { Field, Input } from "@/components/common/form"
import { Modal } from "@/components/common/modal"

type FormData = z.infer<typeof updateBoardSchema>

export default function UpdateBoardDialog({
  board,
  onUpdated,
  trigger,
}: {
  board: Board
  onUpdated?: (board: Board) => void
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(updateBoardSchema),
    defaultValues: {
      title: board.title,
      description: board.description ?? "",
    },
  })

  async function handleUpdateBoard(data: FormData) {
    setBusy(true)
    const { error } = await updateBoard(board.id, data)
    if (error) {
      setBusy(false)
      return
    }
    onUpdated?.({ ...board, title: data.title, description: data.description })
    setOpen(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (v) {
          setBusy(false)
          form.reset({
            title: board.title,
            description: board.description ?? "",
          })
        }
      }}
      title="Edit board"
      description="Rename this board or change its description."
      trigger={trigger}
      footer={
        <>
          <span className="flex-1" />
          <Btn variant="ghost" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Btn>
          <Btn
            type="submit"
            form="update-board-form"
            disabled={busy}
          >
            {busy ? "Saving..." : "Save changes"}
          </Btn>
        </>
      }
    >
      <form
        id="update-board-form"
        onSubmit={form.handleSubmit(handleUpdateBoard)}
        className="flex flex-col gap-[14px]"
      >
        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <Field label="Board name" hint={fieldState.error?.message}>
              <Input
                {...field}
                autoFocus
                placeholder="e.g. Sprint 25"
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <Field
              label={
                <>
                  Description <span className="text-faint">optional</span>
                </>
              }
            >
              <Input {...field} placeholder="What is this board for?" />
            </Field>
          )}
        />
      </form>
    </Modal>
  )
}
