"use client"

import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/common/user-avatar"
import { InputWrap, PmInput } from "@/components/common/pm-form"
import { IconSearch, IconCheck } from "@/components/common/icons"
import type { Member } from "@/lib/types"

export function MemberPicker({
  members,
  selected,
  onToggle,
  search,
  setSearch,
}: {
  members: Member[]
  selected: string[]
  onToggle: (id: string) => void
  search: string
  setSearch: (v: string) => void
}) {
  const filtered = members.filter((m) =>
    m.user_profile.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-2">
      <InputWrap icon={<IconSearch />}>
        <PmInput
          mono
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members"
        />
      </InputWrap>
      <div className="max-h-48 overflow-y-auto rounded-sm border border-line">
        {filtered.length === 0 ? (
          <p className="font-mono text-[11px] text-faint p-3 text-center">
            No members found
          </p>
        ) : (
          filtered.map((m) => {
            const sel = selected.includes(m.member_id)
            return (
              <button
                key={m.member_id}
                type="button"
                onClick={() => onToggle(m.member_id)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-[10px] text-left transition-colors border-b border-line last:border-b-0",
                  sel ? "bg-bg3" : "hover:bg-bg2"
                )}
              >
                <UserAvatar
                  name={m.user_profile.name}
                  hueKey={m.user_profile.id}
                  size={24}
                />
                <span className="flex-1 text-[13px] truncate">
                  {m.user_profile.name ?? "Unknown"}
                </span>
                <span
                  className={cn(
                    "grid place-items-center size-5 rounded-[5px] border [&_svg]:size-3",
                    sel ? "bg-acc border-acc text-acc-on" : "border-line"
                  )}
                >
                  {sel && <IconCheck />}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
