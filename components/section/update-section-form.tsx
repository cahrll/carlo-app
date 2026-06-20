"use client"

import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateSectionSchema } from "@/lib/schemas/section"
import { updateSection } from "@/lib/services/actions/section"
import { Section } from "@/lib/types"
import { Btn, IconBtn } from "@/components/common/ui-elements"
import { Field, Input } from "@/components/common/form"
import { Modal } from "@/components/common/modal"
import { IconDots } from "@/components/common/icons"

type FormData = z.infer<typeof updateSectionSchema>

interface UpdateSectionFormProps {
  section: Section
  onUpdate?: (updatedSection: Section) => void
}

const UpdateSectionForm = ({ section, onUpdate }: UpdateSectionFormProps) => {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormData>({
    resolver: zodResolver(updateSectionSchema),
    defaultValues: { title: section.title },
  })

  function handleUpdateSection(data: FormData) {
    startTransition(async () => {
      const result = await updateSection(section.id, data)
      if (!result.error && result.data) {
        setOpen(false)
        onUpdate?.({ ...section, title: result.data.title })
      }
    })
  }

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="Rename section"
      description="Change this section's name."
      trigger={
        <IconBtn className="size-6 [&_svg]:size-[14px]" aria-label="Edit section">
          <IconDots />
        </IconBtn>
      }
      footer={
        <>
          <span className="flex-1" />
          <Btn variant="ghost" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Btn>
          <Btn type="submit" form="update-section-form" disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Btn>
        </>
      }
    >
      <form
        id="update-section-form"
        onSubmit={form.handleSubmit(handleUpdateSection)}
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
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />
      </form>
    </Modal>
  )
}

export default UpdateSectionForm
