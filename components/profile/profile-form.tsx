"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateProfileSchema } from "@/lib/schemas/profile"
import { updateProfile } from "@/lib/services/actions/profile"
import { useAuth } from "@/context/auth-context"
import { FlowShell, FlowTitle, FlowLead } from "@/components/ui/flow"
import { Btn } from "@/components/ui/pm"
import { PmField, PmInput, InputWrap } from "@/components/ui/pm-form"
import { Kbd } from "@/components/ui/kbd"
import { UserAvatar } from "@/components/ui/user-avatar"
import { IconMail } from "@/components/ui/icons"

type FormData = z.infer<typeof updateProfileSchema>

interface ProfileFormProps {
  profile: { id: string; name: string; image_url: string }
  email: string
}

const ProfileForm = ({ profile, email }: ProfileFormProps) => {
  const [isPending, setIsPending] = useState(false)
  const { profile: authProfile, setProfile } = useAuth()
  const displayName = authProfile?.name ?? profile.name

  const form = useForm<FormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: profile.name },
  })

  async function handleUpdate(data: FormData) {
    setIsPending(true)
    try {
      const result = await updateProfile(data)
      if (result.error) {
        form.setError("name", { message: result.message })
      } else {
        setProfile((prev) => (prev ? { ...prev, name: data.name } : prev))
        form.reset({ name: data.name })
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <FlowShell back="/">
      <FlowTitle>Your profile</FlowTitle>
      <FlowLead>Update how you appear across Carlo.</FlowLead>
      <form
        onSubmit={form.handleSubmit(handleUpdate)}
        className="flex flex-col gap-[15px] mt-[22px]"
      >
        <div className="flex items-center gap-[14px]">
          <UserAvatar
            name={displayName}
            hueKey={profile.id}
            size={56}
            className="text-[18px]"
          />
        </div>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <PmField label="Display name" hint={fieldState.error?.message}>
              <PmInput
                {...field}
                placeholder="Your name"
                aria-invalid={fieldState.invalid}
              />
            </PmField>
          )}
        />
        <PmField
          label={
            <>
              Email <Kbd>read only</Kbd>
            </>
          }
          hint="Email is your sign-in identity and cannot be changed here."
        >
          <InputWrap icon={<IconMail />}>
            <PmInput mono value={email} disabled className="opacity-70" />
          </InputWrap>
        </PmField>
        <div className="flex gap-[9px]">
          <Btn type="submit" disabled={isPending || !form.formState.isDirty}>
            {isPending ? "Saving..." : "Save changes"}
          </Btn>
          <Btn asChild variant="ghost" type="button">
            <a href="/">Cancel</a>
          </Btn>
        </div>
      </form>
    </FlowShell>
  )
}

export default ProfileForm
