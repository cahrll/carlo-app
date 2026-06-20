"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { useRouter } from "next/navigation"
import { createOrganizationSchema } from "@/lib/schemas/organizations"
import { createOrganization } from "@/lib/services/actions/organization"
import { FlowShell, FlowTitle, FlowLead } from "@/components/common/flow"
import { Btn } from "@/components/common/pm"
import { PmField, PmInput } from "@/components/common/pm-form"
import { IconRight } from "@/components/common/icons"

type FormData = z.infer<typeof createOrganizationSchema>

const CreatePage = () => {
  const router = useRouter()

  const form = useForm<FormData>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "" },
  })

  async function handleCreateOrganization(data: FormData) {
    const { error } = await createOrganization(data)
    if (!error) router.push("/")
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
            <PmField label="Organization name" hint={fieldState.error?.message}>
              <PmInput
                {...field}
                autoFocus
                placeholder="Acme Studio"
                aria-invalid={fieldState.invalid}
              />
            </PmField>
          )}
        />
        <Btn block type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Create and continue"}
          <IconRight />
        </Btn>
      </form>
    </FlowShell>
  )
}

export default CreatePage
