import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "./current-user"

export const getChatRooms = cache(async (orgId: string) => {
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!orgId.trim()) {
        return { error: true, message: 'Organization ID cannot be empty' }
    }

    const supabase = await createClient()

    const { data: memberRooms, error: memberError } = await supabase
        .from('chat_room_member')
        .select('chat_room_id')
        .eq('member_id', user.id)

    if (memberError) {
        return { error: true, message: 'Failed to get chat rooms' }
    }

    const roomIds = memberRooms.map(r => r.chat_room_id)

    if (roomIds.length === 0) {
        return { error: false, data: [] }
    }

    const { data: rooms, error } = await supabase
        .from('chat_room')
        .select(`
            *,
            members:chat_room_member(
                member_id,
                role,
                user_profile:member_id(id, name, image_url)
            )
        `)
        .eq('org_id', orgId)
        .in('id', roomIds)
        .order('created_at', { ascending: false })

    if (error) {
        return { error: true, message: 'Failed to get chat rooms' }
    }

    const roomsWithLatest = await Promise.all(
        (rooms ?? []).map(async (room) => {
            const { data: latestMessages } = await supabase
                .from('message')
                .select('text, created_at, author:author_id(id, name)')
                .eq('chat_room_id', room.id)
                .order('created_at', { ascending: false })
                .limit(1)

            return {
                ...room,
                latest_message: latestMessages?.[0] ?? null,
            }
        })
    )

    roomsWithLatest.sort((a, b) => {
        const aTime = a.latest_message?.created_at ?? a.created_at
        const bTime = b.latest_message?.created_at ?? b.created_at
        return new Date(bTime).getTime() - new Date(aTime).getTime()
    })

    return { error: false, data: roomsWithLatest }
})

export async function getMessages(chatRoomId: string) {
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!chatRoomId.trim()) {
        return { error: true, message: 'Chat room ID cannot be empty' }
    }

    const supabase = await createClient()

    const { data: membership } = await supabase
        .from('chat_room_member')
        .select('member_id')
        .eq('chat_room_id', chatRoomId)
        .eq('member_id', user.id)
        .single()

    if (!membership) {
        return { error: true, message: 'You are not a member of this chat room' }
    }

    const { data, error } = await supabase
        .from('message')
        .select('*, author:author_id(id, name, image_url)')
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: true })

    if (error) {
        return { error: true, message: 'Failed to get messages' }
    }

    return { error: false, data }
}

export async function getChatRoom(chatRoomId: string) {
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('chat_room')
        .select(`
            *,
            members:chat_room_member(
                member_id,
                role,
                user_profile:member_id(id, name, image_url)
            )
        `)
        .eq('id', chatRoomId)
        .single()

    if (error) {
        return { error: true, message: 'Chat room not found' }
    }

    return { error: false, data }
}
