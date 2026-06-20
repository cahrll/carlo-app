'use server'
import { getCurrentUser } from "../queries/current-user";
import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema } from "@/lib/schemas/profile";
import z from "zod";

export async function setupProfile(name: string) {
    const user = await getCurrentUser()

    if(!user) {
        return { error: true, message: 'User is not authenticated'}
    }

    if(!name.trim()){
        return { error: true, message: 'Name cannot be empty'}
    }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('user_profile')
        .update({name})
        .eq('id', user.id)
        .select()
        .single()

    if(error){
        return {error: true, message: `Failed to setup profile`}
    }

    return { error: false, data }
}

export async function updateProfile(unsafeData: z.infer<typeof updateProfileSchema>) {
    const { success, data } = updateProfileSchema.safeParse(unsafeData)
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!success) {
        return { error: true, message: 'Invalid profile data' }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('user_profile')
        .update({ name: data.name })
        .eq('id', user.id)

    if (error) {
        return { error: true, message: 'Failed to update profile' }
    }

    return { error: false, message: 'Profile updated successfully' }
}