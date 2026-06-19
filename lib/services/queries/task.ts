import { createClient } from "@/lib/server"
import { getCurrentUser } from "../getCurrentUser"
import { Task } from "@/lib/types"

const BASE_SELECT = "*, creator:creator_id(name), assignee:assignee_id(name)"
const BOARD_SELECT = `${BASE_SELECT}, section:section_id!inner(board_id)`

type RawTask = Record<string, unknown> & {
  creator?: { name?: string | null } | null
  assignee?: { name?: string | null } | null
  task_comment?: { count: number }[] | null
}

function normalize(task: RawTask): Task {
  const commentAgg = Array.isArray(task.task_comment)
    ? task.task_comment[0]?.count
    : undefined
  return {
    ...task,
    creator_name: task.creator?.name ?? undefined,
    assignee_name: task.assignee?.name ?? undefined,
    comment_count: commentAgg,
    creator: undefined,
    assignee: undefined,
    section: undefined,
    task_comment: undefined,
  } as unknown as Task
}

export async function getTasks(sectionId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: true, message: "User is not authenticated" }
  }

  if (!sectionId.trim()) {
    return { error: true, message: "Section ID cannot be empty" }
  }

  const supabase = await createClient()

  // comment-count aggregate, fall back if absent
  let { data, error } = await supabase
    .from("task")
    .select(`${BASE_SELECT}, task_comment(count)`)
    .eq("section_id", sectionId)
    .order("sort_order", { ascending: false })

  if (error) {
    ;({ data, error } = await supabase
      .from("task")
      .select(BASE_SELECT)
      .eq("section_id", sectionId)
      .order("sort_order", { ascending: false }))
  }

  if (error || !data) {
    return { error: true, message: "Failed to get tasks" }
  }

  return { error: false, data: data.map(normalize) }
}

export async function getTasksByBoardId(boardId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return { error: true, message: "User is not authenticated" }
  }

  if (!boardId.trim()) {
    return { error: true, message: "Board ID cannot be empty" }
  }

  const supabase = await createClient()

  let { data, error } = await supabase
    .from("task")
    .select(`${BOARD_SELECT}, task_comment(count)`)
    .eq("section.board_id", boardId)
    .order("sort_order", { ascending: false })

  if (error) {
    ;({ data, error } = await supabase
      .from("task")
      .select(BOARD_SELECT)
      .eq("section.board_id", boardId)
      .order("sort_order", { ascending: false }))
  }

  if (error || !data) {
    return { error: true, message: "Failed to get tasks" }
  }

  return { error: false, data: data.map(normalize) }
}
