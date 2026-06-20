"use client"

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  Fragment,
  type FormEvent,
} from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn, formatDayLabel, formatTime, isSameDay } from "@/lib/utils"
import { useOrg } from "@/context/org-context"
import { useAuth } from "@/context/auth-context"
import { sendMessage, deleteChatRoom } from "@/lib/services/actions/chat"
import { useRealtimeChat } from "@/hooks/use-realtime-chat"
import type { ChatMessage, Member } from "@/lib/types"
import AddMembersDialog from "./add-members-dialog"
import { UserAvatar, AvatarStack } from "@/components/common/user-avatar"
import { DotPulse, IconBtn } from "@/components/common/ui-elements"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Kbd } from "@/components/common/kbd"
import { IconLeft, IconSend, IconTrash } from "@/components/common/icons"

interface ChatViewProps {
  roomId: string
  roomName: string
  initialMessages: ChatMessage[]
  roomMembers: {
    member_id: string
    role: string
    user_profile: { id: string; name: string | null; image_url: string | null }
  }[]
  orgMembers: Member[]
}

export default function ChatView({
  roomId,
  roomName,
  initialMessages,
  roomMembers,
  orgMembers,
}: ChatViewProps) {
  const { orgId } = useOrg()
  const { user, profile } = useAuth()
  const router = useRouter()
  const [messageInput, setMessageInput] = useState("")
  const [sending, setSending] = useState(false)
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { connectedUsers, realtimeMessages, broadcast } = useRealtimeChat({
    userId: user?.id ?? "",
    roomId,
  })

  const messages = useMemo(() => {
    const combined = [...initialMessages, ...localMessages, ...realtimeMessages]
    const seen = new Set<string>()
    return combined
      .filter((m) => {
        if (seen.has(m.id)) return false
        seen.add(m.id)
        return true
      })
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
  }, [initialMessages, localMessages, realtimeMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  useEffect(() => {
    setLocalMessages([])
    setMessageInput("")
  }, [roomId])

  const handleSend = async (e: FormEvent) => {
    e.preventDefault()
    const text = messageInput.trim()
    if (!text || sending) return

    setSending(true)
    setMessageInput("")

    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      chat_room_id: roomId,
      author_id: user?.id ?? "",
      text,
      created_at: new Date().toISOString(),
      author: {
        id: user?.id ?? "",
        name: profile?.name ?? null,
        image_url: profile?.image_url ?? null,
      },
    }

    setLocalMessages((prev) => [...prev, optimisticMsg])

    const result = await sendMessage({ chat_room_id: roomId, text })

    if (!result.error && result.data) {
      setLocalMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? result.data! : m))
      )
      broadcast(result.data)
    }

    setSending(false)
  }

  const nonMembers = orgMembers.filter(
    (om) => !roomMembers.some((rm) => rm.member_id === om.member_id)
  )

  const isRoomAdmin =
    !!user?.id &&
    roomMembers.some((m) => m.member_id === user.id && m.role === "admin")

  const handleDeleteRoom = async () => {
    const result = await deleteChatRoom(roomId)
    if (!result.error) {
      router.push(`/organization/${orgId}/inbox`)
      router.refresh()
    }
  }

  return (
    <section className="flex flex-1 flex-col min-w-0 bg-bg1">
      {/* header */}
      <div className="flex-none h-[52px] flex items-center gap-[11px] px-4 border-b border-line">
        <Link
          href={`/organization/${orgId}/inbox`}
          className="nav:hidden grid place-items-center size-[30px] -ml-1 rounded-sm text-muted-foreground hover:bg-bg3 hover:text-ink [&_svg]:size-[18px]"
          aria-label="Back to rooms"
        >
          <IconLeft />
        </Link>
        <div className="font-semibold text-[14px] flex items-center gap-[7px] min-w-0">
          <span className="font-mono text-faint">#</span>
          <span className="truncate">{roomName}</span>
        </div>
        <span className="text-[11.5px] text-muted-foreground max-[560px]:hidden">
          {connectedUsers} online · {roomMembers.length} member
          {roomMembers.length !== 1 ? "s" : ""}
        </span>
        <span className="flex-1" />
        <AvatarStack className="max-nav:hidden">
          {roomMembers.slice(0, 4).map((m) => (
            <UserAvatar
              key={m.member_id}
              name={m.user_profile.name}
              hueKey={m.user_profile.id}
              size={26}
            />
          ))}
        </AvatarStack>
        {isRoomAdmin && nonMembers.length > 0 && (
          <AddMembersDialog chatRoomId={roomId} availableMembers={nonMembers} />
        )}
        {isRoomAdmin && (
          <ConfirmDialog
            trigger={
              <IconBtn danger aria-label="Delete room">
                <IconTrash />
              </IconBtn>
            }
            title="Delete room"
            description="This permanently deletes this room and all of its messages for everyone. This cannot be undone."
            confirmLabel="Delete room"
            onConfirm={handleDeleteRoom}
          />
        )}
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-[3px]">
        {messages.length === 0 && (
          <p className="font-mono text-[12px] text-faint text-center py-10">
            No messages yet. Start the conversation.
          </p>
        )}
        {messages.map((msg, i) => {
          const prev = messages[i - 1]
          const newDay = i === 0 || !isSameDay(prev.created_at, msg.created_at)
          const cont = !newDay && prev?.author_id === msg.author_id
          const isOwn = !!user?.id && msg.author_id === user.id
          return (
            <Fragment key={msg.id}>
              {newDay && (
                <div className="flex items-center gap-3 mt-[10px] mb-[6px] first:mt-0 text-faint">
                  <span className="h-px flex-1 bg-line" />
                  <span className="font-mono text-[10px] tracking-[0.08em] uppercase">
                    {formatDayLabel(msg.created_at)}
                  </span>
                  <span className="h-px flex-1 bg-line" />
                </div>
              )}
              <div
                className={cn(
                  "flex gap-[11px] px-2 py-[5px] rounded-sm hover:bg-bg2",
                  cont && "-mt-[2px]"
                )}
              >
                {cont ? (
                  <span className="w-[30px] shrink-0" />
                ) : (
                  <UserAvatar
                    name={msg.author?.name}
                    hueKey={msg.author?.id}
                    size={30}
                    accent={isOwn}
                    className="mt-px"
                  />
                )}
                <div className="min-w-0 flex-1">
                  {!cont && (
                    <div className="flex items-baseline gap-[9px]">
                      <span className="font-semibold text-[12.5px]">
                        {msg.author?.name ?? "Someone"}
                      </span>
                      <span className="font-mono text-[10px] text-faint">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  )}
                  <div className="text-[13px] leading-[1.5] text-[oklch(0.86_0.01_250)] [overflow-wrap:anywhere]">
                    {msg.text}
                  </div>
                </div>
              </div>
            </Fragment>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* composer */}
      <form
        onSubmit={handleSend}
        className="flex-none p-[12px_16px_16px] max-[560px]:p-[10px_12px_12px]"
      >
        <div className="flex items-end gap-[9px] bg-bg3 border border-line rounded-md p-[8px_8px_8px_12px] focus-within:border-acc focus-within:shadow-[0_0_0_3px_var(--acc-ring)] transition-[border-color,box-shadow]">
          <textarea
            rows={1}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend(e)
              }
            }}
            placeholder={`Message #${roomName}`}
            className="flex-1 bg-transparent border-0 outline-none text-foreground resize-none leading-[1.5] max-h-[120px] py-1 placeholder:text-faint"
          />
          <div className="flex items-center gap-[2px]">
            <button
              type="submit"
              disabled={!messageInput.trim() || sending}
              className="grid place-items-center size-8 rounded-sm bg-acc text-acc-on disabled:opacity-50 [&_svg]:size-[15px]"
              aria-label="Send"
            >
              <IconSend />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-[7px] text-faint text-[11px] font-mono">
          <Kbd>Enter</Kbd> send <Kbd>Shift Enter</Kbd> new line
          <span className="ml-auto inline-flex items-center gap-[6px]">
            <DotPulse />
            live
          </span>
        </div>
      </form>
    </section>
  )
}
