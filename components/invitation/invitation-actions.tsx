"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { acceptInvitation } from "@/lib/services/actions/invitation"
import { Btn } from "@/components/ui/pm"
import { IconCheck } from "@/components/ui/icons"

interface InvitationActionsProps {
  invitationId: string
}

const InvitationActions = ({ invitationId }: InvitationActionsProps) => {
  const router = useRouter()
  const [isAccepting, startAccepting] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAccept() {
    setError(null)
    startAccepting(async () => {
      const result = await acceptInvitation(invitationId)
      if (result.error) {
        setError(result.message ?? "Could not accept the invitation.")
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-end gap-2">
        <Btn size="sm" type="button" disabled={isAccepting} onClick={handleAccept}>
          <IconCheck />
          {isAccepting ? "Accepting..." : "Accept"}
        </Btn>
      </div>
      {error && <p className="text-[11px] text-bad">{error}</p>}
    </div>
  )
}

export default InvitationActions
