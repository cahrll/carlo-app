"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Board, Organization } from "@/lib/types"
import { createBoardSchema } from "@/lib/schemas/board"
import { createBoardWithSections } from "@/lib/services/actions/board"
import { Btn } from "@/components/ui/pm"
import { PmDialog, PmField, PmInput, PmTextarea } from "@/components/ui/pm-form"
import { IconPlus } from "@/components/ui/icons"

type FormData = z.infer<typeof createBoardSchema>

export default function CreateBoardDialog({
  organization,
  onBoardCreated,
  trigger,
}: {
  organization: Organization
  onBoardCreated: (board: Board) => void
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const searchParams = useSearchParams()

  const form = useForm<FormData>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: { title: "", description: "", org_id: organization.id },
  })

  useEffect(() => {
    if (searchParams.get("compose") === "board") setOpen(true)
  }, [searchParams])

  async function handleCreateBoard(data: FormData) {
    const { error, board } = await createBoardWithSections(data)
    if (error) return
    if (board) {
      onBoardCreated(board)
      setOpen(false)
      form.reset()
    }
  }

  return (
    <PmDialog
      open={open}
      onOpenChange={setOpen}
      title="New board"
      description="Create a board seeded with default sections."
      trigger={
        trigger ?? (
          <Btn>
            <IconPlus />
            New board
          </Btn>
        )
      }
      footer={
        <>
          <span className="flex-1" />
          <Btn variant="ghost" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Btn>
          <Btn
            type="submit"
            form="create-board-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creating..." : "Create board"}
          </Btn>
        </>
      }
    >
      <form
        id="create-board-form"
        onSubmit={form.handleSubmit(handleCreateBoard)}
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
            <PmField label={<>Description <span className="text-faint">optional</span></>}>
              <PmInput {...field} placeholder="What is this board for?" />
            </PmField>
          )}
        />
        <PmField label="Starting sections">
          <div className="flex gap-[6px] flex-wrap">
            {["To Do", "In Progress", "Testing", "Done"].map((s) => (
              <span
                key={s}
                className="font-mono text-[11px] text-[oklch(0.78_0.05_232)] bg-bg2 border border-line rounded-[5px] px-[10px] py-[5px]"
              >
                {s}
              </span>
            ))}
          </div>
        </PmField>
      </form>
    </PmDialog>
  )
}
