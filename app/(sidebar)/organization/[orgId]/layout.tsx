import React from "react"
import { notFound } from "next/navigation"
import { AppShell } from "@/components/shell/app-shell"
import {
  getOrganizations,
  getOrganizationById,
} from "@/lib/services/queries/organization"
import { getViewerRole } from "@/lib/services/queries/member"
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

  const [orgsResult, orgResult, boardsResult, roomsResult, role] =
    await Promise.all([
      getOrganizations(),
      getOrganizationById(orgId),
      getBoards(orgId),
      getChatRooms(orgId),
      getViewerRole(orgId),
    ])

  // only the owner or an accepted member may enter an org
  if (!role) notFound()

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
