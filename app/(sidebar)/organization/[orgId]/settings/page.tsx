import SettingsView from "@/components/organization/settings-view"
import { getOrganizationById } from "@/lib/services/queries/organization"
import { getViewerRole } from "@/lib/services/queries/member"
import { notFound } from "next/navigation"

const SettingsPage = async ({
  params,
}: {
  params: Promise<{ orgId: string }>
}) => {
  const { orgId } = await params
  const [{ data: organization }, role] = await Promise.all([
    getOrganizationById(orgId),
    getViewerRole(orgId),
  ])

  if (!organization) notFound()

  return (
    <SettingsView organization={organization} canDelete={role === "owner"} />
  )
}

export default SettingsPage
