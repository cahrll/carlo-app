"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { addChatRoomMembers } from "@/lib/services/actions/chat"
import type { Member } from "@/lib/types"
import { Btn } from "@/components/ui/pm"
import { PmDialog } from "@/components/ui/pm-form"
import { IconPlus } from "@/components/ui/icons"
import { MemberPicker } from "./member-picker"

interface AddMembersDialogProps {
  chatRoomId: string
  availableMembers: Member[]
}

export default function AddMembersDialog({
  chatRoomId,
  availableMembers,
}: AddMembersDialogProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function toggleMember(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleSubmit() {
    if (selected.length === 0) return
    startTransition(async () => {
      const result = await addChatRoomMembers({
        chat_room_id: chatRoomId,
        member_ids: selected,
      })
      if (!result.error) {
        setOpen(false)
        setSelected([])
        setSearch("")
        router.refresh()
      }
    })
  }

  return (
    <PmDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setSelected([])
          setSearch("")
        }
      }}
      title="Add members"
      description="Add organization members to this room."
      trigger={
        <Btn variant="ghost" size="sm">
          <IconPlus />
          Add
        </Btn>
      }
      footer={
        <>
          {selected.length > 0 && (
            <span className="font-mono text-[11px] text-faint">
              {selected.length} selected
            </span>
          )}
          <span className="flex-1" />
          <Btn
            type="button"
            onClick={handleSubmit}
            disabled={isPending || selected.length === 0}
          >
            {isPending ? "Adding..." : "Add"}
          </Btn>
        </>
      }
    >
      <MemberPicker
        members={availableMembers}
        selected={selected}
        onToggle={toggleMember}
        search={search}
        setSearch={setSearch}
      />
    </PmDialog>
  )
}
