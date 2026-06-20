"use client"

import Link from "next/link"
import { IconBtn } from "@/components/common/pm"
import { IconUser, IconMail, IconLogout } from "@/components/common/icons"
import { useAuth } from "@/context/auth-context"

// account shortcuts shown beside the flow-header version label
export function FlowAccountActions() {
  const { logout } = useAuth()

  return (
    <div className="flex items-center gap-1">
      <IconBtn asChild aria-label="Profile">
        <Link href="/profile">
          <IconUser />
        </Link>
      </IconBtn>
      <IconBtn asChild aria-label="Invites">
        <Link href="/invites">
          <IconMail />
        </Link>
      </IconBtn>
      <IconBtn aria-label="Log out" onClick={() => logout()}>
        <IconLogout />
      </IconBtn>
    </div>
  )
}
