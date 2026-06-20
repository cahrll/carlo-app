"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { setupProfile } from "@/lib/services/actions/profile"
import { FlowShell, FlowTitle, FlowLead } from "@/components/ui/flow"
import { Btn } from "@/components/ui/pm"
import { PmField, PmInput } from "@/components/ui/pm-form"
import { UserAvatar } from "@/components/ui/user-avatar"
import { IconRight } from "@/components/ui/icons"

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
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
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
        <PmField label="Display name">
          <PmInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            required
          />
        </PmField>
        <Btn block type="submit" disabled={isLoading}>
          {isLoading ? "Setting up..." : "Continue"}
          <IconRight />
        </Btn>
      </form>
    </FlowShell>
  )
}

export default ProfileSetupForm
