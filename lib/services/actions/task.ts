'use server'
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/server"
import { getCurrentUser } from "../getCurrentUser"
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from "@/lib/schemas/task"
import { getViewerRole } from "@/lib/services/queries/member"
import { canAccess, orgIdForSection, orgIdForTask } from "@/lib/services/authz"
import z from "zod"

const BOARD_PATH = '/organization/[orgId]/board/[boardId]'

export async function createTask(unsafeData: z.infer<typeof createTaskSchema>) {
    const {success, data} = createTaskSchema.safeParse(unsafeData)
    const user = await getCurrentUser()

    if(!user) {
        return { error: true, message: 'User is not authenticated'}
    }

    if(!success) {
        return { error: true, message: 'Invalid task data'}
    }

    const orgId = await orgIdForSection(data.section_id)
    if (!orgId) {
        return { error: true, message: 'Section not found' }
    }
    const role = await getViewerRole(orgId)
    if (!canAccess(role)) {
        return { error: true, message: 'You do not have access to this board' }
    }

    const supabase = await createClient()
    const {data: task, error} = await supabase
        .from('task')
        .insert({
            title: data.title,
            description: data.description,
            section_id: data.section_id,
            sort_order: data.sort_order,
            creator_id: user.id,
            due_date: data.due_date,
            assignee_id: data.assignee_id || null,
            priority: data.priority,
        })
        .select('*, creator:creator_id(name), assignee:assignee_id(name)')
        .single()

    if(error) {
        return { error: true, message: `Failed to create task: ${error.message}`}
    }

    revalidatePath(BOARD_PATH, 'page')
    return { 
        error: false, 
        task: {
            ...task,
            creator_name: task.creator?.name,
            assignee_name: task.assignee?.name,
            creator: undefined,
            assignee: undefined,
        }
    }
}

export async function updateTask(id: string, unsafeData: z.infer<typeof updateTaskSchema>) {
    const { success, data } = updateTaskSchema.safeParse(unsafeData)
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!id.trim()) {
        return { error: true, message: 'Task ID cannot be empty' }
    }

    if (!success) {
        return { error: true, message: 'Invalid task data' }
    }

    const orgId = await orgIdForTask(id)
    if (!orgId) {
        return { error: true, message: 'Task not found' }
    }
    const role = await getViewerRole(orgId)
    if (!canAccess(role)) {
        return { error: true, message: 'You do not have access to this task' }
    }

    const supabase = await createClient()

    const { data: task, error } = await supabase
        .from('task')
        .update({
            title: data.title,
            description: data.description,
            due_date: data.due_date,
            assignee_id: data.assignee_id || null,
            priority: data.priority,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*, creator:creator_id(name), assignee:assignee_id(name)')
        .single()

    if (error) {
        return { error: true, message: 'Failed to update task' }
    }

    revalidatePath(BOARD_PATH, 'page')
    return { 
        error: false, 
        data: {
            ...task,
            creator_name: task.creator?.name,
            assignee_name: task.assignee?.name,
            creator: undefined,
            assignee: undefined,
        }
    }
}

export async function moveTask(unsafeData: z.infer<typeof moveTaskSchema>) {
    const { success, data } = moveTaskSchema.safeParse(unsafeData)
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!success) {
        return { error: true, message: 'Invalid move task data' }
    }

    const orgId = await orgIdForSection(data.targetSectionId)
    if (!orgId) {
        return { error: true, message: 'Section not found' }
    }
    const role = await getViewerRole(orgId)
    if (!canAccess(role)) {
        return { error: true, message: 'You do not have access to this board' }
    }

    const supabase = await createClient()

    const { error: moveError } = await supabase
        .from('task')
        .update({ section_id: data.targetSectionId, updated_at: new Date().toISOString() })
        .eq('id', data.taskId)

    if (moveError) {
        return { error: true, message: 'Failed to move task' }
    }

    const reorderSection = async (sectionId: string, taskIds: string[]) => {
        const results = await Promise.all(
            taskIds.map((id, i) =>
                supabase
                    .from('task')
                    .update({ sort_order: taskIds.length - 1 - i })
                    .eq('id', id)
                    .eq('section_id', sectionId)
            )
        )

        if (results.some((r) => r.error)) {
            return { error: true, message: 'Failed to reorder tasks' }
        }
        return null
    }

    const targetError = await reorderSection(data.targetSectionId, data.targetSectionTaskIds)
    if (targetError) return targetError

    if (data.sourceSectionId && data.sourceSectionTaskIds) {
        const sourceError = await reorderSection(data.sourceSectionId, data.sourceSectionTaskIds)
        if (sourceError) return sourceError
    }

    revalidatePath(BOARD_PATH, 'page')
    return { error: false, message: 'Task moved successfully' }
}