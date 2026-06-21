"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { cn, timeAgo } from "@/lib/utils"
import { useOrg } from "@/context/org-context"
import { useDeletions } from "@/context/deletions-context"
import CreateRoomDialog from "./create-room-dialog"
import { IconHash, IconSearch } from "@/components/common/icons"
import { InputWrap, Input } from "@/components/common/form"
import type { ChatRoomWithLatest, Member } from "@/lib/types"

interface ConversationListProps {
  rooms: ChatRoomWithLatest[]
  members: Member[]
}

export default function ConversationList({
  rooms,
  members,
}: ConversationListProps) {
  const [search, setSearch] = useState("")
  const { roomId } = useParams<{ roomId?: string }>()
  const { orgId } = useOrg()
  const { hidden } = useDeletions()

  const visibleRooms = rooms.filter((room) => !hidden.has(room.id))
  const filtered = visibleRooms.filter((room) =>
    room.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <aside
      className={cn(
        "flex-col w-[248px] max-nav:w-full shrink-0 border-r border-line max-nav:border-r-0 bg-bg1",
        roomId ? "hidden nav:flex" : "flex"
      )}
    >
      <div className="flex items-center gap-2 px-[14px] pt-[14px] pb-[10px]">
        <h2 className="text-[14px] font-semibold">Inbox</h2>
        {orgId && (
          <div className="ml-auto">
            <CreateRoomDialog orgId={orgId} members={members} />
          </div>
        )}
      </div>

      <div className="px-3 pb-[10px]">
        <InputWrap icon={<IconSearch />}>
          <Input
            mono
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms"
          />
        </InputWrap>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-[10px] flex flex-col gap-px">
        {filtered.length === 0 && (
          <p className="font-mono text-[11px] text-faint text-center py-8">
            {visibleRooms.length === 0 ? "No conversations yet" : "No results"}
          </p>
        )}
        {filtered.map((room) => {
          const last = room.latest_message
          const preview = last
            ? `${last.author?.name?.split(" ")[0] ?? "Someone"}: ${last.text}`
            : "No messages yet"
          const time = timeAgo(last?.created_at ?? room.created_at)
          const active = roomId === room.id

          return (
            <Link
              key={room.id}
              href={`/organization/${orgId}/inbox/${room.id}`}
              className={cn(
                "flex gap-[10px] px-[9px] py-[9px] rounded-sm transition-colors",
                active ? "bg-bg3" : "hover:bg-bg2"
              )}
            >
              <div
                className={cn(
                  "grid place-items-center size-[30px] rounded-[8px] border bg-bg2 [&_svg]:size-[15px]",
                  active
                    ? "text-acc border-acc/35"
                    : "text-muted-foreground border-line"
                )}
              >
                <IconHash />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[12.5px] truncate">
                    {room.name}
                  </span>
                  <span className="ml-auto font-mono text-[10px] text-faint shrink-0">
                    {time}
                  </span>
                </div>
                <div className="text-[11.5px] text-muted-foreground truncate mt-[2px]">
                  {preview}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
