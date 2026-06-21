import * as React from "react"
import { Task, TaskComment } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { addComment } from "@/lib/services/actions/comment"

// Loads a task's comments, streams in others' comments live (ours show
// optimistically), and posts new comments with optimistic insert + rollback.
export function useTaskComments({
  task,
  open,
  user,
  profile,
}: {
  task: Task | null
  open: boolean
  user: { id: string } | null
  profile: { name: string | null; image_url: string | null } | null
}) {
  const [comments, setComments] = React.useState<TaskComment[]>([])
  const [text, setText] = React.useState("")
  const [posting, setPosting] = React.useState(false)

  React.useEffect(() => {
    if (!open || !task) return
    let cancel = false
    const supabase = createClient()
    const taskId = task.id
    const currentUserId = user?.id

    const loadComments = () => {
      supabase
        .from("task_comment")
        .select("*, author:author_id(id, name, image_url)")
        .eq("task_id", taskId)
        .order("created_at", { ascending: true })
        .then(({ data }) => {
          if (!cancel) setComments((data as TaskComment[]) ?? [])
        })
    }

    loadComments()

    // stream in others' comments live (ours show optimistically)
    const channel = supabase
      .channel(`task:${taskId}:comments`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "task_comment",
          filter: `task_id=eq.${taskId}`,
        },
        (payload) => {
          const authorId = (payload.new as Record<string, unknown>)?.author_id
          if (authorId && authorId !== currentUserId) loadComments()
        }
      )
      .subscribe()

    return () => {
      cancel = true
      channel.unsubscribe()
    }
  }, [open, task, user?.id])

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    const value = text.trim()
    if (!value || !task || posting) return
    setPosting(true)
    const optimistic: TaskComment = {
      id: `optimistic-${Date.now()}`,
      task_id: task.id,
      author_id: user?.id ?? "",
      text: value,
      created_at: new Date().toISOString(),
      author: {
        id: user?.id ?? "",
        name: profile?.name ?? "You",
        image_url: profile?.image_url ?? null,
      },
    }
    setComments((c) => [...c, optimistic])
    setText("")
    const result = await addComment({ task_id: task.id, text: value })
    if (!result.error && result.data) {
      setComments((c) =>
        c.map((m) => (m.id === optimistic.id ? (result.data as TaskComment) : m))
      )
    } else {
      setComments((c) => c.filter((m) => m.id !== optimistic.id))
    }
    setPosting(false)
  }

  return { comments, text, setText, posting, submitComment }
}
