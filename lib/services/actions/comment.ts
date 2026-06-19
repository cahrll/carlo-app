"use server"

import { createClient } from "@/lib/server"
import { getCurrentUser } from "../getCurrentUser"
import { addCommentSchema } from "@/lib/schemas/comment"
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
