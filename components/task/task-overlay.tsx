"use client"

import { Task } from "@/lib/types"
import { TaskCard } from "./task-card"

interface TaskOverlayProps {
  task: Task
  done?: boolean
}

const TaskOverlay = ({ task, done }: TaskOverlayProps) => {
  return <TaskCard task={task} done={done} overlay />
}

export default TaskOverlay
