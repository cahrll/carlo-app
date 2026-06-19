import React from "react"

// pass-through: these flows render their own FlowShell
const layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export default layout
