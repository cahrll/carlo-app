'use server'

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/server"
import { getCurrentUser } from "../getCurrentUser"
import z from "zod"
import { createBoardSchema, updateBoardSchema } from "@/lib/schemas/board"

const DEFAULT_SECTIONS = [
    { title: 'To Do', sort_order: 0 },
    { title: 'In Progress', sort_order: 1 },
    { title: 'Testing', sort_order: 2 },
    { title: 'Done', sort_order: 3 },
]

export async function createBoardWithSections(unsafeData: z.infer<typeof createBoardSchema>) {
    const {success, data} = createBoardSchema.safeParse(unsafeData)
    const user = await getCurrentUser()

    if(!user) {
        return { error: true, message: 'User is not authenticated'}
    }
    
    if(!success) {
        return { error: true, message: 'Invalid board data'}
    }

    const supabase = await createClient()
    const {data: board, error} = await supabase
        .from('board')
        .insert({
            title: data.title,
            description: data.description,
            creator_id: user.id,
            org_id: data.org_id,
        })
        .select('*, user_profile:creator_id(name)')
        .single()
    
    if(error) {
        return { error: true, message: 'Failed to create board'}
    }

    const defaultSections = DEFAULT_SECTIONS.map(section => ({
        ...section,
        board_id: board.id,
        creator_id: user.id,
    }))

    await supabase.from('section').insert(defaultSections)

    revalidatePath(`/organization/${data.org_id}`)
    return { 
        error: false, 
        board: {
            ...board,
            creator_name: board.user_profile?.name,
            user_profile: undefined,
        }
    }
}

export async function updateBoard(id: string, unsafeData: z.infer<typeof updateBoardSchema>) {
    const { success, data } = updateBoardSchema.safeParse(unsafeData)
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!id.trim()) {
        return { error: true, message: 'Board ID cannot be empty' }
    }

    if (!success) {
        return { error: true, message: 'Invalid board data' }
    }

    const supabase = await createClient()
    
    const { data: existingBoard, error: fetchError } = await supabase
        .from('board')
        .select('org_id')
        .eq('id', id)
        .single()

    if (fetchError || !existingBoard) {
        return { error: true, message: 'Board not found' }
    }

    const { data: board, error } = await supabase
        .from('board')
        .update({
            title: data.title,
            description: data.description,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single()

    if (error) {
        return { error: true, message: 'Failed to update board' }
    }

    revalidatePath(`/organization/${existingBoard.org_id}/board/${id}`)
    return { error: false, data: board }
}

export async function deleteBoard(id: string) {
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!id.trim()) {
        return { error: true, message: 'Board ID cannot be empty' }
    }

    const supabase = await createClient()

    const { data: existingBoard, error: fetchError } = await supabase
        .from('board')
        .select('org_id')
        .eq('id', id)
        .single()

    if (fetchError || !existingBoard) {
        return { error: true, message: 'Board not found' }
    }

    // no FK cascade: delete tasks -> sections -> board
    const { data: sections } = await supabase
        .from('section')
        .select('id')
        .eq('board_id', id)
    const sectionIds = (sections ?? []).map((s) => s.id)

    if (sectionIds.length > 0) {
        const { error: taskError } = await supabase
            .from('task')
            .delete()
            .in('section_id', sectionIds)

        if (taskError) {
            return { error: true, message: 'Failed to delete board tasks' }
        }
    }

    const { error: sectionError } = await supabase
        .from('section')
        .delete()
        .eq('board_id', id)

    if (sectionError) {
        return { error: true, message: 'Failed to delete board sections' }
    }

    const { error } = await supabase
        .from('board')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: true, message: 'Failed to delete board' }
    }

    revalidatePath(`/organization/${existingBoard.org_id}`)
    return { error: false }
}