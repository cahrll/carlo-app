"use client"

import Link from "next/link"
import { Organization } from "@/lib/types"
import { FlowShell, FlowTitle, FlowLead } from "@/components/common/flow"
import { Btn, RoleBadge } from "@/components/common/ui-elements"
import { EmptyState } from "@/components/common/empty-state"
import { nameHue } from "@/components/common/user-avatar"
import { IconPlus, IconRight, IconBell } from "@/components/common/icons"

const OrganizationList = ({
  organizations,
  error,
  message,
  id,
  invitesCount = 0,
}: {
  organizations: Organization[]
  error: boolean
  message?: string
  id: string
  invitesCount?: number
}) => {
  if (error) {
    return (
      <FlowShell wide account>
        <FlowTitle>Could not load workspaces</FlowTitle>
        <FlowLead>{message ?? "Please try again later."}</FlowLead>
      </FlowShell>
    )
  }

  return (
    <FlowShell wide account>
      <FlowTitle>Your workspaces</FlowTitle>
      <FlowLead>
        Pick an organization to jump back into, or start a new one.
      </FlowLead>

      {invitesCount > 0 && (
        <Link
          href="/invites"
          className="flex items-center gap-[11px] p-[12px_14px] bg-acc-t border border-acc/30 rounded-lg text-ink mt-5 mb-[2px] text-[12.5px] [&>svg]:size-[17px] [&>svg]:text-acc [&>svg]:shrink-0"
        >
          <IconBell />
          <span>
            You have <b className="font-mono">{invitesCount}</b> pending
            invitation{invitesCount > 1 ? "s" : ""}.
          </span>
          <span className="ml-auto text-acc font-semibold font-mono text-[12px] inline-flex items-center gap-[5px] [&_svg]:size-4">
            Review
            <IconRight />
          </span>
        </Link>
      )}

      {organizations.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<IconPlus />}
            title="No organizations yet"
            description="Create your first organization to start planning, assigning, and chatting in one place."
            actions={
              <Btn asChild>
                <Link href="/create">
                  <IconPlus />
                  Create organization
                </Link>
              </Btn>
            }
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-[10px] mt-5">
            {organizations.map((o) => {
              const role = id === o.owner_id ? "owner" : "member"
              return (
                <Link
                  key={o.id}
                  href={`/organization/${o.id}`}
                  className="flex items-center gap-[13px] p-[14px] border border-line rounded-lg bg-bg2 hover:border-line2 hover:-translate-y-px hover:bg-bg3 transition-[border-color,transform,background] duration-150 max-nav:flex-wrap"
                >
                  <span
                    className="grid place-items-center size-10 rounded-[9px] font-bold text-[15px] text-acc-on shrink-0"
                    style={{ background: `oklch(0.68 0.12 ${nameHue(o.id)})` }}
                  >
                    {o.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px] truncate">
                      {o.name}
                    </div>
                    <div className="font-mono text-[11px] text-faint mt-[2px]">
                      you are {role}
                    </div>
                  </div>
                  <RoleBadge role={role} />
                  <span className="text-faint inline-flex [&_svg]:size-4">
                    <IconRight />
                  </span>
                </Link>
              )
            })}
          </div>
          <Btn asChild variant="ghost" block className="mt-4">
            <Link href="/create">
              <IconPlus />
              Create organization
            </Link>
          </Btn>
        </>
      )}
    </FlowShell>
  )
}

export default OrganizationList
