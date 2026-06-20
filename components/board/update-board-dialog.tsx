"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Board } from "@/lib/types"
import { updateBoardSchema } from "@/lib/schemas/board"
import { updateBoard } from "@/lib/services/actions/board"
import { Btn } from "@/components/common/pm"
import { PmDialog, PmField, PmInput } from "@/components/common/pm-form"

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

  const form = useForm<FormData>({
    resolver: zodResolver(updateBoardSchema),
    defaultValues: {
      title: board.title,
      description: board.description ?? "",
    },
  })

  async function handleUpdateBoard(data: FormData) {
    const { error } = await updateBoard(board.id, data)
    if (error) return
    onUpdated?.({ ...board, title: data.title, description: data.description })
    setOpen(false)
  }

  return (
    <PmDialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (v)
          form.reset({
            title: board.title,
            description: board.description ?? "",
          })
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
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Save changes"}
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
            <PmField label="Board name" hint={fieldState.error?.message}>
              <PmInput
                {...field}
                autoFocus
                placeholder="e.g. Sprint 25"
                aria-invalid={fieldState.invalid}
              />
            </PmField>
          )}
        />
        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <PmField
              label={
                <>
                  Description <span className="text-faint">optional</span>
                </>
              }
            >
              <PmInput {...field} placeholder="What is this board for?" />
            </PmField>
          )}
        />
      </form>
    </PmDialog>
  )
}
