import * as React from "react"
import { cn } from "@/lib/utils"

export function getInitials(name?: string | null): string {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// stable hue from a key
export function nameHue(key?: string | null): number {
  if (!key) return 232
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 360
  return h
}

type Props = {
  name?: string | null
  /** stable key for the hue; falls back to name */
  hueKey?: string | null
  size?: number
  online?: boolean
  /** render in the brand accent color (e.g. to flag the current user) */
  accent?: boolean
  title?: string
  className?: string
  style?: React.CSSProperties
}

export function UserAvatar({
  name,
  hueKey,
  size = 26,
  online = false,
  accent = false,
  title,
  className,
  style,
}: Props) {
  const hue = nameHue(hueKey ?? name)
  return (
    <span
      className={cn(
        "shrink-0 grid place-items-center rounded-full text-[10px] font-bold leading-none [&_svg]:size-[14px]",
        className
      )}
      title={title ?? name ?? undefined}
      style={{
        width: size,
        height: size,
        background: accent ? "var(--acc)" : `oklch(0.68 0.12 ${hue})`,
        color: accent ? "var(--acc-on)" : "oklch(0.16 0.02 262)",
        boxShadow: online
          ? "0 0 0 2px var(--bg1), 0 0 0 3.6px var(--ok)"
          : undefined,
        ...style,
      }}
    >
      {getInitials(name)}
    </span>
  )
}

export function AvatarStack({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex [&>*]:ring-2 [&>*]:ring-bg1 [&>*:not(:first-child)]:-ml-[7px]",
        className
      )}
      {...props}
    />
  )
}
