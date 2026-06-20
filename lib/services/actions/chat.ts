'use server'

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/server"
import { getCurrentUser } from "../getCurrentUser"
import { createChatRoomSchema, addChatRoomMembersSchema, sendMessageSchema } from "@/lib/schemas/chat"
import { getViewerRole } from "@/lib/services/queries/member"
import { canAccess, orgIdForChatRoom } from "@/lib/services/authz"
import z from "zod"

export async function createChatRoom(unsafeData: z.infer<typeof createChatRoomSchema>) {
    const { success, data } = createChatRoomSchema.safeParse(unsafeData)
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!success) {
        return { error: true, message: 'Invalid chat room data' }
    }

    const role = await getViewerRole(data.org_id)
    if (!canAccess(role)) {
        return { error: true, message: 'You do not have access to this organization' }
    }

    const supabase = await createClient()

    const { data: roomId, error } = await supabase.rpc('create_chat_room', {
        p_org_id: data.org_id,
        p_name: data.name,
        p_member_ids: data.member_ids,
    })

    if (error) {
        return { error: true, message: `Failed to create chat room: ${error.message}` }
    }

    revalidatePath(`/organization/${data.org_id}/inbox`)
    return { error: false, data: { id: roomId } }
}

export async function addChatRoomMembers(unsafeData: z.infer<typeof addChatRoomMembersSchema>) {
    const { success, data } = addChatRoomMembersSchema.safeParse(unsafeData)
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!success) {
        return { error: true, message: 'Invalid data' }
    }

    const supabase = await createClient()

    const { error } = await supabase.rpc('add_chat_room_members', {
        p_chat_room_id: data.chat_room_id,
        p_member_ids: data.member_ids,
    })

    if (error) {
        return { error: true, message: `Failed to add members: ${error.message}` }
    }

    revalidatePath(`/organization`)
    return { error: false, message: 'Members added successfully' }
}

export async function deleteChatRoom(chatRoomId: string) {
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!chatRoomId.trim()) {
        return { error: true, message: 'Chat room ID cannot be empty' }
    }

    const supabase = await createClient()

    const { data: room } = await supabase
        .from('chat_room')
        .select('org_id')
        .eq('id', chatRoomId)
        .single()

    const { error } = await supabase.rpc('delete_chat_room', {
        p_chat_room_id: chatRoomId,
    })

    if (error) {
        return { error: true, message: `Failed to delete chat room: ${error.message}` }
    }

    if (room?.org_id) {
        revalidatePath(`/organization/${room.org_id}/inbox`)
    }

    return { error: false }
}

export async function sendMessage(unsafeData: z.infer<typeof sendMessageSchema>) {
    const { success, data } = sendMessageSchema.safeParse(unsafeData)
    const user = await getCurrentUser()

    if (!user) {
        return { error: true, message: 'User is not authenticated' }
    }

    if (!success) {
        return { error: true, message: 'Invalid message data' }
    }

    const orgId = await orgIdForChatRoom(data.chat_room_id)
    if (!orgId) {
        return { error: true, message: 'Conversation not found' }
    }
    const role = await getViewerRole(orgId)
    if (!canAccess(role)) {
        return { error: true, message: 'You do not have access to this conversation' }
    }

    const supabase = await createClient()

    const { data: message, error } = await supabase
        .from('message')
        .insert({
            chat_room_id: data.chat_room_id,
            author_id: user.id,
            text: data.text,
        })
        .select('*, author:author_id(id, name, image_url)')
        .single()

    if (error) {
        return { error: true, message: 'Failed to send message' }
    }

    return { error: false, data: message }
}
