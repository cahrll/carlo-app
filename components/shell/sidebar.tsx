"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { UserAvatar } from "@/components/ui/user-avatar"
import {
  IconBoard,
  IconInbox,
  IconMembers,
  IconCog,
  IconPlus,
  IconDots,
  IconUser,
  IconLogout,
} from "@/components/ui/icons"
import { IconBtn } from "@/components/ui/pm"
import type { Board, Organization } from "@/lib/types"

function NavLink({
  href,
  icon,
  label,
  active,
  count,
  badge,
  onNavigate,
}: {
  href: string
  icon: React.ReactNode
  label: string
  active: boolean
  count?: number
  badge?: string
  onNavigate: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-[10px] px-[9px] py-[7px] rounded-sm font-medium transition-colors [&_svg]:size-4",
        active
          ? "bg-bg3 text-ink [&_svg]:text-acc"
          : "text-muted-foreground hover:bg-bg2 hover:text-ink"
      )}
    >
      {icon}
      <span>{label}</span>
      {badge ? (
        <span className="ml-auto font-mono text-[10px] font-bold bg-acc text-acc-on rounded-full px-[6px] py-px">
          {badge}
        </span>
      ) : count != null ? (
        <span className="ml-auto font-mono text-[10.5px] text-faint">
          {count}
        </span>
      ) : null}
    </Link>
  )
}

export function Sidebar({
  currentOrg,
  boards,
  orgId,
  open,
  onNavigate,
}: {
  organizations: Organization[]
  currentOrg: Organization | null
  boards: Board[]
  orgId: string
  open: boolean
  onNavigate: () => void
}) {
  const pathname = usePathname()
  const { profile, logout } = useAuth()
  const base = `/organization/${orgId}`

  const isBoards = pathname === base || pathname.startsWith(`${base}/board`)
  const isInbox = pathname.startsWith(`${base}/inbox`)
  const isMembers = pathname.startsWith(`${base}/members`)
  const isSettings = pathname.startsWith(`${base}/settings`)
  const activeBoardId = pathname.startsWith(`${base}/board/`)
    ? pathname.split("/board/")[1]?.split("/")[0]
    : null

  const orgName = currentOrg?.name ?? "Workspace"

  return (
    <aside
      className={cn(
        "flex flex-col flex-none bg-bg0 border-r border-line px-[9px] py-[11px] w-[240px]",
        "max-nav:absolute max-nav:inset-y-0 max-nav:left-0 max-nav:z-30 max-nav:w-[248px] max-nav:transition-transform max-nav:duration-200 max-nav:ease-precision",
        open
          ? "max-nav:translate-x-0 max-nav:shadow-[10px_0_44px_-10px_oklch(0_0_0/0.65)]"
          : "max-nav:-translate-x-full"
      )}
    >
      {/* org switcher */}
      <Link
        href="/"
        onClick={onNavigate}
        aria-label="Switch workspace"
        className="flex items-center gap-[9px] w-full text-left px-2 py-[7px] rounded-md hover:bg-bg2 transition-colors"
      >
        <span className="grid place-items-center size-[28px] rounded-[7px] bg-acc text-acc-on font-bold text-[13px] shrink-0">
          {orgName.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 overflow-hidden">
          <span className="block font-semibold text-[13.5px] truncate">
            {orgName}
          </span>
          <span className="block font-mono text-[10.5px] text-faint">
            {boards.length} boards
          </span>
        </span>
        <IconDots className="ml-auto text-faint size-4" />
      </Link>

      {/* primary nav */}
      <nav className="flex flex-col gap-px mt-[10px]">
        <NavLink
          href={base}
          icon={<IconBoard />}
          label="Boards"
          active={isBoards}
          count={boards.length}
          onNavigate={onNavigate}
        />
        <NavLink
          href={`${base}/inbox`}
          icon={<IconInbox />}
          label="Inbox"
          active={isInbox}
          onNavigate={onNavigate}
        />
        <NavLink
          href={`${base}/members`}
          icon={<IconMembers />}
          label="Members"
          active={isMembers}
          onNavigate={onNavigate}
        />
        <NavLink
          href={`${base}/settings`}
          icon={<IconCog />}
          label="Settings"
          active={isSettings}
          onNavigate={onNavigate}
        />
      </nav>

      {/* boards group */}
      <div className="flex items-center justify-between px-[9px] pt-[13px] pb-[6px]">
        <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-faint">
          Boards
        </span>
        <Link
          href={`${base}?compose=board`}
          onClick={onNavigate}
          className="grid place-items-center size-[22px] rounded-sm text-muted-foreground hover:bg-bg3 hover:text-ink [&_svg]:size-[13px]"
          aria-label="New board"
        >
          <IconPlus />
        </Link>
      </div>
      <div className="flex flex-col gap-px overflow-y-auto">
        {boards.map((b) => (
          <Link
            key={b.id}
            href={`${base}/board/${b.id}`}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-[9px] px-[9px] py-[6px] rounded-sm text-[12.5px] transition-colors",
              activeBoardId === b.id
                ? "bg-bg3 text-ink"
                : "text-muted-foreground hover:bg-bg2 hover:text-ink"
            )}
          >
            <span className="size-[7px] rounded-[2px] bg-faint shrink-0" />
            <span className="truncate">{b.title}</span>
          </Link>
        ))}
      </div>

      {/* user footer */}
      <div className="mt-auto flex items-center gap-[9px] p-2 border-t border-line">
        <UserAvatar name={profile?.name} hueKey={profile?.id} size={26} />
        <span className="min-w-0 flex-1 overflow-hidden">
          <span className="block font-semibold text-[12px] leading-[1.3] truncate">
            {profile?.name ?? "You"}
          </span>
          <span className="block font-mono text-[10px] text-faint truncate">
            {profile?.email ?? ""}
          </span>
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <IconBtn asChild aria-label="Profile">
            <Link href="/profile" onClick={onNavigate}>
              <IconUser />
            </Link>
          </IconBtn>
          <IconBtn aria-label="Log out" onClick={() => logout()}>
            <IconLogout />
          </IconBtn>
        </div>
      </div>
    </aside>
  )
}
