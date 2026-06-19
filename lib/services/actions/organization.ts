'use server'

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "../getCurrentUser"
import { createOrganizationSchema, updateOrganizationSchema } from "@/lib/schemas/organizations"
import { createClient } from "@/lib/server"
import z from "zod"

export async function createOrganization(unsafeData: z.infer<typeof createOrganizationSchema>) {
    const {success, data} = createOrganizationSchema.safeParse(unsafeData)
    const user = await getCurrentUser()

    const supabase = await createClient()

    if(!success){
        return {error: true, message: "Invalid organization data"}
    }

    if(!user) {
        return { error: true, message: 'User is not authenticated'}
    }

    
    const {data: organization, error} = await supabase
        .from('organization')
        .insert({
            name: data.name,
            owner_id: user.id,
        })
        .select()
        .single()

    if(error) {
        return { error: true, message: `Failed to create organization: ${error.message}`}
    }

    const { error: memberError } = await supabase
        .from('organization_member')
        .insert({
            org_id: organization.id,
            member_id: user.id,
            role: 'owner',
            status: 'accepted',
        })

    if (memberError) {
        await supabase.from('organization').delete().eq('id', organization.id)
        return { error: true, message: `Failed to add owner as member: ${memberError.message}` }
    }

    revalidatePath(`/`)
    return { error: false, organization}
}

export async function updateOrganization(id: string, unsafeData: z.infer<typeof updateOrganizationSchema>) {
    const { success, data } = updateOrganizationSchema.safeParse(unsafeData)
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!id.trim()) {
        return { error: true, message: 'Organization ID cannot be empty' }
    }

    if (!success) {
        return { error: true, message: 'Invalid organization data' }
    }

    const supabase = await createClient()

    const { data: organization, error } = await supabase
        .from('organization')
        .update({ name: data.name })
        .eq('id', id)
        .eq('owner_id', user.id)
        .select()
        .single()

    if (error) {
        return { error: true, message: 'Failed to update organization' }
    }

    revalidatePath(`/organization/${id}`)
    return { error: false, organization }
}

export async function deleteOrganization(id: string) {
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!id.trim()) {
        return { error: true, message: 'Organization ID cannot be empty' }
    }

    const supabase = await createClient()

    const { error } = await supabase.rpc('delete_organization', {
        p_org_id: id,
    })

    if (error) {
        return { error: true, message: `Failed to delete organization: ${error.message}` }
    }

    revalidatePath(`/`)
    return { error: false }
}