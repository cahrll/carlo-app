import { Invitation, Member, UserProfile } from "@/lib/types"
import { formatShort } from "@/lib/utils"
import { getMembers, getViewerRole } from "@/lib/services/queries/member"
import { canModify } from "@/lib/services/authz"
import { getInvitationsByOrg } from "@/lib/services/queries/invitation"
import { getAllProfiles } from "@/lib/services/queries/profile"
import { notFound } from "next/navigation"
import InviteMemberDialog from "@/components/organization/invite-member-dialog"
import { Btn, Pill, RoleBadge } from "@/components/common/ui-elements"
import { UserAvatar } from "@/components/common/user-avatar"
import { Content, PageHeader } from "@/components/common/page"
import { IconPlus, IconMail } from "@/components/common/icons"

const thCls =
  "font-mono text-[10px] tracking-[0.1em] uppercase text-faint font-medium text-left px-[14px] py-[9px] border-b border-line"
const tdCls = "px-[14px] py-[11px] border-b border-line align-middle"

function statusPill(status: string) {
  if (status === "accepted" || status === "active")
    return <Pill tone="ok">active</Pill>
  if (status === "pending") return <Pill tone="warn">pending</Pill>
  if (["removed", "revoked", "expired", "declined"].includes(status))
    return <Pill tone="bad">{status}</Pill>
  return <Pill tone="idle">{status}</Pill>
}

const MembersPage = async ({
  params,
}: {
  params: Promise<{ orgId: string }>
}) => {
  const { orgId } = await params
  const [
    { data: members, error },
    { data: invitations },
    { data: profiles },
    role,
  ] = await Promise.all([
    getMembers(orgId),
    getInvitationsByOrg(orgId),
    getAllProfiles(),
    getViewerRole(orgId),
  ])

  if (error || !members) notFound()

  const canInvite = canModify(role)

  const memberList = members as Member[]
  const inviteList = (invitations as Invitation[] | undefined) ?? []
  const memberIds = new Set(memberList.map((m) => m.member_id))
  const pendingEmails = new Set(
    inviteList
      .filter((i) => i.status === "pending")
      .map((i) => i.email.toLowerCase())
  )

  return (
    <Content>
      <PageHeader
        title="Members"
        sub={`${memberList.length} active · ${inviteList.length} pending`}
        actions={
          canInvite ? (
            <InviteMemberDialog
              organizationId={orgId}
              profiles={(profiles as UserProfile[] | undefined) ?? []}
              memberIds={[...memberIds]}
              pendingInvitationEmails={[...pendingEmails]}
            >
              <Btn>
                <IconPlus />
                Invite member
              </Btn>
            </InviteMemberDialog>
          ) : undefined
        }
      />

      <div className="px-[22px] pb-[26px] max-nav:px-[14px]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[560px] [&_tbody_tr:last-child_td]:border-b-0">
            <thead>
              <tr>
                <th className={thCls}>Member</th>
                <th className={thCls}>Role</th>
                <th className={thCls}>Status</th>
                <th className={thCls}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {memberList.map((m) => (
                <tr key={m.member_id} className="transition-colors hover:bg-bg2">
                  <td className={tdCls}>
                    <div className="flex items-center gap-[9px]">
                      <UserAvatar
                        name={m.user_profile.name}
                        hueKey={m.user_profile.id}
                        size={26}
                      />
                      <span className="font-medium">
                        {m.user_profile.name ?? "Unnamed"}
                        <span className="block font-mono text-[10.5px] text-faint">
                          #{m.member_id.slice(0, 8)}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className={tdCls}>
                    <RoleBadge role={m.role} />
                  </td>
                  <td className={tdCls}>{statusPill(m.status)}</td>
                  <td className={`${tdCls} font-mono text-[12px] text-muted-foreground`}>
                    {formatShort(m.created_at)}
                  </td>
                </tr>
              ))}
              {memberList.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="h-24 text-center font-mono text-[12px] text-faint"
                  >
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-faint mt-[26px] mb-[10px]">
          Pending invitations
        </div>
        {inviteList.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-[7px] rounded-md border border-line bg-bg2 px-4 py-9 text-center">
            <span className="grid place-items-center size-9 rounded-full bg-bg3 border border-line text-faint [&_svg]:size-[16px] mb-1">
              <IconMail />
            </span>
            <p className="text-[13px] font-medium text-ink">
              No pending invitations
            </p>
            <p className="text-[11.5px] text-muted-foreground">
              Invites you send will appear here until they are accepted.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[560px] [&_tbody_tr:last-child_td]:border-b-0">
              <thead>
                <tr>
                  <th className={thCls}>Email</th>
                  <th className={thCls}>Role</th>
                  <th className={thCls}>Status</th>
                  <th className={thCls}>Invited by</th>
                </tr>
              </thead>
              <tbody>
                {inviteList.map((i) => (
                  <tr key={i.id} className="transition-colors hover:bg-bg2">
                    <td className={tdCls}>
                      <div className="flex items-center gap-[9px]">
                        <span className="grid place-items-center size-[26px] rounded-full bg-bg3 border border-line text-faint [&_svg]:size-[14px]">
                          <IconMail />
                        </span>
                        <span className="font-mono text-[12.5px] font-medium">
                          {i.email}
                        </span>
                      </div>
                    </td>
                    <td className={tdCls}>
                      <RoleBadge role={i.role} />
                    </td>
                    <td className={tdCls}>
                      <Pill tone="warn">pending</Pill>
                    </td>
                    <td className={`${tdCls} font-mono text-[12px] text-muted-foreground`}>
                      {i.invited_by_profile?.name?.split(" ")[0] ?? "someone"}
                      {i.expires_at ? ` · expires ${formatShort(i.expires_at)}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Content>
  )
}

export default MembersPage
