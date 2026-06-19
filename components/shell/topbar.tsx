"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconMenu, IconSearch } from "@/components/ui/icons"
import { Kbd } from "@/components/ui/kbd"
import type { Board } from "@/lib/types"

export function Topbar({
  orgId,
  orgName,
  boards,
  onMenu,
  onSearch,
}: {
  orgId: string
  orgName: string
  boards: Board[]
  onMenu: () => void
  onSearch: () => void
}) {
  const pathname = usePathname()
  const base = `/organization/${orgId}`
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : ""

  let current = "Boards"
  if (rest.startsWith("/board/")) {
    const id = rest.split("/board/")[1]?.split("/")[0]
    current = boards.find((b) => b.id === id)?.title ?? "Board"
  } else if (rest.startsWith("/inbox")) current = "Inbox"
  else if (rest.startsWith("/members")) current = "Members"
  else if (rest.startsWith("/settings")) current = "Settings"

  return (
    <header className="flex-none h-[52px] flex items-center gap-3 px-[18px] border-b border-line bg-bg1 max-[560px]:px-3">
      <button
        onClick={onMenu}
        aria-label="Menu"
        className="nav:hidden grid place-items-center size-[30px] -ml-1 rounded-sm text-muted-foreground hover:bg-bg3 hover:text-ink [&_svg]:size-[19px]"
      >
        <IconMenu />
      </button>

      <div className="flex items-center gap-2 text-[13px] min-w-0">
        <Link
          href={base}
          className="max-nav:hidden text-muted-foreground hover:text-ink"
        >
          {orgName}
        </Link>
        <span className="max-nav:hidden text-faint">/</span>
        <b className="font-semibold truncate">{current}</b>
      </div>

      <div className="flex-1" />

      <button
        onClick={onSearch}
        className="flex items-center gap-2 h-[32px] pl-[11px] pr-[10px] border border-line rounded-sm text-faint bg-bg2 min-w-[200px] hover:border-line2 transition-colors max-nav:min-w-0 max-nav:px-[9px] [&_svg]:size-[14px]"
      >
        <IconSearch />
        <span className="max-nav:hidden">Search or jump to</span>
        <Kbd className="ml-auto max-nav:hidden">⌘K</Kbd>
      </button>
    </header>
  )
}
