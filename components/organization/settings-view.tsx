"use client"

import * as React from "react"
import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Organization } from "@/lib/types"
import { slugify } from "@/lib/utils"
import {
  updateOrganization,
  deleteOrganization,
} from "@/lib/services/actions/organization"
import { Btn } from "@/components/ui/pm"
import { PmInput } from "@/components/ui/pm-form"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Content } from "@/components/ui/page"

function SetGroup({
  title,
  children,
  danger,
}: {
  title: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <div
      className={cnGroup(danger)}
    >
      <div className="px-4 py-[13px] border-b border-line flex items-center gap-[9px]">
        <h3 className={`text-[13.5px] font-semibold ${danger ? "text-bad" : ""}`}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

function cnGroup(danger?: boolean) {
  return `border rounded-lg bg-bg2 mt-4 overflow-hidden ${
    danger ? "border-bad/30" : "border-line"
  }`
}

function SetRow({
  title,
  desc,
  control,
  danger,
}: {
  title: string
  desc: string
  control: React.ReactNode
  danger?: boolean
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-[15px] border-b border-line last:border-b-0 max-nav:flex-col max-nav:items-stretch max-nav:gap-[11px]">
      <div className="flex-1">
        <div className={`font-medium text-[13px] ${danger ? "text-bad" : ""}`}>
          {title}
        </div>
        <div className="text-muted-foreground text-[11.5px] mt-[3px] max-w-[62ch]">
          {desc}
        </div>
      </div>
      <div className="w-[240px] flex-none flex justify-end max-nav:w-full">
        {control}
      </div>
    </div>
  )
}

export default function SettingsView({
  organization,
  canDelete,
}: {
  organization: Organization
  canDelete?: boolean
}) {
  const tabs = ["general", "members"] as const
  const [tab, setTab] = React.useState<(typeof tabs)[number]>("general")
  const [name, setName] = React.useState(organization.name)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function saveName() {
    startTransition(async () => {
      await updateOrganization(organization.id, { name })
    })
  }

  async function handleDelete() {
    const result = await deleteOrganization(organization.id)
    if (!result.error) {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <Content>
      <div className="px-[22px] pt-5 pb-3 max-nav:px-[14px]">
        <h1 className="text-[18px] font-semibold">Settings</h1>
        <div className="font-mono text-[12px] text-muted-foreground mt-[3px]">
          {slugify(organization.name)}
        </div>
      </div>

      <div className="flex gap-[2px] border-b border-line px-[22px] max-nav:px-[14px] max-nav:overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-[11px] font-medium text-[13px] border-b-2 -mb-px capitalize whitespace-nowrap ${
              tab === t
                ? "text-ink border-acc"
                : "text-muted-foreground border-transparent hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mx-auto w-full max-w-[680px] px-[22px] pb-[30px] max-nav:px-[14px]">
        {tab === "general" && (
          <SetGroup title="Organization">
            <SetRow
              title="Name"
              desc="Shown across boards, invites, and the org switcher."
              control={
                <div className="flex gap-2 w-full">
                  <PmInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Btn
                    size="sm"
                    onClick={saveName}
                    disabled={isPending || name === organization.name}
                  >
                    {isPending ? "..." : "Save"}
                  </Btn>
                </div>
              }
            />
            <SetRow
              title="Default board sections"
              desc="New boards start with these sections."
              control={
                <span className="font-mono text-[12px] text-muted-foreground">
                  To Do, In Progress, Testing, Done
                </span>
              }
            />
          </SetGroup>
        )}

        {tab === "general" && canDelete && (
          <SetGroup title="Danger zone" danger>
            <SetRow
              danger
              title="Delete organization"
              desc="Permanently delete this organization and everything in it: boards, tasks, members, invitations, and chat. This cannot be undone."
              control={
                <ConfirmDialog
                  trigger={
                    <Btn variant="danger" size="sm">
                      Delete organization
                    </Btn>
                  }
                  title="Delete organization"
                  body="This permanently deletes the organization and all of its boards, tasks, members, invitations, and chat rooms. This cannot be undone."
                  confirmLabel="Delete organization"
                  confirmPhrase={organization.name}
                  onConfirm={handleDelete}
                />
              }
            />
          </SetGroup>
        )}

        {tab === "members" && (
          <SetGroup title="Membership defaults">
            <SetRow
              title="Invitation expiry"
              desc="How long an invite link stays valid."
              control={
                <span className="font-mono text-[12px] text-muted-foreground">
                  7 days
                </span>
              }
            />
          </SetGroup>
        )}
      </div>
    </Content>
  )
}
