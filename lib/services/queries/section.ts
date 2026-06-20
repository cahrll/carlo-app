import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "./current-user"

export async function getSections(boardId: string) {
    const user = await getCurrentUser()

    if(!user) {
        return { error: true, message: 'User is not authenticated'}
    }

    if(!boardId.trim()) {
        return { error: true, message: 'Board ID cannot be empty'}
    }
    const supabase = await createClient()
    const {data, error} = await supabase
        .from('section')
        .select('*')
        .eq('board_id', boardId)
        .order('sort_order', { ascending: true })

    if(error) {
        return { error: true, message: 'Failed to get sections'}
    }

    return { error: false, data}
}
