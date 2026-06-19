import z from "zod"

export const createChatRoomSchema = z.object({
    name: z.string().trim().min(1, { message: "Room name is required" }).max(100, { message: "Room name is too long" }),
    org_id: z.string().uuid({ message: "Organization ID is required" }),
    member_ids: z.array(z.string().uuid()).default([]),
})

export const addChatRoomMembersSchema = z.object({
    chat_room_id: z.string().uuid({ message: "Chat room ID is required" }),
    member_ids: z
        .array(z.string().uuid())
        .min(1, { message: "At least one member is required" }),
})

export const sendMessageSchema = z.object({
    chat_room_id: z.string().uuid({ message: "Chat room ID is required" }),
    text: z.string().trim().min(1, { message: "Message cannot be empty" }).max(4000, { message: "Message is too long" }),
})
