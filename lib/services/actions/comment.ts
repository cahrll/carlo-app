"use server"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "../queries/current-user"
import { addCommentSchema } from "@/lib/schemas/comment"
import { getViewerRole } from "@/lib/services/queries/member"
import { canAccess, orgIdForTask } from "@/lib/services/authz"
import z from "zod"

export async function addComment(unsafeData: z.infer<typeof addCommentSchema>) {
  const { success, data } = addCommentSchema.safeParse(unsafeData)
  const user = await getCurrentUser()

  if (!user) {
    return { error: true, message: "User is not authenticated" }
  }

  if (!success) {
    return { error: true, message: "Invalid comment data" }
  }

  const orgId = await orgIdForTask(data.task_id)
  if (!orgId) {
    return { error: true, message: "Task not found" }
  }
  const role = await getViewerRole(orgId)
  if (!canAccess(role)) {
    return { error: true, message: "You do not have access to this task" }
  }

  const supabase = await createClient()

  const { data: comment, error } = await supabase
    .from("task_comment")
    .insert({
      task_id: data.task_id,
      author_id: user.id,
      text: data.text,
    })
    .select("*, author:author_id(id, name, image_url)")
    .single()

  if (error) {
    return { error: true, message: "Failed to add comment" }
  }

  return { error: false, data: comment }
}
