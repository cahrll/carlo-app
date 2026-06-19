"use client"

import { Task } from "@/lib/types"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TaskCard } from "./task-card"

interface SortableTaskItemProps {
  task: Task
  isSyncing?: boolean
  done?: boolean
  onOpen?: (task: Task) => void
}

const SortableTaskItem = ({ task, done, onOpen }: SortableTaskItemProps) => {
  const isPending = task.id.startsWith("optimistic-")

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      disabled: isPending,
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <TaskCard
      task={task}
      done={done}
      pending={isPending}
      dragging={isDragging}
      innerRef={setNodeRef}
      style={style}
      dragProps={{ ...attributes, ...listeners }}
      onOpen={isPending ? undefined : () => onOpen?.(task)}
    />
  )
}

export default SortableTaskItem
