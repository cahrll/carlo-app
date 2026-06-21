import { useEffect, type RefObject } from 'react'
import { Board, SectionWithTasks, Task } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

// Subscribes to a board's realtime changes (board / section / task / task_comment)
// and reconciles by refetching the board's sections + tasks (debounced).
export function useBoardRealtime({
    boardId,
    onSections,
    onBoard,
    sectionIdsRef,
    taskIdsRef,
}: {
    boardId: string
    onSections: (sections: SectionWithTasks[]) => void
    onBoard: (board: Board) => void
    sectionIdsRef: RefObject<Set<string>>
    taskIdsRef: RefObject<Set<string>>
}) {
    useEffect(() => {
        const supabase = createClient()

        const fetchSectionsWithTasks = async () => {
            const taskBaseSelect =
                '*, creator:creator_id(name), assignee:assignee_id(name), section:section_id!inner(board_id)'

            // comment-count aggregate, fall back if absent
            const fetchTasks = async () => {
                const withCount = await supabase
                    .from('task')
                    .select(`${taskBaseSelect}, task_comment(count)`)
                    .eq('section.board_id', boardId)
                    .order('sort_order', { ascending: false })
                if (!withCount.error) return withCount
                return supabase
                    .from('task')
                    .select(taskBaseSelect)
                    .eq('section.board_id', boardId)
                    .order('sort_order', { ascending: false })
            }

            const [sectionsResult, tasksResult] = await Promise.all([
                supabase
                    .from('section')
                    .select('*')
                    .eq('board_id', boardId)
                    .order('sort_order', { ascending: true }),
                fetchTasks()
            ])

            if (sectionsResult.error || tasksResult.error) return

            const tasks: Task[] = tasksResult.data.map(task => ({
                ...task,
                creator_name: task.creator?.name,
                assignee_name: task.assignee?.name,
                comment_count: Array.isArray(task.task_comment)
                    ? task.task_comment[0]?.count
                    : undefined,
                creator: undefined,
                assignee: undefined,
                section: undefined,
                task_comment: undefined,
            }))

            const tasksBySection = tasks.reduce((acc, task) => {
                if (!acc[task.section_id]) acc[task.section_id] = []
                acc[task.section_id].push(task)
                return acc
            }, {} as Record<string, Task[]>)

            onSections(sectionsResult.data.map(section => ({
                ...section,
                tasks: tasksBySection[section.id] || []
            })))
        }

        let debounce: ReturnType<typeof setTimeout> | null = null
        const scheduleFetch = () => {
            if (debounce) clearTimeout(debounce)
            debounce = setTimeout(fetchSectionsWithTasks, 150)
        }

        const channel = supabase
            .channel(`board:${boardId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'board',
                filter: `id=eq.${boardId}`
            }, async () => {
                const { data, error } = await supabase
                    .from('board')
                    .select('*')
                    .eq('id', boardId)
                    .single()
                if (!error && data) onBoard(data)
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'section',
                filter: `board_id=eq.${boardId}`
            }, () => {
                scheduleFetch()
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'task',
            }, (payload) => {
                const sectionId =
                    (payload.new as Record<string, unknown>)?.section_id ??
                    (payload.old as Record<string, unknown>)?.section_id
                if (!sectionId || sectionIdsRef.current.has(sectionId as string)) {
                    scheduleFetch()
                }
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'task_comment',
            }, (payload) => {
                // no board_id on task_comment, scope by task id
                const taskId =
                    (payload.new as Record<string, unknown>)?.task_id ??
                    (payload.old as Record<string, unknown>)?.task_id
                if (taskId && taskIdsRef.current.has(taskId as string)) {
                    scheduleFetch()
                }
            })
            .subscribe()

        return () => {
            if (debounce) clearTimeout(debounce)
            channel.unsubscribe()
        }
    }, [boardId, onSections, onBoard, sectionIdsRef, taskIdsRef])
}
