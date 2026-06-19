"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import {
  IconBoard,
  IconInbox,
  IconMembers,
  IconCog,
  IconPlus,
  IconMail,
  IconSearch,
  IconHash,
} from "@/components/ui/icons"
import { useCommandStore } from "@/components/shell/command-store"
import type { Board, ChatRoomWithLatest } from "@/lib/types"

function Tile({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid place-items-center size-[28px] rounded-[7px] bg-bg1 border border-line text-muted-foreground shrink-0 group-data-[selected=true]:text-acc group-data-[selected=true]:border-acc/35 [&_svg]:size-[15px]">
      {children}
    </span>
  )
}

export function CommandPalette({
  orgId,
  boards,
  rooms,
}: {
  orgId: string
  boards: Board[]
  rooms: ChatRoomWithLatest[]
}) {
  const { open, setOpen } = useCommandStore()
  const router = useRouter()

  const run = React.useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router, setOpen]
  )

  const base = `/organization/${orgId}`

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-[11px] px-4 py-[14px] border-b border-line">
        <IconSearch className="size-[17px] text-faint" />
        <CommandInput placeholder="Search boards, tasks, people, or run a command" />
        <span className="font-mono text-[10px] text-faint border border-line rounded-[5px] px-[6px] py-[2px]">
          ESC
        </span>
      </div>
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => run(base)}>
            <Tile>
              <IconBoard />
            </Tile>
            <span className="flex-1 min-w-0 font-medium text-[13px]">
              Go to Boards
            </span>
            <CommandShortcut>G B</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(`${base}/inbox`)}>
            <Tile>
              <IconInbox />
            </Tile>
            <span className="flex-1 min-w-0 font-medium text-[13px]">
              Go to Inbox
            </span>
            <CommandShortcut>G I</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(`${base}/members`)}>
            <Tile>
              <IconMembers />
            </Tile>
            <span className="flex-1 min-w-0 font-medium text-[13px]">
              Go to Members
            </span>
            <CommandShortcut>G M</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(`${base}/settings`)}>
            <Tile>
              <IconCog />
            </Tile>
            <span className="flex-1 min-w-0 font-medium text-[13px]">
              Open Settings
            </span>
            <CommandShortcut>G S</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(`${base}?compose=board`)}>
            <Tile>
              <IconBoard />
            </Tile>
            <span className="flex-1 min-w-0 font-medium text-[13px]">
              Create board
            </span>
            <CommandShortcut>B</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(`${base}/members?compose=invite`)}>
            <Tile>
              <IconMail />
            </Tile>
            <span className="flex-1 min-w-0 font-medium text-[13px]">
              Invite member
            </span>
            <CommandShortcut>I</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => run(`${base}/inbox?compose=room`)}>
            <Tile>
              <IconHash />
            </Tile>
            <span className="flex-1 min-w-0 font-medium text-[13px]">
              New room
            </span>
            <CommandShortcut>R</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        {boards.length > 0 && (
          <CommandGroup heading="Jump to board">
            {boards.slice(0, 6).map((b) => (
              <CommandItem
                key={b.id}
                value={`board ${b.title}`}
                onSelect={() => run(`${base}/board/${b.id}`)}
              >
                <Tile>
                  <IconBoard />
                </Tile>
                <span className="flex-1 min-w-0 truncate font-medium text-[13px]">
                  {b.title}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {rooms.length > 0 && (
          <CommandGroup heading="Jump to room">
            {rooms.slice(0, 6).map((r) => (
              <CommandItem
                key={r.id}
                value={`room ${r.name}`}
                onSelect={() => run(`${base}/inbox/${r.id}`)}
              >
                <Tile>
                  <IconHash />
                </Tile>
                <span className="flex-1 min-w-0 truncate font-medium text-[13px]">
                  #{r.name}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
