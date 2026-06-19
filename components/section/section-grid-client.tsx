"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Board, Member, SectionWithTasks, Task } from "@/lib/types"
import { useSectionGrid } from "@/hooks/use-section-grid"
import { useAuth } from "@/context/auth-context"
import { usePresence } from "@/hooks/use-presence"
import { sectionDot } from "@/lib/board-ui"
import { deleteBoard } from "@/lib/services/actions/board"
import DroppableSection from "./droppable-section"
import SectionEmpty from "./section-empty"
import SectionGridLoader from "./section-grid-loader"
import CreateSectionForm from "./create-section-form"
import UpdateBoardDialog from "../board/update-board-dialog"
import TaskOverlay from "../task/task-overlay"
import { TaskDetailSheet } from "../task/task-detail-sheet"
import { Btn, DotPulse, IconBtn } from "@/components/ui/pm"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { AvatarStack, UserAvatar } from "@/components/ui/user-avatar"
import {
  IconFilter,
  IconSort,
  IconPlus,
  IconPencil,
  IconTrash,
} from "@/components/ui/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core"

type Role = "owner" | "admin" | "member"

interface Props {
  board: Board
  initialSections: SectionWithTasks[]
  role: Role | null
  members: Member[]
}

type GroupBy = "status" | "priority" | "assignee"
type SortBy = "manual" | "due" | "priority"
type PriorityFilter = "all" | "high" | "medium" | "low"

const prRank: Record<string, number> = { high: 0, medium: 1, low: 2 }

const SectionGridClient = ({ board, initialSections, role, members }: Props) => {
  const {
    currentBoard,
    setCurrentBoard,
    optimisticSections,
    isPending,
    isMounted,
    activeTask,
    syncingTaskId,
    sensors,
    handleCreateSection,
    handleDeleteSection,
    handleCreateTask,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useSectionGrid(board, initialSections)

  const router = useRouter()
  const canModify = role === "owner" || role === "admin"
  const canDelete = role === "owner"

  const handleDeleteBoard = async () => {
    const result = await deleteBoard(currentBoard.id)
    if (!result.error) router.push(`/organization/${currentBoard.org_id}`)
  }

  const { user, profile } = useAuth()
  const presence = usePresence({
    channelName: `board:${board.id}:presence`,
    userId: user?.id ?? "",
    name: profile?.name ?? null,
  })

  const [groupBy, setGroupBy] = React.useState<GroupBy>("status")
  const [sort, setSort] = React.useState<SortBy>("manual")
  const [priorityFilter, setPriorityFilter] =
    React.useState<PriorityFilter>("all")

  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)

  const openTask = (task: Task) => {
    setSelectedTask(task)
    setSheetOpen(true)
  }

  const dndEnabled =
    groupBy === "status" && sort === "manual" && priorityFilter === "all"

  const refine = React.useCallback(
    (tasks: Task[]) => {
      let t = tasks
      if (priorityFilter !== "all")
        t = t.filter((x) => (x.priority ?? "medium") === priorityFilter)
      if (sort === "due") {
        t = [...t].sort((a, b) => {
          if (!a.due_date) return b.due_date ? 1 : 0
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        })
      } else if (sort === "priority") {
        t = [...t].sort(
          (a, b) =>
            (prRank[a.priority ?? "medium"] ?? 1) -
            (prRank[b.priority ?? "medium"] ?? 1)
        )
      }
      return t
    },
    [priorityFilter, sort]
  )

  // columns from the active grouping
  const columns: SectionWithTasks[] = React.useMemo(() => {
    if (groupBy === "status") {
      return optimisticSections.map((s) => ({ ...s, tasks: refine(s.tasks) }))
    }
    const all = optimisticSections.flatMap((s) => s.tasks)
    const mk = (id: string, title: string, tasks: Task[], i: number) =>
      ({
        id,
        title,
        board_id: board.id,
        creator_id: "",
        sort_order: i,
        created_at: "",
        tasks: refine(tasks),
      }) as SectionWithTasks

    if (groupBy === "priority") {
      return [
        mk("virt-high", "High", all.filter((t) => t.priority === "high"), 0),
        mk(
          "virt-med",
          "Med",
          all.filter((t) => (t.priority ?? "medium") === "medium"),
          1
        ),
        mk("virt-low", "Low", all.filter((t) => t.priority === "low"), 2),
      ]
    }
    // assignee
    const names = Array.from(
      new Set(all.map((t) => t.assignee_name ?? "Unassigned"))
    )
    return names.map((n, i) =>
      mk(
        `virt-${n}`,
        n,
        all.filter((t) => (t.assignee_name ?? "Unassigned") === n),
        i
      )
    )
  }, [groupBy, optimisticSections, refine, board.id])

  const onlineCount = Math.max(presence.length, 1)

  const boardHeader = (
    <div className="flex items-center gap-3 px-[18px] py-[12px] border-b border-line bg-bg1 max-nav:px-3">
      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold leading-[1.2] truncate">
          {currentBoard.title}
        </h1>
        {currentBoard.description && (
          <p className="text-[12px] text-faint truncate max-nav:hidden">
            {currentBoard.description}
          </p>
        )}
      </div>
      {(canModify || canDelete) && (
        <div className="ml-auto flex items-center gap-1 shrink-0">
          {canModify && (
            <UpdateBoardDialog
              board={currentBoard}
              onUpdated={setCurrentBoard}
              trigger={
                <IconBtn aria-label="Edit board">
                  <IconPencil />
                </IconBtn>
              }
            />
          )}
          {canDelete && (
            <ConfirmDialog
              trigger={
                <IconBtn danger aria-label="Delete board">
                  <IconTrash />
                </IconBtn>
              }
              title="Delete board"
              description="This permanently deletes the board and all of its sections and tasks. This cannot be undone."
              confirmLabel="Delete board"
              onConfirm={handleDeleteBoard}
            />
          )}
        </div>
      )}
    </div>
  )

  const boardbar = (
    <div className="flex items-center gap-[10px] px-[18px] py-[11px] border-b border-line bg-bg1 max-nav:flex-wrap max-nav:px-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Btn variant="ghost" size="sm">
            <IconFilter />
            {priorityFilter === "all" ? "Filter" : `Priority: ${priorityFilter}`}
          </Btn>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[180px]">
          <DropdownMenuLabel>Priority</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={priorityFilter}
            onValueChange={(v) => setPriorityFilter(v as PriorityFilter)}
          >
            <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="high">High</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="low">Low</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Sort</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={sort}
            onValueChange={(v) => setSort(v as SortBy)}
          >
            <DropdownMenuRadioItem value="manual">Manual</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="due">Due date</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="priority">
              Priority
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Btn variant="ghost" size="sm">
            <IconSort />
            Group: {groupBy === "status" ? "Status" : groupBy === "priority" ? "Priority" : "Assignee"}
          </Btn>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[170px]">
          <DropdownMenuRadioGroup
            value={groupBy}
            onValueChange={(v) => setGroupBy(v as GroupBy)}
          >
            <DropdownMenuRadioItem value="status">Status</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="priority">
              Priority
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="assignee">
              Assignee
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1 max-nav:hidden" />

      {canModify && (
        <CreateSectionForm
          boardId={board.id}
          creatorId={board.creator_id}
          sortOrder={optimisticSections.length}
          onSubmit={handleCreateSection}
          isPending={isPending}
          trigger={
            <Btn variant="ghost" size="sm">
              <IconPlus />
              Section
            </Btn>
          }
        />
      )}

      <div className="flex items-center gap-[9px]">
        {presence.length > 0 && (
          <AvatarStack>
            {presence.slice(0, 4).map((p) => (
              <UserAvatar
                key={p.userId}
                name={p.name}
                hueKey={p.userId}
                size={26}
              />
            ))}
          </AvatarStack>
        )}
        <span className="flex items-center gap-[6px] font-mono text-[11.5px] text-muted-foreground">
          <DotPulse />
          {onlineCount} online
        </span>
      </div>
    </div>
  )

  const columnEls = columns.map((section, i) => (
    <DroppableSection
      key={section.id}
      section={section}
      index={i}
      tasks={section.tasks}
      onCreateTask={handleCreateTask(section.id)}
      onOpenTask={openTask}
      onDeleteSection={handleDeleteSection}
      isPending={isPending}
      syncingTaskId={syncingTaskId}
      draggable={dndEnabled}
      canModify={canModify}
      canDelete={canDelete}
      members={members}
    />
  ))

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {boardHeader}
      {boardbar}

      {optimisticSections.length === 0 ? (
        <SectionEmpty
          boardId={board.id}
          creatorId={board.creator_id}
          sortOrder={0}
          onCreate={handleCreateSection}
          isPending={isPending}
        />
      ) : !isMounted ? (
        <SectionGridLoader />
      ) : dndEnabled ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-[13px] p-[16px_18px] flex-1 min-h-0 overflow-x-auto items-start max-nav:p-3 max-nav:gap-[10px]">
            {columnEls}
          </div>
          <DragOverlay>
            {activeTask ? <TaskOverlay task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="flex gap-[13px] p-[16px_18px] flex-1 min-h-0 overflow-x-auto items-start max-nav:p-3 max-nav:gap-[10px]">
          {columnEls}
        </div>
      )}

      <TaskDetailSheet
        task={selectedTask}
        sectionTitle={
          selectedTask
            ? optimisticSections.find((s) =>
                s.tasks.some((t) => t.id === selectedTask.id)
              )?.title
            : undefined
        }
        sectionColor={
          selectedTask
            ? (() => {
                const idx = optimisticSections.findIndex((s) =>
                  s.tasks.some((t) => t.id === selectedTask.id)
                )
                const s = optimisticSections[idx]
                return s ? sectionDot(s.title, idx) : undefined
              })()
            : undefined
        }
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdated={(t) => setSelectedTask(t)}
        members={members}
      />
    </div>
  )
}

export default SectionGridClient
