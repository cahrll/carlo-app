import { createClient } from "@/lib/supabase/server"
import { type ViewerRole } from "@/lib/services/queries/member"

// gates mirror the RLS permission model
export function canAccess(role: ViewerRole | null) {
  return role !== null // any accepted member (owner/admin/member)
}
export function canModify(role: ViewerRole | null) {
  return role === "owner" || role === "admin"
}
export function isOwner(role: ViewerRole | null) {
  return role === "owner"
}

function unwrapOrgId(rel: unknown): string | null {
  const node = Array.isArray(rel) ? rel[0] : rel
  return (node as { org_id?: string } | null)?.org_id ?? null
}

export async function orgIdForBoard(boardId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("board")
    .select("org_id")
    .eq("id", boardId)
    .single()
  return data?.org_id ?? null
}

export async function orgIdForSection(sectionId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("section")
    .select("board:board_id(org_id)")
    .eq("id", sectionId)
    .single()
  return unwrapOrgId(data?.board)
}

export async function orgIdForTask(taskId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("task")
    .select("section:section_id(board:board_id(org_id))")
    .eq("id", taskId)
    .single()
  const section = Array.isArray(data?.section) ? data?.section[0] : data?.section
  return unwrapOrgId((section as { board?: unknown } | null)?.board)
}

export async function orgIdForChatRoom(chatRoomId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("chat_room")
    .select("org_id")
    .eq("id", chatRoomId)
    .single()
  return data?.org_id ?? null
}
