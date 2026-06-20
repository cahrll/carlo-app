import { createClient } from "@/lib/supabase/client"
import type { ChatMessage } from "@/lib/types"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { useEffect, useRef, useState, useCallback } from "react"

export function useRealtimeChat({
    userId,
    roomId,
}: {
    userId: string
    roomId: string
}) {
    const [connectedUsers, setConnectedUsers] = useState<number>(1)
    const [realtimeMessages, setRealtimeMessages] = useState<ChatMessage[]>([])
    const channelRef = useRef<RealtimeChannel | null>(null)

    useEffect(() => {
        const supabase = createClient()
        let cancel = false

        const channel = supabase.channel(`room:${roomId}:messages`, {
            config: {
                presence: {
                    key: userId,
                },
            },
        })

        channel
            .on("presence", { event: "sync" }, () => {
                setConnectedUsers(
                    Object.keys(channel.presenceState()).length
                )
            })
            .on("broadcast", { event: "INSERT" }, (payload) => {
                const record = payload.payload
                setRealtimeMessages((prev) => {
                    if (prev.some((m) => m.id === record.id)) return prev
                    return [
                        ...prev,
                        {
                            id: record.id,
                            chat_room_id: record.chat_room_id,
                            text: record.text,
                            created_at: record.created_at,
                            author_id: record.author_id,
                            author: {
                                id: record.author_id,
                                name: record.author_name,
                                image_url: record.author_image_url,
                            },
                        },
                    ]
                })
            })
            .subscribe((status) => {
                if (cancel) return
                if (status !== "SUBSCRIBED") return
                channel.track({ userId })
                channelRef.current = channel
            })

        return () => {
            cancel = true
            channelRef.current = null
            setRealtimeMessages([])
            channel.untrack()
            channel.unsubscribe()
        }
    }, [roomId, userId])

    const broadcast = useCallback((message: ChatMessage) => {
        channelRef.current?.send({
            type: "broadcast",
            event: "INSERT",
            payload: {
                id: message.id,
                chat_room_id: message.chat_room_id,
                text: message.text,
                created_at: message.created_at,
                author_id: message.author_id,
                author_name: message.author?.name ?? null,
                author_image_url: message.author?.image_url ?? null,
            },
        })
    }, [])

    return {
        connectedUsers,
        realtimeMessages,
        broadcast,
    }
}
