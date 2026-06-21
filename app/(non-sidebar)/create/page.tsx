"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { useRouter } from "next/navigation"
import { createOrganizationSchema } from "@/lib/schemas/organization"
import { createOrganization } from "@/lib/services/actions/organization"
import { FlowShell, FlowTitle, FlowLead } from "@/components/common/flow"
import { Btn } from "@/components/common/ui-elements"
import { Field, Input } from "@/components/common/form"
import { IconRight } from "@/components/common/icons"

type FormData = z.infer<typeof createOrganizationSchema>

const CreatePage = () => {
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "" },
  })

  const busy = form.formState.isSubmitting || redirecting

  async function handleCreateOrganization(data: FormData) {
    const { error } = await createOrganization(data)
    if (error) return
    setRedirecting(true)
    router.push("/")
  }

  return (
    <FlowShell back="/" account>
      <FlowTitle>Create organization</FlowTitle>
      <FlowLead>A workspace for your team&apos;s boards, members, and chat.</FlowLead>
      <form
        onSubmit={form.handleSubmit(handleCreateOrganization)}
        className="flex flex-col gap-[15px] mt-[22px]"
      >
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field label="Organization name" hint={fieldState.error?.message}>
              <Input
                {...field}
                autoFocus
                placeholder="Acme Studio"
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />
        <Btn block type="submit" disabled={busy}>
          {busy ? "Creating..." : "Create and continue"}
          <IconRight />
        </Btn>
      </form>
    </FlowShell>
  )
}

export default CreatePage
