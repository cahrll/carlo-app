'use server'

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "../getCurrentUser"
import { getViewerRole } from "@/lib/services/queries/member"
import { createClient } from "@/lib/server"
import { createInvitationSchema } from "@/lib/schemas/invitation"
import z from "zod"

export async function createInvitation(organizationId: string, unsafeData: z.infer<typeof createInvitationSchema>) {
    const { success, data } = createInvitationSchema.safeParse(unsafeData)
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!organizationId.trim()) {
        return { error: true, message: 'Organization ID cannot be empty' }
    }

    if (!success) {
        return { error: true, message: 'Invalid invitation data' }
    }

    const role = await getViewerRole(organizationId)
    if (role !== 'owner' && role !== 'admin') {
        return { error: true, message: 'You do not have permission to invite members' }
    }

    const supabase = await createClient()

    const { data: existing } = await supabase
        .from("organization_invitation")
        .select("id")
        .eq("org_id", organizationId)
        .eq("email", data.email.toLowerCase())
        .eq("status", "pending")
        .single()

    if (existing) {
        return { error: true, message: 'An invitation has already been sent to this email' }
    }

    const { error } = await supabase.from("organization_invitation").insert({
        org_id: organizationId,
        email: data.email.toLowerCase(),
        role: data.role,
        invited_by: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    })

    if (error) {
        return { error: true, message: `Failed to create invitation: ${error.message}` }
    }

    revalidatePath(`/organization/${organizationId}/members`)
    return { error: false, message: 'Invitation sent successfully' }
}

export async function acceptInvitation(invitationId: string) {
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!invitationId.trim()) {
        return { error: true, message: 'Invitation ID cannot be empty' }
    }

    const supabase = await createClient()

    const { error } = await supabase.rpc('accept_organization_invitation', {
        invitation_id: invitationId,
    })

    if (error) {
        return { error: true, message: error.message }
    }

    revalidatePath('/invites')
    return { error: false, message: 'Invitation accepted successfully' }
}
