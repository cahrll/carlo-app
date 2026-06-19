import OrganizationList from "@/components/organization/organization-list"
import { getOrganizations } from "@/lib/services/queries/organization"
import { getInvitationsByUser } from "@/lib/services/queries/invitation"
import { getCurrentUser } from "@/lib/services/getCurrentUser"
import { redirect } from "next/navigation"

export default async function Home() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const [{ data: organizations, error, message }, { data: invites }] =
    await Promise.all([getOrganizations(), getInvitationsByUser()])

  return (
    <OrganizationList
      organizations={organizations || []}
      error={error}
      message={message}
      id={user.id}
      invitesCount={invites?.length ?? 0}
    />
  )
}
