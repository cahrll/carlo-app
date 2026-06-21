"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

type DeletionsContextValue = {
  hidden: Set<string>
  hide: (id: string) => void
  unhide: (id: string) => void
}

const DeletionsContext = createContext<DeletionsContextValue | null>(null)

export function DeletionsProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState<Set<string>>(() => new Set())

  const hide = useCallback((id: string) => {
    setHidden((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const unhide = useCallback((id: string) => {
    setHidden((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const value = useMemo(() => ({ hidden, hide, unhide }), [hidden, hide, unhide])

  return (
    <DeletionsContext.Provider value={value}>
      {children}
    </DeletionsContext.Provider>
  )
}

export function useDeletions() {
  const ctx = useContext(DeletionsContext)
  if (!ctx) {
    throw new Error("useDeletions must be used within a DeletionsProvider")
  }
  return ctx
}
