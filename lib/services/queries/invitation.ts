import { createClient } from "@/lib/server"
import { getCurrentUser } from "../getCurrentUser"

export async function getInvitationsByOrg(organizationId: string) {
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!organizationId.trim()) {
        return { error: true, message: 'Organization ID cannot be empty' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('organization_invitation')
        .select('*, invited_by_profile:invited_by(id, name, image_url)')
        .eq('org_id', organizationId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    if (error) {
        return { error: true, message: 'Failed to get invitations' }
    }

    return { error: false, data }
}

type UserInvitationRow = {
    id: string
    org_id: string
    email: string
    role: string
    status: string
    invited_by: string
    created_at: string
    accepted_at: string | null
    expires_at: string | null
    organization_id: string
    organization_name: string
}

export async function getInvitationsByUser() {
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    const supabase = await createClient()
    // SECURITY DEFINER RPC: returns only the caller's own pending invites + org
    // name, so invitees never get read access to the organization row itself
    const { data, error } = await supabase.rpc('get_user_invitations')

    if (error) {
        return { error: true, message: 'Failed to get invitations' }
    }

    const invitations = ((data ?? []) as UserInvitationRow[]).map((row) => ({
        id: row.id,
        org_id: row.org_id,
        email: row.email,
        role: row.role,
        status: row.status,
        invited_by: row.invited_by,
        created_at: row.created_at,
        accepted_at: row.accepted_at,
        expires_at: row.expires_at,
        organization: { id: row.organization_id, name: row.organization_name },
    }))

    return { error: false, data: invitations }
}
