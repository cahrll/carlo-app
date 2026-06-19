import React from "react"
import { AppShell } from "@/components/shell/app-shell"
import {
  getOrganizations,
  getOrganizationById,
} from "@/lib/services/queries/organization"
import { getBoards } from "@/lib/services/queries/board"
import { getChatRooms } from "@/lib/services/queries/chat"

const OrgLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ orgId: string }>
}) => {
  const { orgId } = await params

  const [orgsResult, orgResult, boardsResult, roomsResult] = await Promise.all([
    getOrganizations(),
    getOrganizationById(orgId),
    getBoards(orgId),
    getChatRooms(orgId),
  ])

  return (
    <AppShell
      organizations={orgsResult.data ?? []}
      currentOrg={orgResult.data ?? null}
      boards={boardsResult.data ?? []}
      rooms={roomsResult.data ?? []}
      orgId={orgId}
    >
      {children}
    </AppShell>
  )
}

export default OrgLayout
