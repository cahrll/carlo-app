import { createClient } from "@/lib/server"
import { getCurrentUser } from "../getCurrentUser"
import { computeBoardProgress, newerTime } from "@/lib/board-ui"

export async function getBoards(orgId: string) {
    const user = await getCurrentUser()

    if(!user) {
        return { error: true, message: 'User is not authenticated'}
    }

    if(!orgId.trim()) {
        return { error: true, message: 'Organization ID cannot be empty'}
    }

    const supabase = await createClient()

    // counts embed, fall back to basic select
    const withCounts = await supabase
        .from('board')
        .select('*, user_profile:creator_id(name), section(title, task(updated_at))')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

    const { data, error } = withCounts.error
        ? await supabase
            .from('board')
            .select('*, user_profile:creator_id(name)')
            .eq('org_id', orgId)
            .order('created_at', { ascending: false })
        : withCounts

    if(error) {
        return { error: true, message: 'Failed to get boards'}
    }

    const boards = data.map(board => {
        const sections = (board as { section?: Parameters<typeof computeBoardProgress>[0] }).section
        const { total, done, lastActivity } = computeBoardProgress(sections)
        return {
            ...board,
            creator_name: board.user_profile?.name,
            task_count: total,
            done_count: done,
            updated_at: newerTime(board.updated_at, lastActivity),
            user_profile: undefined,
            section: undefined,
        }
    })

    return { error: false, data: boards}
}

export async function getBoardById(id: string) {
    const user = await getCurrentUser()

    if(!user) {
        return { error: true, message: 'User is not authenticated'}
    }
    
    if(!id.trim()) {
        return { error: true, message: 'Id cannot be empty'}
    }

    const supabase = await createClient()
    const {data, error} = await supabase
        .from('board')
        .select('*')
        .eq('id', id)
        .single()
    
    if(error) {
        return { error: true, message: 'Failed to get board'}
    }

    return { error: false, data}
}
