"use client"

import { useEffect, useState } from "react"
import { Member, Section, Task } from "@/lib/types"
import { cn } from "@/lib/utils"
import { sectionDot, isDoneSection } from "@/lib/board-ui"
import CreateTaskForm from "../task/create-task-form"
import SortableTaskItem from "../task/sortable-task-item"
import { TaskCard } from "../task/task-card"
import UpdateSectionForm from "./update-section-form"
import { IconBtn } from "@/components/common/pm"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { IconPlus, IconTrash } from "@/components/common/icons"
import { createTaskSchema } from "@/lib/schemas/task"
import z from "zod"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

interface DroppableSectionProps {
  section: Section
  tasks: Task[]
  index: number
  onCreateTask: (data: z.infer<typeof createTaskSchema>) => void
  onOpenTask: (task: Task) => void
  onDeleteSection?: (id: string) => void
  isPending: boolean
  syncingTaskId?: string | null
  draggable?: boolean
  canModify?: boolean
  canDelete?: boolean
  members: Member[]
}

const Column = ({
  children,
  innerRef,
  isOver,
}: {
  children: React.ReactNode
  innerRef?: (node: HTMLElement | null) => void
  isOver?: boolean
}) => (
  <section
    ref={innerRef}
    className={cn(
      "flex-[0_0_256px] bg-bg2 border rounded-lg flex flex-col max-h-full",
      "max-[560px]:flex-[0_0_82vw] max-[560px]:max-w-[320px]",
      isOver ? "border-acc" : "border-line"
    )}
  >
    {children}
  </section>
)

const DroppableSection = ({
  section,
  tasks,
  index,
  onCreateTask,
  onOpenTask,
  onDeleteSection,
  isPending,
  syncingTaskId,
  draggable = true,
  canModify = false,
  canDelete = false,
  members,
}: DroppableSectionProps) => {
  const [currentSection, setCurrentSection] = useState(section)

  useEffect(() => {
    setCurrentSection(section)
  }, [section])

  const { setNodeRef, isOver } = useDroppable({
    id: section.id,
    data: { type: "section", section },
    disabled: !draggable,
  })

  const done = isDoneSection(currentSection.title)

  const header = (
    <div className="flex items-center gap-2 px-[11px] py-[10px]">
      <span
        className="size-[7px] rounded-full shrink-0"
        style={{ background: sectionDot(currentSection.title, index) }}
      />
      <span className="font-mono text-[12px] font-semibold tracking-[0.06em] uppercase">
        {currentSection.title}
      </span>
      <span className="font-mono text-[11px] text-faint bg-bg0 rounded-full px-[7px]">
        {tasks.length}
      </span>
      {draggable && (
        <div className="ml-auto flex items-center">
          {canModify && (
            <UpdateSectionForm
              section={currentSection}
              onUpdate={setCurrentSection}
            />
          )}
          {canDelete && (
            <ConfirmDialog
              trigger={
                <IconBtn
                  danger
                  className="size-6 [&_svg]:size-[14px]"
                  aria-label="Delete section"
                >
                  <IconTrash />
                </IconBtn>
              }
              title="Delete section"
              description="This deletes the section and all of its tasks. This cannot be undone."
              confirmLabel="Delete section"
              onConfirm={() => onDeleteSection?.(currentSection.id)}
            />
          )}
          <CreateTaskForm
            sectionId={section.id}
            sectionTitle={currentSection.title}
            sortOrder={tasks.length}
            onSubmit={onCreateTask}
            isPending={isPending}
            members={members}
            trigger={
              <IconBtn
                className="size-6 [&_svg]:size-[14px]"
                aria-label="Add task"
              >
                <IconPlus />
              </IconBtn>
            }
          />
        </div>
      )}
    </div>
  )

  const body = (
    <div className="flex flex-col gap-2 px-[9px] pb-[11px] overflow-y-auto">
      {tasks.map((task) =>
        draggable ? (
          <SortableTaskItem
            key={task.id}
            task={task}
            done={done}
            isSyncing={syncingTaskId === task.id}
            onOpen={onOpenTask}
          />
        ) : (
          <TaskCard
            key={task.id}
            task={task}
            done={done}
            onOpen={() => onOpenTask(task)}
          />
        )
      )}
      {tasks.length === 0 && (
        <div className="text-center font-mono text-[11px] text-faint py-6">
          No tasks
        </div>
      )}
    </div>
  )

  const footer = draggable ? (
    <CreateTaskForm
      sectionId={section.id}
      sectionTitle={currentSection.title}
      sortOrder={tasks.length}
      onSubmit={onCreateTask}
      isPending={isPending}
      members={members}
      trigger={
        <button
          type="button"
          className="flex items-center gap-[7px] mx-[9px] mb-[11px] px-[9px] py-2 rounded-sm border border-dashed border-line text-faint text-[12px] hover:text-ink hover:border-line2 transition-colors [&_svg]:size-[14px]"
        >
          <IconPlus />
          <span>Add task</span>
        </button>
      }
    />
  ) : null

  const content = (
    <>
      {header}
      {draggable ? (
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {body}
        </SortableContext>
      ) : (
        body
      )}
      {footer}
    </>
  )

  if (!draggable) return <Column>{content}</Column>
  return (
    <Column innerRef={setNodeRef} isOver={isOver}>
      {content}
    </Column>
  )
}

export default DroppableSection
