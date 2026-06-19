"use client"

import * as React from "react"

type CommandStore = {
  open: boolean
  setOpen: (v: boolean) => void
  toggle: () => void
}

const Ctx = React.createContext<CommandStore | null>(null)

export function CommandStoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const toggle = React.useCallback(() => setOpen((o) => !o), [])
  return (
    <Ctx.Provider value={{ open, setOpen, toggle }}>{children}</Ctx.Provider>
  )
}

export function useCommandStore() {
  const ctx = React.useContext(Ctx)
  if (!ctx)
    throw new Error("useCommandStore must be used within CommandStoreProvider")
  return ctx
}
