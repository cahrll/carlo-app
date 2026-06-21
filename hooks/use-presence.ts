import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export type PresenceUser = { userId: string; name: string | null }

// channel presence, deduped
export function usePresence({
  channelName,
  userId,
  name,
}: {
  channelName: string
  userId: string
  name: string | null
}) {
  const [users, setUsers] = useState<PresenceUser[]>([])

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const channel = supabase.channel(channelName, {
      config: { presence: { key: userId } },
    })

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceUser>()
        const list = Object.values(state)
          .map((entries) => entries[0])
          .filter(Boolean)
          .map((e) => ({ userId: e.userId, name: e.name }))
        setUsers(list)
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") channel.track({ userId, name })
      })

    return () => {
      channel.untrack()
      channel.unsubscribe()
    }
  }, [channelName, userId, name])

  return users
}
