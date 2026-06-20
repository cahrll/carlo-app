"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { createSectionSchema } from "@/lib/schemas/section"
import { Btn } from "@/components/common/ui-elements"
import { Field, Input } from "@/components/common/form"
import { Modal } from "@/components/common/modal"
import { IconPlus } from "@/components/common/icons"

type FormData = z.infer<typeof createSectionSchema>

interface CreateSectionFormProps {
  boardId: string
  creatorId: string
  sortOrder: number
  onSubmit: (data: FormData) => void
  isPending?: boolean
  trigger?: React.ReactNode
}

const CreateSectionForm = ({
  boardId,
  creatorId,
  sortOrder,
  onSubmit,
  isPending = false,
  trigger,
}: CreateSectionFormProps) => {
  const [open, setOpen] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(createSectionSchema),
    defaultValues: {
      title: "",
      board_id: boardId,
      creator_id: creatorId,
      sort_order: sortOrder,
    },
  })

  function handleCreateSection(data: FormData) {
    onSubmit(data)
    setOpen(false)
    form.reset({
      title: "",
      board_id: boardId,
      creator_id: creatorId,
      sort_order: sortOrder + 1,
    })
  }

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="New section"
      description="Add a section to this board."
      trigger={
        trigger ?? (
          <Btn variant="ghost" size="sm">
            <IconPlus />
            New section
          </Btn>
        )
      }
      footer={
        <>
          <span className="flex-1" />
          <Btn variant="ghost" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Btn>
          <Btn type="submit" form="create-section-form" disabled={isPending}>
            {isPending ? "Creating..." : "Create section"}
          </Btn>
        </>
      }
    >
      <form
        id="create-section-form"
        onSubmit={form.handleSubmit(handleCreateSection)}
      >
        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <Field label="Section name" htmlFor="title">
              <Input
                {...field}
                id="title"
                autoFocus
                placeholder="e.g. In Review"
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />
      </form>
    </Modal>
  )
}

export default CreateSectionForm
