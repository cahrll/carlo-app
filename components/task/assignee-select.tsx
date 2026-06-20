"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import type { Member } from "@/lib/types"
import { UserAvatar } from "@/components/common/user-avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu"
import { IconUser, IconCheck, IconChevron } from "@/components/common/icons"

function Row({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-[7px] text-left text-[13px] transition-colors",
        selected ? "bg-bg3" : "hover:bg-bg3"
      )}
    >
      {children}
      {selected && <IconCheck className="ml-auto size-[15px] text-acc" />}
    </button>
  )
}

// single-select assignee from org members
export function AssigneeSelect({
  members,
  value,
  onChange,
}: {
  members: Member[]
  value: string
  onChange: (id: string) => void
}) {
  const { user } = useAuth()
  const [open, setOpen] = React.useState(false)

  const assignable = members.filter((m) => m.status === "accepted")
  // resolve against full list so self-assigned shows a name
  const selected = members.find((m) => m.member_id === value)

  function pick(id: string) {
    onChange(id)
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center gap-2 rounded-sm border border-line bg-bg3 px-[11px] text-left text-[13px] outline-none transition-[border-color,box-shadow] duration-150 focus:border-acc focus:shadow-[0_0_0_3px_var(--acc-ring)] data-[state=open]:border-acc"
        >
          {value && selected ? (
            <>
              <UserAvatar
                name={selected.user_profile.name}
                hueKey={selected.user_profile.id}
                size={20}
              />
              <span className="truncate">
                {selected.user_profile.name ?? "Unknown"}
              </span>
            </>
          ) : (
            <span className="flex items-center gap-2 text-faint [&_svg]:size-[15px]">
              <IconUser />
              Unassigned
            </span>
          )}
          <IconChevron className="ml-auto size-4 shrink-0 text-faint" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-56 overflow-y-auto border-line bg-bg2 p-1"
      >
        <Row selected={!value} onClick={() => pick("")}>
          <span className="grid size-5 shrink-0 place-items-center rounded-full border border-line bg-bg3 text-faint [&_svg]:size-[12px]">
            <IconUser />
          </span>
          <span className="flex-1 truncate text-faint">Unassigned</span>
        </Row>

        {assignable.length === 0 ? (
          <p className="px-2 py-3 text-center font-mono text-[11px] text-faint">
            No members to assign.
          </p>
        ) : (
          assignable.map((m) => (
            <Row
              key={m.member_id}
              selected={value === m.member_id}
              onClick={() => pick(m.member_id)}
            >
              <UserAvatar
                name={m.user_profile.name}
                hueKey={m.user_profile.id}
                size={20}
              />
              <span className="flex-1 truncate">
                {m.user_profile.name ?? "Unknown"}
                {m.member_id === user?.id && (
                  <span className="text-faint"> (You)</span>
                )}
              </span>
            </Row>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
