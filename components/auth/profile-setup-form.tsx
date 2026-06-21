"use client"

import { useState } from "react"
import { useRouter } from "nextjs-toploader/app"
import { setupProfile } from "@/lib/services/actions/profile"
import { FlowShell, FlowTitle, FlowLead } from "@/components/common/flow"
import { Btn } from "@/components/common/ui-elements"
import { Field, Input } from "@/components/common/form"
import { UserAvatar } from "@/components/common/user-avatar"
import { IconRight } from "@/components/common/icons"

const ProfileSetupForm = () => {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsLoading(true)
    try {
      await setupProfile(name)
    } catch {
    } finally {
      router.push("/")
    }
  }

  return (
    <FlowShell>
      <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-faint mb-[14px]">
        Step 1 of 1 · Set up your profile
      </div>
      <FlowTitle>Welcome to Carlo</FlowTitle>
      <FlowLead>This is how teammates will see you on boards and in chat.</FlowLead>
      <form onSubmit={handleSetup} className="flex flex-col gap-[15px] mt-[22px]">
        <div className="flex items-center gap-[14px]">
          <UserAvatar name={name || "You"} size={56} className="text-[18px]" />
        </div>
        <Field label="Display name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            required
          />
        </Field>
        <Btn block type="submit" disabled={isLoading}>
          {isLoading ? "Setting up..." : "Continue"}
          <IconRight />
        </Btn>
      </form>
    </FlowShell>
  )
}

export default ProfileSetupForm
