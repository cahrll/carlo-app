import { cache } from "react"
import { getCurrentUser } from "./current-user"
import { createClient } from "@/lib/supabase/server"

export async function getOrganizations() {
    const user = await getCurrentUser()

    if(!user) {
        return { error: true, message: 'User is not authenticated'}
    }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('organization')
        .select('*')
        .order('created_at', { ascending: false })

    if(error) {
        return { error: true, message: 'Failed to get organizations'}
    }

    return { error: false, data}
}

export const getOrganizationById = cache(async (id: string) => {
    const user = await getCurrentUser()

    if(!user) {
        return { error: true, message: 'User is not authenticated'}
    }

    if(!id.trim()) {
        return { error: true, message: 'Id cannot be empty'}
    }

    const supabase = await createClient()
    const {data, error} = await supabase
        .from('organization')
        .select('*')
        .eq('id', id)
        .single()

    if(error) {
        return { error: true, message: 'Failed to get organization'}
    }

    return { error: false, data}
})
