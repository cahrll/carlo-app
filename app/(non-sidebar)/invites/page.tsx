import InvitationActions from "@/components/invitation/invitation-actions"
import { getCurrentUser } from "@/lib/services/getCurrentUser"
import { getInvitationsByUser } from "@/lib/services/queries/invitation"
import { UserInvitation } from "@/lib/types"
import { formatShort } from "@/lib/utils"
import { redirect } from "next/navigation"
import { FlowShell, FlowTitle, FlowLead } from "@/components/ui/flow"
import { PmEmpty } from "@/components/ui/pm-empty"
import { nameHue } from "@/components/ui/user-avatar"
import { IconMail } from "@/components/ui/icons"

const InvitesPage = async () => {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const { data: invitations, error } = await getInvitationsByUser()
  const list = (invitations as UserInvitation[] | undefined) ?? []

  return (
    <FlowShell wide back="/" account>
      <FlowTitle>Pending invitations</FlowTitle>
      <FlowLead>Teams that have invited you to collaborate.</FlowLead>

      {error ? (
        <p className="text-bad text-[12px] mt-4">
          Could not load invitations. Try again later.
        </p>
      ) : list.length === 0 ? (
        <div className="mt-4">
          <PmEmpty
            icon={<IconMail />}
            title="No pending invitations"
            description="When a team invites you to join, it will show up here."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-[10px] mt-5">
          {list.map((inv) => {
            const orgName = inv.organization?.name ?? "An organization"
            return (
            <div
              key={inv.id}
              className="flex items-center gap-[13px] p-[14px] border border-line rounded-lg bg-bg2 max-nav:flex-wrap"
            >
              <span
                className="grid place-items-center size-10 rounded-[9px] font-bold text-[15px] text-acc-on shrink-0"
                style={{ background: `oklch(0.68 0.12 ${nameHue(inv.org_id)})` }}
              >
                {orgName.charAt(0).toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] truncate">
                  {orgName}
                </div>
                <div className="font-mono text-[11px] text-faint mt-[2px]">
                  invited as {inv.role}
                  {inv.expires_at ? ` · expires ${formatShort(inv.expires_at)}` : ""}
                </div>
              </div>
              <InvitationActions invitationId={inv.id} />
            </div>
            )
          })}
        </div>
      )}
    </FlowShell>
  )
}

export default InvitesPage
