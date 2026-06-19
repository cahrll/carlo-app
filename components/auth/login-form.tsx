"use client"

import { useState } from "react"
import { supabase } from "@/lib/client"
import { FlowShell, FlowTitle, FlowLead } from "@/components/ui/flow"
import { Btn } from "@/components/ui/pm"
import { PmField, PmInput, InputWrap } from "@/components/ui/pm-form"
import { IconMail, IconRight } from "@/components/ui/icons"

const LoginForm = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}` },
      })
      if (error) {
        setMessage("Could not send the magic link. Please try again.")
        setIsSuccess(false)
      } else {
        setMessage("")
        setIsSuccess(true)
      }
    } catch {
      setMessage("Something went wrong. Please try again.")
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <FlowShell>
        <div className="size-[52px] rounded-[13px] bg-acc-t border border-acc/30 grid place-items-center text-acc mb-[18px] [&_svg]:size-6">
          <IconMail />
        </div>
        <FlowTitle>Check your email</FlowTitle>
        <FlowLead>
          We sent a sign-in link to{" "}
          <b className="font-mono text-ink font-medium text-[12.5px]">
            {email}
          </b>
          . Open it on this device to continue. The link expires in 10 minutes.
        </FlowLead>
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-line text-[12px] text-muted-foreground">
          <span>Did not get it? Check spam.</span>
          <button
            type="button"
            onClick={() => setIsSuccess(false)}
            className="text-acc font-medium"
          >
            Use another email
          </button>
        </div>
      </FlowShell>
    )
  }

  return (
    <FlowShell>
      <div className="font-mono text-acc text-[13px] flex items-center gap-2 mb-[14px]">
        carlo login
        <span className="w-[8px] h-[15px] bg-acc inline-block animate-blink" />
      </div>
      <FlowTitle>Sign in to Carlo</FlowTitle>
      <FlowLead>
        Enter your work email and we will send a one-time link. No passwords to
        remember.
      </FlowLead>
      <form
        onSubmit={handleMagicLink}
        className="flex flex-col gap-[15px] mt-[22px]"
      >
        <PmField label="Work email" hint={message || undefined}>
          <InputWrap icon={<IconMail />}>
            <PmInput
              mono
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </InputWrap>
        </PmField>
        <Btn block type="submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send magic link"}
          <IconRight />
        </Btn>
      </form>
      <p className="text-[11px] text-faint text-center mt-4 leading-[1.5]">
        We email you a secure, one-time sign-in link. No passwords, nothing to
        leak.
      </p>
    </FlowShell>
  )
}

export default LoginForm
