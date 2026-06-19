import * as React from "react"

type P = React.SVGProps<SVGSVGElement>
const S = (sw: number, children: React.ReactNode) => (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} {...p}>
    {children}
  </svg>
)

export const IconBoard = S(1.7, <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18" /></>)
export const IconInbox = S(1.7, <><path d="M3 12h5l2 3h4l2-3h5" /><path d="M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" /></>)
export const IconMembers = S(1.7, <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6" /></>)
export const IconCog = S(1.7, <><circle cx="12" cy="12" r="3" /><path d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.5-2-3.4-2.3 1a7.6 7.6 0 0 0-1.7-1l-.3-2.6h-4l-.3 2.6a7.6 7.6 0 0 0-1.7 1l-2.3-1-2 3.4L4.6 11a7.6 7.6 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7.6 7.6 0 0 0 1.7 1l.3 2.6h4l.3-2.6a7.6 7.6 0 0 0 1.7-1l2.3 1 2-3.4Z" /></>)
export const IconSearch = S(1.8, <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>)
export const IconPlus = S(2, <path d="M12 5v14M5 12h14" />)
export const IconBell = S(1.7, <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>)
export const IconCheck = S(2.3, <path d="M20 6 9 17l-5-5" />)
export const IconCal = S(1.7, <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>)
export const IconChat = S(1.7, <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />)
export const IconClock = S(1.7, <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)
export const IconDots = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
  </svg>
)
export const IconFilter = S(1.7, <path d="M3 5h18l-7 8v6l-4-2v-4Z" />)
export const IconSort = S(1.7, <path d="M3 6h12M3 12h9M3 18h6M17 5v14M17 19l3-3M17 19l-3-3" />)
export const IconGrid = S(1.7, <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>)
export const IconList = S(1.7, <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />)
export const IconMenu = S(1.9, <path d="M3 6h18M3 12h18M3 18h18" />)
export const IconRight = S(1.8, <path d="M5 12h14M13 6l6 6-6 6" />)
export const IconLeft = S(1.8, <path d="M19 12H5M11 6l-6 6 6 6" />)
export const IconX = S(1.9, <path d="M18 6 6 18M6 6l12 12" />)
export const IconMail = S(1.7, <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>)
export const IconUser = S(1.7, <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>)
export const IconLogout = S(1.7, <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>)
export const IconSend = S(1.8, <path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z" />)
export const IconClip = S(1.7, <path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L10 12.6" />)
export const IconHash = S(1.8, <path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18" />)
export const IconTrash = S(1.7, <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />)
export const IconPencil = S(1.7, <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>)
export const IconFlag = S(1.7, <path d="M4 21V4h13l-2 4 2 4H4" />)
export const IconTag = S(1.7, <><path d="M3 7v5l9 9 5-5-9-9Z" /><circle cx="7.5" cy="7.5" r="1.3" /></>)
export const IconCmd = S(1.7, <path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3Z" />)
export const IconLink = S(1.7, <><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></>)
export const IconArrow = S(1.7, <path d="M7 17 17 7M9 7h8v8" />)
export const IconChevron = S(1.9, <path d="m6 9 6 6 6-6" />)
