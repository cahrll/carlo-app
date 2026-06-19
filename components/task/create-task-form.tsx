"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { createTaskSchema } from "@/lib/schemas/task"
import { Member } from "@/lib/types"
import { Btn } from "@/components/ui/pm"
import {
  PmDialog,
  PmField,
  PmInput,
  PmTextarea,
  Segmented,
} from "@/components/ui/pm-form"
import { Kbd } from "@/components/ui/kbd"
import { IconPlus, IconFlag, IconCal, IconUser } from "@/components/ui/icons"
import { AssigneeSelect } from "./assignee-select"

type FormData = z.infer<typeof createTaskSchema>

interface CreateTaskFormProps {
  sectionId: string
  sectionTitle?: string
  sortOrder: number
  onSubmit: (data: FormData) => void
  isPending?: boolean
  trigger?: React.ReactNode
  members: Member[]
}

const CreateTaskForm = ({
  sectionId,
  sectionTitle,
  sortOrder,
  onSubmit,
  isPending = false,
  trigger,
  members,
}: CreateTaskFormProps) => {
  const [open, setOpen] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      section_id: sectionId,
      sort_order: sortOrder,
      due_date: undefined,
      assignee_id: "",
      priority: "medium",
    },
  })

  function handleCreateTask(data: FormData) {
    onSubmit(data)
    setOpen(false)
    form.reset({
      title: "",
      description: "",
      section_id: sectionId,
      sort_order: sortOrder + 1,
      due_date: undefined,
      assignee_id: "",
      priority: "medium",
    })
  }

  return (
    <PmDialog
      open={open}
      onOpenChange={setOpen}
      title="New task"
      description="Create a new task in this section."
      trigger={
        trigger ?? (
          <Btn size="sm">
            <IconPlus />
            Add task
          </Btn>
        )
      }
      footer={
        <>
          <span className="font-mono text-[11px] text-faint">
            Section: {sectionTitle ?? "—"}
          </span>
          <span className="flex-1" />
          <Btn variant="ghost" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Btn>
          <Btn
            type="submit"
            form="create-task-form"
            disabled={isPending}
          >
            Create task
            <Kbd className="border-acc-on/30 text-acc-on bg-transparent">⌘↵</Kbd>
          </Btn>
        </>
      }
    >
      <form
        id="create-task-form"
        onSubmit={form.handleSubmit(handleCreateTask)}
        className="flex flex-col gap-[14px]"
      >
        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <PmField label="Title" htmlFor="title">
              <PmInput
                {...field}
                id="title"
                placeholder="What needs to be done?"
                autoFocus
                aria-invalid={fieldState.invalid}
              />
            </PmField>
          )}
        />
        <div className="flex gap-3">
          <Controller
            control={form.control}
            name="priority"
            render={({ field }) => (
              <PmField label={<><IconFlag /> Priority</>} className="flex-1">
                <Segmented
                  full
                  value={field.value ?? "medium"}
                  onChange={field.onChange}
                  options={[
                    { value: "high", label: "High", className: "text-bad" },
                    { value: "medium", label: "Med" },
                    { value: "low", label: "Low", className: "text-faint" },
                  ]}
                />
              </PmField>
            )}
          />
          <Controller
            control={form.control}
            name="due_date"
            render={({ field, fieldState }) => (
              <PmField label={<><IconCal /> Due date</>} className="flex-1">
                <PmInput
                  type="date"
                  mono
                  aria-invalid={fieldState.invalid}
                  value={
                    field.value
                      ? new Date(field.value).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? new Date(e.target.value) : undefined
                    )
                  }
                />
              </PmField>
            )}
          />
        </div>
        <Controller
          control={form.control}
          name="assignee_id"
          render={({ field }) => (
            <PmField label={<><IconUser /> Assignee</>}>
              <AssigneeSelect
                members={members}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </PmField>
          )}
        />
        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <PmField label="Description">
              <PmTextarea
                {...field}
                rows={3}
                placeholder="Add detail, links, or acceptance criteria"
              />
            </PmField>
          )}
        />
      </form>
    </PmDialog>
  )
}

export default CreateTaskForm
