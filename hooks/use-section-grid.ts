import { useCallback, useEffect, useOptimistic, useRef, useState, useTransition } from 'react'
import { Board, SectionWithTasks, Task } from '@/lib/types'
import { useAuth } from '@/context/auth-context'
import { createSection, deleteSection } from '@/lib/services/actions/section'
import { createSectionSchema } from '@/lib/schemas/section'
import { createTaskSchema } from '@/lib/schemas/task'
import { createTask, moveTask } from '@/lib/services/actions/task'
import { createClient } from '@/lib/client'
import z from 'zod'
import {
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'

type SectionFormData = z.infer<typeof createSectionSchema>
type TaskFormData = z.infer<typeof createTaskSchema>

const getRealTaskIds = (tasks: Task[]) =>
    tasks.filter(t => !t.id.startsWith('optimistic-')).map(t => t.id)

const updateSection = (
    sections: SectionWithTasks[],
    sectionId: string,
    updater: (section: SectionWithTasks) => SectionWithTasks
) => sections.map(s => s.id === sectionId ? updater(s) : s)

export function useSectionGrid(board: Board, initialSections: SectionWithTasks[]) {
    const { user, profile } = useAuth()
    const [isPending, startTransition] = useTransition()
    const [currentBoard, setCurrentBoard] = useState(board)
    const [sections, setSections] = useState<SectionWithTasks[]>(initialSections)
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const [originalSectionId, setOriginalSectionId] = useState<string | null>(null)
    const [syncingTaskId, setSyncingTaskId] = useState<string | null>(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        setSections(initialSections)
    }, [initialSections])

    const sectionIdsRef = useRef<Set<string>>(new Set(initialSections.map(s => s.id)))
    const taskIdsRef = useRef<Set<string>>(
        new Set(initialSections.flatMap(s => s.tasks.map(t => t.id)))
    )

    useEffect(() => {
        sectionIdsRef.current = new Set(sections.map(s => s.id))
        taskIdsRef.current = new Set(sections.flatMap(s => s.tasks.map(t => t.id)))
    }, [sections])

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
                    .eq('section.board_id', board.id)
                    .order('sort_order', { ascending: false })
                if (!withCount.error) return withCount
                return supabase
                    .from('task')
                    .select(taskBaseSelect)
                    .eq('section.board_id', board.id)
                    .order('sort_order', { ascending: false })
            }

            const [sectionsResult, tasksResult] = await Promise.all([
                supabase
                    .from('section')
                    .select('*')
                    .eq('board_id', board.id)
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

            setSections(sectionsResult.data.map(section => ({
                ...section,
                tasks: tasksBySection[section.id] || []
            })))
        }

        const channel = supabase
            .channel(`board:${board.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'board',
                filter: `id=eq.${board.id}`
            }, async () => {
                const { data, error } = await supabase
                    .from('board')
                    .select('*')
                    .eq('id', board.id)
                    .single()
                if (!error && data) setCurrentBoard(data)
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'section',
                filter: `board_id=eq.${board.id}`
            }, () => {
                fetchSectionsWithTasks()
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
                    setTimeout(() => fetchSectionsWithTasks(), 100)
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
                    setTimeout(() => fetchSectionsWithTasks(), 100)
                }
            })
            .subscribe()

        return () => {
            channel.unsubscribe()
        }
    }, [board.id])

    const [optimisticSections, addOptimisticSection] = useOptimistic(
        sections,
        (state, newSection: SectionWithTasks) => [...state, newSection]
    )

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    const findSectionByTaskId = (taskId: string) =>
        sections.find(section => section.tasks.some(task => task.id === taskId))

    const handleCreateSection = (data: SectionFormData) => {
        const optimisticSection: SectionWithTasks = {
            id: `optimistic-${Date.now()}`,
            title: data.title,
            board_id: data.board_id,
            creator_id: data.creator_id,
            sort_order: data.sort_order,
            created_at: new Date().toISOString(),
            tasks: [],
        }

        startTransition(async () => {
            addOptimisticSection(optimisticSection)
            await createSection(data)
        })
    }

    const handleDeleteSection = (sectionId: string) => {
        const snapshot = sections
        // optimistic local removal; DELETE events lack board_id, others reconcile on refetch
        setSections(prev => prev.filter(s => s.id !== sectionId))
        startTransition(async () => {
            const result = await deleteSection(sectionId)
            if (result.error) setSections(snapshot)
        })
    }

    const handleCreateTask = useCallback((sectionId: string) => {
        return (data: TaskFormData) => {
            const optimisticId = `optimistic-${Date.now()}`
            const optimisticTask: Task = {
                id: optimisticId,
                title: data.title,
                description: data.description,
                section_id: data.section_id,
                sort_order: data.sort_order,
                creator_id: user?.id ?? '',
                creator_name: profile?.name,
                assignee_id: data.assignee_id,
                due_date: data.due_date?.toISOString(),
                priority: data.priority,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            setSections(prev => updateSection(prev, sectionId, s => ({
                ...s, tasks: [optimisticTask, ...s.tasks]
            })))

            startTransition(async () => {
                const result = await createTask(data)

                if (!result.error && result.task) {
                    setSections(prev => updateSection(prev, sectionId, s => ({
                        ...s,
                        tasks: s.tasks.map(t => t.id === optimisticId ? result.task as Task : t)
                    })))
                } else {
                    setSections(prev => updateSection(prev, sectionId, s => ({
                        ...s,
                        tasks: s.tasks.filter(t => t.id !== optimisticId)
                    })))
                }
            })
        }
    }, [user?.id, profile?.name])

    const handleDragStart = (event: DragStartEvent) => {
        const taskId = event.active.id as string
        const section = findSectionByTaskId(taskId)
        if (!section) return

        setOriginalSectionId(section.id)
        const task = section.tasks.find(t => t.id === taskId)
        if (task) setActiveTask(task)
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        const activeSection = findSectionByTaskId(activeId)
        if (!activeSection) return

        const overSection = findSectionByTaskId(overId) || sections.find(s => s.id === overId)
        if (!overSection) return

        if (activeSection.id === overSection.id) {
            const activeIndex = activeSection.tasks.findIndex(t => t.id === activeId)
            const overIndex = activeSection.tasks.findIndex(t => t.id === overId)

            if (activeIndex !== overIndex && overIndex !== -1) {
                setSections(prev => updateSection(prev, activeSection.id, s => ({
                    ...s, tasks: arrayMove(s.tasks, activeIndex, overIndex)
                })))
            }
        } else {
            const activeTask = activeSection.tasks.find(t => t.id === activeId)
            if (!activeTask) return

            const overIndex = overSection.tasks.findIndex(t => t.id === overId)
            const insertIndex = overIndex === -1 ? overSection.tasks.length : overIndex

            setSections(prev => prev.map(section => {
                if (section.id === activeSection.id) {
                    return { ...section, tasks: section.tasks.filter(t => t.id !== activeId) }
                }
                if (section.id === overSection.id) {
                    const newTasks = [...section.tasks]
                    newTasks.splice(insertIndex, 0, { ...activeTask, section_id: section.id })
                    return { ...section, tasks: newTasks }
                }
                return section
            }))
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveTask(null)

        if (!over) {
            setOriginalSectionId(null)
            return
        }

        const activeId = active.id as string
        const currentSection = findSectionByTaskId(activeId)

        if (!currentSection) {
            setOriginalSectionId(null)
            return
        }

        const isMovingToNewSection = originalSectionId !== null && originalSectionId !== currentSection.id
        const targetTaskIds = getRealTaskIds(currentSection.tasks)

        setSyncingTaskId(activeId)

        try {
            if (isMovingToNewSection && originalSectionId) {
                const originalSection = sections.find(s => s.id === originalSectionId)

                await moveTask({
                    taskId: activeId,
                    targetSectionId: currentSection.id,
                    targetSectionTaskIds: targetTaskIds,
                    sourceSectionId: originalSectionId,
                    sourceSectionTaskIds: originalSection ? getRealTaskIds(originalSection.tasks) : undefined,
                })
            } else if (targetTaskIds.length > 0) {
                await moveTask({
                    taskId: activeId,
                    targetSectionId: currentSection.id,
                    targetSectionTaskIds: targetTaskIds,
                })
            }
        } finally {
            setSyncingTaskId(null)
        }

        setOriginalSectionId(null)
    }

    return {
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
    }
}
