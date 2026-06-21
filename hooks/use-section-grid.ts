import { useCallback, useEffect, useOptimistic, useRef, useState, useTransition } from 'react'
import { Board, SectionWithTasks, Task } from '@/lib/types'
import { useAuth } from '@/context/auth-context'
import { useDeletions } from '@/context/deletions-context'
import { createSection, deleteSection } from '@/lib/services/actions/section'
import { createSectionSchema } from '@/lib/schemas/section'
import { createTaskSchema } from '@/lib/schemas/task'
import { createTask, moveTask } from '@/lib/services/actions/task'
import { useBoardRealtime } from '@/hooks/use-board-realtime'
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
    const { hide, unhide, hidden } = useDeletions()
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

    useBoardRealtime({
        boardId: board.id,
        onSections: setSections,
        onBoard: setCurrentBoard,
        sectionIdsRef,
        taskIdsRef,
    })

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

    const handleDeleteSection = async (sectionId: string) => {
        hide(sectionId)
        const result = await deleteSection(sectionId)
        if (result.error) unhide(sectionId)
        return result
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

    const visibleSections = optimisticSections.filter(s => !hidden.has(s.id))

    return {
        currentBoard,
        setCurrentBoard,
        optimisticSections: visibleSections,
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
