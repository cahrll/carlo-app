import { Board, Member, Section, SectionWithTasks, Task } from "@/lib/types"
import SectionGridClient from "./section-grid-client"
import { getTasksByBoardId } from "@/lib/services/queries/task"
import type { ViewerRole } from "@/lib/services/queries/member"

interface SectionGridProps {
  board: Board
  sections: Section[]
  role: ViewerRole | null
  members: Member[]
}

const SectionGrid = async ({ board, sections, role, members }: SectionGridProps) => {
  const tasksResult = await getTasksByBoardId(board.id)
  const allTasks: Task[] = tasksResult.error ? [] : (tasksResult.data as Task[])

  const tasksBySection = allTasks.reduce((acc, task) => {
    if (!acc[task.section_id]) acc[task.section_id] = []
    acc[task.section_id].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  const sectionsWithTasks: SectionWithTasks[] = sections.map((section) => ({
    ...section,
    tasks: tasksBySection[section.id] || [],
  }))

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <SectionGridClient
        board={board}
        initialSections={sectionsWithTasks}
        role={role}
        members={members}
      />
    </div>
  )
}

export default SectionGrid
