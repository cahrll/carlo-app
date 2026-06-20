"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { useRouter } from "next/navigation"
import { createChatRoom } from "@/lib/services/actions/chat"
import { createChatRoomSchema } from "@/lib/schemas/chat"
import type { Member } from "@/lib/types"
import { Btn, IconBtn } from "@/components/common/pm"
import { PmDialog, PmField, PmInput } from "@/components/common/pm-form"
import { IconPlus } from "@/components/common/icons"
import { MemberPicker } from "./member-picker"

type FormData = Pick<z.infer<typeof createChatRoomSchema>, "name">

interface CreateRoomDialogProps {
  orgId: string
  members: Member[]
}

export default function CreateRoomDialog({
  orgId,
  members,
}: CreateRoomDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [memberSearch, setMemberSearch] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<FormData>({
    resolver: zodResolver(createChatRoomSchema.pick({ name: true })),
    defaultValues: { name: "" },
  })

  function toggleMember(id: string) {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function reset() {
    form.reset()
    setSelectedMembers([])
    setMemberSearch("")
  }

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createChatRoom({
        name: formData.name,
        org_id: orgId,
        member_ids: selectedMembers,
      })
      if (!result.error && result.data) {
        setOpen(false)
        reset()
        router.push(`/organization/${orgId}/inbox/${result.data.id}`)
      }
    })
  }

  return (
    <PmDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
      title="New room"
      description="Create a chat room and add members."
      trigger={
        <IconBtn aria-label="New room">
          <IconPlus />
        </IconBtn>
      }
      footer={
        <>
          {selectedMembers.length > 0 && (
            <span className="font-mono text-[11px] text-faint">
              {selectedMembers.length} selected
            </span>
          )}
          <span className="flex-1" />
          <Btn variant="ghost" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Btn>
          <Btn type="submit" form="create-room-form" disabled={isPending}>
            {isPending ? "Creating..." : "Create room"}
          </Btn>
        </>
      }
    >
      <form
        id="create-room-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-[14px]"
      >
        <PmField
          label="Room name"
          hint={form.formState.errors.name?.message}
        >
          <PmInput
            autoFocus
            placeholder="e.g. design"
            aria-invalid={!!form.formState.errors.name}
            {...form.register("name")}
          />
        </PmField>
        {members.length > 0 && (
          <PmField label="Add members">
            <MemberPicker
              members={members}
              selected={selectedMembers}
              onToggle={toggleMember}
              search={memberSearch}
              setSearch={setMemberSearch}
            />
          </PmField>
        )}
      </form>
    </PmDialog>
  )
}
