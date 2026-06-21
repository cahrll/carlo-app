"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/shell/sidebar"
import { Topbar } from "@/components/shell/topbar"
import { CommandPalette } from "@/components/shell/command-palette"
import {
  CommandStoreProvider,
  useCommandStore,
} from "@/components/shell/command-store"
import type { Board, ChatRoomWithLatest, Organization } from "@/lib/types"

type Props = {
  organizations: Organization[]
  currentOrg: Organization | null
  boards: Board[]
  rooms: ChatRoomWithLatest[]
  orgId: string
  canManage?: boolean
  children: React.ReactNode
}

function Inner({
  organizations,
  currentOrg,
  boards,
  rooms,
  orgId,
  canManage,
  children,
}: Props) {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const { setOpen, toggle } = useCommandStore()
  const pathname = usePathname()

  React.useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  // global Cmd/Ctrl+K
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggle])

  return (
    <div className="h-full flex bg-bg1 relative overflow-hidden">
      <Sidebar
        organizations={organizations}
        currentOrg={currentOrg}
        boards={boards}
        orgId={orgId}
        open={drawerOpen}
        onNavigate={() => setDrawerOpen(false)}
        canManage={canManage}
      />

      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          className="absolute inset-0 z-[25] bg-[oklch(0.1_0.01_262/0.5)] nav:hidden"
          aria-hidden
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          orgId={orgId}
          orgName={currentOrg?.name ?? "Workspace"}
          boards={boards}
          onMenu={() => setDrawerOpen(true)}
          onSearch={() => setOpen(true)}
        />
        <div className="flex-1 min-h-0 flex flex-col">{children}</div>
      </div>

      <CommandPalette orgId={orgId} boards={boards} rooms={rooms} canManage={canManage} />
    </div>
  )
}

export function AppShell(props: Props) {
  return (
    <CommandStoreProvider>
      <Inner {...props} />
    </CommandStoreProvider>
  )
}
