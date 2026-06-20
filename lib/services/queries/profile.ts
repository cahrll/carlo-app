import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "./current-user"

export const getProfile = cache(async (id: string) => {
    const user = await getCurrentUser()

    if(!user) {
        return { error: true, message: 'User is not authenticated'}
    }

    if(!id.trim()){
        return { error: true, message: 'Id cannot be empty'}
    }

    const supabase = await createClient()

    const { data, error } = await supabase
    .from("user_profile")
    .select("*")
    .eq("id", id)
    .single()

    if(error){
        return {error: true, message: 'Failed to get profile details'}
    }

    return {error: false, data}
})

export async function getAllProfiles() {
    const user = await getCurrentUser()

    if(!user) {
        return { error: true, message: 'User is not authenticated'}
    }

    const supabase = await createClient()
    const { data, error } = await supabase.from('user_profile').select('*')
    
    if(error){
        return { error: true, message: 'Failed to get all profiles'}
    }

    return { error: false, data}
}
