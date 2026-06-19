import z from "zod"

export const addCommentSchema = z.object({
  task_id: z.string().min(1, "Task is required"),
  text: z.string().trim().min(1, "Comment cannot be empty"),
})
