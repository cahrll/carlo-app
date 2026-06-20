"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Member, Task, TaskComment } from "@/lib/types"
import { formatShort, shortId } from "@/lib/utils"
import { priorityMeta } from "@/lib/board-ui"
import { createClient } from "@/lib/client"
import { addComment } from "@/lib/services/actions/comment"
import { updateTask } from "@/lib/services/actions/task"
import { updateTaskSchema } from "@/lib/schemas/task"
import { useAuth } from "@/context/auth-context"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { Btn, IconBtn, Pill } from "@/components/common/pm"
import { PmInput, PmTextarea, Segmented } from "@/components/common/pm-form"
import { UserAvatar } from "@/components/common/user-avatar"
import { AssigneeSelect } from "./assignee-select"
import {
  IconX,
  IconFlag,
  IconUser,
  IconCal,
  IconClock,
  IconSend,
  IconPencil,
} from "@/components/common/icons"

type TaskFormData = z.infer<typeof updateTaskSchema>

function Prop({
  label,
  children,
}: {
  label: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="w-[96px] flex-none flex items-center gap-[7px] font-mono text-[11px] text-faint [&_svg]:size-[13px]">
        {label}
      </span>
      <span className="flex-1 flex items-center gap-2 text-[12.5px]">
        {children}
      </span>
    </div>
  )
}

export function TaskDetailSheet({
  task,
  sectionTitle,
  sectionColor,
  open,
  onOpenChange,
  onUpdated,
  members,
}: {
  task: Task | null
  sectionTitle?: string
  sectionColor?: string
  open: boolean
  onOpenChange: (v: boolean) => void
  onUpdated?: (t: Task) => void
  members: Member[]
}) {
  const { user, profile } = useAuth()
  const [comments, setComments] = React.useState<TaskComment[]>([])
  const [text, setText] = React.useState("")
  const [posting, setPosting] = React.useState(false)
  const [editing, setEditing] = React.useState(false)
  const [isSaving, startSaving] = React.useTransition()

  const form = useForm<TaskFormData>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      assignee_id: "",
      priority: "medium",
    },
  })

  const resetFromTask = React.useCallback(() => {
    if (!task) return
    form.reset({
      title: task.title,
      description: task.description ?? "",
      due_date: task.due_date ? new Date(task.due_date) : undefined,
      assignee_id: task.assignee_id ?? "",
      priority: (task.priority as "low" | "medium" | "high") ?? "medium",
    })
  }, [task, form])

  // reset edit mode on task change
  React.useEffect(() => {
    setEditing(false)
  }, [task?.id])

  const startEditing = () => {
    resetFromTask()
    setEditing(true)
  }

  function handleSave(data: TaskFormData) {
    if (!task) return
    startSaving(async () => {
      const result = await updateTask(task.id, data)
      if (!result.error && result.data) {
        onUpdated?.(result.data as Task)
        setEditing(false)
      }
    })
  }

  React.useEffect(() => {
    if (!open || !task) return
    let cancel = false
    const supabase = createClient()
    const taskId = task.id
    const currentUserId = user?.id

    const loadComments = () => {
      supabase
        .from("task_comment")
        .select("*, author:author_id(id, name, image_url)")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true })
        .then(({ data }) => {
          if (!cancel) setComments((data as TaskComment[]) ?? [])
        })
    }

    loadComments()

    // stream in others' comments live (ours show optimistically)
    const channel = supabase
      .channel(`task:${taskId}:comments`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "task_comment",
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          const authorId = (payload.new as Record<string, unknown>)?.author_id
          if (authorId && authorId !== currentUserId) loadComments()
        }
      )
      .subscribe()

    return () => {
      cancel = true
      channel.unsubscribe()
    }
  }, [open, task, user?.id])

  if (!task) return null
  const pm = priorityMeta(task.priority)

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    const value = text.trim()
    if (!value || !task || posting) return
    setPosting(true)
    const optimistic: TaskComment = {
      id: `optimistic-${Date.now()}`,
      task_id: task.id,
      author_id: user?.id ?? "",
      text: value,
      created_at: new Date().toISOString(),
      author: {
        id: user?.id ?? "",
        name: profile?.name ?? "You",
        image_url: profile?.image_url ?? null,
      },
    }
    setComments((c) => [...c, optimistic])
    setText("")
    const result = await addComment({ task_id: task.id, text: value })
    if (!result.error && result.data) {
      setComments((c) =>
        c.map((m) => (m.id === optimistic.id ? (result.data as TaskComment) : m))
      )
    } else {
      setComments((c) => c.filter((m) => m.id !== optimistic.id))
    }
    setPosting(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="p-0 gap-0 w-full sm:max-w-[440px] bg-bg1 border-l border-line2 flex flex-col"
      >
        <SheetTitle className="sr-only">{task.title}</SheetTitle>
        <SheetDescription className="sr-only">Task details</SheetDescription>

        {/* header */}
        <div className="flex-none flex items-center gap-[10px] px-[15px] py-[13px] border-b border-line">
          <span className="font-mono text-[12px] text-faint">
            {shortId(task.id)}
          </span>
          {sectionTitle && (
            <Pill tone="idle" dotColor={sectionColor} className="bg-bg3">
              {sectionTitle}
            </Pill>
          )}
          <span className="flex-1" />
          {editing ? (
            <>
              <Btn
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => {
                  setEditing(false)
                  resetFromTask()
                }}
              >
                Cancel
              </Btn>
              <Btn
                size="sm"
                type="button"
                disabled={isSaving}
                onClick={form.handleSubmit(handleSave)}
              >
                {isSaving ? "Saving..." : "Save"}
              </Btn>
            </>
          ) : (
            <IconBtn aria-label="Edit task" onClick={startEditing}>
              <IconPencil />
            </IconBtn>
          )}
          <IconBtn aria-label="Close" onClick={() => onOpenChange(false)}>
            <IconX />
          </IconBtn>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-[18px]">
          {editing ? (
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <PmInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  placeholder="Task title"
                  className="text-[15px] font-semibold"
                />
              )}
            />
          ) : (
            <div className="text-[17px] font-semibold leading-[1.3]">
              {task.title}
            </div>
          )}

          <div className="mt-[18px] flex flex-col gap-[2px]">
            <Prop label={<><IconFlag />Priority</>}>
              {editing ? (
                <Controller
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <Segmented
                      value={field.value ?? "medium"}
                      onChange={field.onChange}
                      options={[
                        { value: "high", label: "High", className: "text-bad" },
                        { value: "medium", label: "Med" },
                        { value: "low", label: "Low", className: "text-faint" },
                      ]}
                    />
                  )}
                />
              ) : (
                <Pill tone={pm.pill}>{pm.label.toLowerCase()}</Pill>
              )}
            </Prop>
            <Prop label={<><IconUser />Assignee</>}>
              {editing ? (
                <Controller
                  control={form.control}
                  name="assignee_id"
                  render={({ field }) => (
                    <AssigneeSelect
                      members={members}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  )}
                />
              ) : task.assignee_name ? (
                <>
                  <UserAvatar
                    name={task.assignee_name}
                    hueKey={task.assignee_id}
                    size={22}
                  />
                  <span>{task.assignee_name}</span>
                </>
              ) : (
                <span className="text-faint">Unassigned</span>
              )}
            </Prop>
            <Prop label={<><IconCal />Due</>}>
              {editing ? (
                <Controller
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <PmInput
                      type="date"
                      mono
                      className="h-8"
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
                  )}
                />
              ) : (
                <span className="font-mono">
                  {task.due_date ? formatShort(task.due_date) : "Not set"}
                </span>
              )}
            </Prop>
            <Prop label={<><IconClock />Created</>}>
              <span className="font-mono text-faint">
                {formatShort(task.created_at)}
                {task.creator_name ? ` · by ${task.creator_name}` : ""}
              </span>
            </Prop>
          </div>

          <div className="mt-[18px] pt-4 border-t border-line">
            <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-faint mb-[9px]">
              Description
            </div>
            {editing ? (
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => (
                  <PmTextarea
                    {...field}
                    rows={4}
                    placeholder="Task description"
                  />
                )}
              />
            ) : (
              <p className="text-[12.5px] leading-[1.6] max-w-[62ch] text-[oklch(0.82_0.01_250)] whitespace-pre-wrap">
                {task.description || "No description yet."}
              </p>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-line">
            <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-faint mb-[13px]">
              Activity
            </div>
            <div className="flex flex-col gap-[13px]">
              {comments.length === 0 && (
                <p className="font-mono text-[11px] text-faint">
                  No comments yet.
                </p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-[10px]">
                  <UserAvatar
                    name={c.author?.name}
                    hueKey={c.author?.id}
                    size={24}
                  />
                  <div className="text-[12px] text-muted-foreground min-w-0">
                    <span className="text-ink font-medium">
                      {c.author?.name ?? "Someone"}
                    </span>{" "}
                    <span className="whitespace-pre-wrap break-words">
                      {c.text}
                    </span>
                    <span className="block font-mono text-[10px] text-faint mt-[2px]">
                      {formatShort(c.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* composer */}
        <form
          onSubmit={submitComment}
          className="flex-none p-[12px_15px] border-t border-line"
        >
          <div className="flex items-end gap-[9px] bg-bg3 border border-line rounded-md p-[8px_8px_8px_12px] focus-within:border-acc focus-within:shadow-[0_0_0_3px_var(--acc-ring)] transition-[border-color,box-shadow]">
            <textarea
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  submitComment(e)
                }
              }}
              placeholder="Add a comment"
              className="flex-1 bg-transparent border-0 outline-none text-foreground resize-none leading-[1.5] max-h-[120px] py-1 placeholder:text-faint"
            />
            <button
              type="submit"
              disabled={!text.trim() || posting}
              className="grid place-items-center size-8 rounded-sm bg-acc text-acc-on disabled:opacity-50 [&_svg]:size-[15px]"
              aria-label="Send comment"
            >
              <IconSend />
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
