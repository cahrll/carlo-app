"use client"

import { useEffect, useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { cn } from "@/lib/utils"
import { createInvitationSchema } from "@/lib/schemas/invitation"
import { createInvitation } from "@/lib/services/actions/invitation"
import { UserProfile } from "@/lib/types"
import { Btn, Pill, RoleBadge } from "@/components/common/pm"
import { PmDialog, PmField, PmInput, InputWrap } from "@/components/common/pm-form"
import { UserAvatar } from "@/components/common/user-avatar"
import { IconMail, IconSend } from "@/components/common/icons"

type FormData = z.infer<typeof createInvitationSchema>

interface InviteMemberDialogProps {
  organizationId: string
  profiles: UserProfile[]
  memberIds: string[]
  pendingInvitationEmails: string[]
  children: React.ReactNode
}

const InviteMemberDialog = ({
  organizationId,
  profiles,
  memberIds,
  pendingInvitationEmails,
  children,
}: InviteMemberDialogProps) => {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showDropdown, setShowDropdown] = useState(false)
  const searchParams = useSearchParams()

  const memberIdSet = new Set(memberIds)
  const pendingEmailSet = new Set(pendingInvitationEmails)

  const form = useForm<FormData>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: { email: "", role: "member" },
  })

  useEffect(() => {
    if (searchParams.get("compose") === "invite") setOpen(true)
  }, [searchParams])

  const emailValue = form.watch("email")

  const filteredProfiles = profiles.filter((profile) => {
    if (!profile.email) return false
    if (!emailValue) return true
    const query = emailValue.toLowerCase()
    return (
      profile.email.toLowerCase().includes(query) ||
      profile.name?.toLowerCase().includes(query)
    )
  })

  function getProfileStatus(profile: UserProfile) {
    if (memberIdSet.has(profile.id)) return "member"
    if (profile.email && pendingEmailSet.has(profile.email.toLowerCase()))
      return "pending"
    return "available"
  }

  function handleSubmit(data: FormData) {
    const email = data.email.toLowerCase()
    const matched = profiles.find((p) => p.email?.toLowerCase() === email)
    if (!matched) {
      form.setError("email", { message: "User does not exist" })
      return
    }
    if (memberIdSet.has(matched.id)) {
      form.setError("email", { message: "This user is already a member" })
      return
    }
    if (pendingEmailSet.has(email)) {
      form.setError("email", { message: "An invitation is already pending" })
      return
    }
    startTransition(async () => {
      const result = await createInvitation(organizationId, data)
      if (result.error) {
        form.setError("email", { message: result.message })
        return
      }
      form.reset()
      setOpen(false)
    })
  }

  return (
    <PmDialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) {
          form.reset()
          setShowDropdown(false)
        }
      }}
      title="Invite member"
      description="Send an invitation to join your organization."
      trigger={children}
      footer={
        <>
          <span className="flex-1" />
          <Btn variant="ghost" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Btn>
          <Btn type="submit" form="invite-form" disabled={isPending}>
            <IconSend />
            {isPending ? "Sending..." : "Send invite"}
          </Btn>
        </>
      }
    >
      <form
        id="invite-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-[14px]"
      >
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <PmField
              label="Email address"
              hint={
                fieldState.error?.message ??
                "They will get a magic-link invite. It expires in 7 days."
              }
            >
              <div className="relative">
                <InputWrap icon={<IconMail />}>
                  <PmInput
                    {...field}
                    mono
                    type="email"
                    placeholder="name@company.com"
                    autoComplete="off"
                    autoFocus
                    aria-invalid={fieldState.invalid}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  />
                </InputWrap>
                {showDropdown && emailValue && filteredProfiles.length > 0 && (
                  <div className="absolute top-full left-0 z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-sm border border-line bg-panel shadow-md">
                    {filteredProfiles.map((profile) => {
                      const status = getProfileStatus(profile)
                      return (
                        <button
                          key={profile.id}
                          type="button"
                          className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-bg3"
                          onMouseDown={(e) => {
                            e.preventDefault()
                            form.setValue("email", profile.email ?? "", {
                              shouldValidate: true,
                            })
                            setShowDropdown(false)
                          }}
                        >
                          <UserAvatar
                            name={profile.name}
                            hueKey={profile.id}
                            size={24}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-[13px]">
                              {profile.name ?? "Unnamed"}
                            </p>
                            <p className="font-mono text-faint text-[10.5px] truncate">
                              {profile.email}
                            </p>
                          </div>
                          {status === "member" && <Pill tone="ok">member</Pill>}
                          {status === "pending" && (
                            <Pill tone="warn">pending</Pill>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </PmField>
          )}
        />

        <Controller
          control={form.control}
          name="role"
          render={({ field }) => (
            <PmField label="Role">
              <div className="flex gap-2">
                {(
                  [
                    {
                      role: "member",
                      desc: "Can view and edit boards and chat.",
                    },
                    {
                      role: "admin",
                      desc: "Can also invite and manage members.",
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => field.onChange(opt.role)}
                    className={cn(
                      "flex-1 border rounded-sm p-[10px] text-left transition-colors",
                      field.value === opt.role
                        ? "border-acc bg-acc-t"
                        : "border-line hover:border-line2"
                    )}
                  >
                    <RoleBadge role={opt.role} />
                    <div className="text-muted-foreground text-[11px] mt-[5px]">
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </PmField>
          )}
        />
      </form>
    </PmDialog>
  )
}

export default InviteMemberDialog
