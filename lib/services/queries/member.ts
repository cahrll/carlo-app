import { cache } from "react"
import { createClient } from "@/lib/server"
import { getCurrentUser } from "../getCurrentUser"

export type ViewerRole = "owner" | "admin" | "member"

export const getViewerRole = cache(async (
    organizationId: string
): Promise<ViewerRole | null> => {
    const user = await getCurrentUser()
    if (!user || !organizationId.trim()) return null

    const supabase = await createClient()

    const [{ data: org }, { data: membership }] = await Promise.all([
        supabase
            .from('organization')
            .select('owner_id')
            .eq('id', organizationId)
            .single(),
        supabase
            .from('organization_member')
            .select('role')
            .eq('org_id', organizationId)
            .eq('member_id', user.id)
            .eq('status', 'accepted')
            .single(),
    ])

    if (org?.owner_id === user.id) return 'owner'

    return (membership?.role as ViewerRole) ?? null
})

export const getMembers = cache(async (organizationId: string) => {
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!organizationId.trim()) {
        return { error: true, message: 'Organization ID cannot be empty' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('organization_member')
        .select('*, user_profile:member_id(id, name, image_url)')
        .eq('org_id', organizationId)
        .order('created_at', { ascending: true })

    if (error) {
        return { error: true, message: 'Failed to get members' }
    }

    return { error: false, data }
})

