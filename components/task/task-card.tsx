"use client"

import * as React from "react"
import { Task } from "@/lib/types"
import { cn } from "@/lib/utils"
import { formatShort, isDueSoon, shortId } from "@/lib/utils"
import { priorityMeta } from "@/lib/board-ui"
import { UserAvatar } from "@/components/ui/user-avatar"
import { IconCheck, IconCal, IconChat, IconUser } from "@/components/ui/icons"

type Props = {
  task: Task
  done?: boolean
  onOpen?: () => void
  innerRef?: (node: HTMLElement | null) => void
  dragProps?: React.HTMLAttributes<HTMLDivElement>
  style?: React.CSSProperties
  dragging?: boolean
  pending?: boolean
  overlay?: boolean
}

export function TaskCard({
  task,
  done,
  onOpen,
  innerRef,
  dragProps,
  style,
  dragging,
  pending,
  overlay,
}: Props) {
  const pm = priorityMeta(task.priority)
  const soon = isDueSoon(task.due_date)
  const cmt = task.comment_count ?? 0

  return (
    <div
      ref={innerRef}
      style={style}
      onClick={onOpen}
      {...dragProps}
      className={cn(
        "bg-bg3 border border-line rounded-md p-[11px] transition-[transform,border-color,box-shadow] duration-150 ease-precision",
        onOpen && "cursor-pointer",
        "hover:-translate-y-[2px] hover:border-acc hover:shadow-[0_10px_22px_-14px_oklch(0_0_0/0.7)]",
        pending && "opacity-60",
        dragging && "opacity-50",
        overlay &&
          "shadow-[0_18px_40px_-18px_oklch(0_0_0/0.8)] cursor-grabbing rotate-[0.5deg]"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {done ? (
          <span className="inline-flex items-center gap-[6px] font-mono text-[10px] uppercase tracking-[0.04em] text-ok [&_svg]:size-3">
            <IconCheck />
            <span>Done</span>
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-[6px] font-mono text-[10px] uppercase tracking-[0.04em]",
              pm.text
            )}
          >
            <span className={cn("size-[7px] rounded-[2px]", pm.dot)} />
            <span>{pm.label}</span>
          </span>
        )}
        <span className="ml-auto font-mono text-[10.5px] text-faint">
          {shortId(task.id)}
        </span>
      </div>

      <div
        className={cn(
          "text-[13px] font-medium leading-[1.34]",
          done ? "text-muted-foreground" : "text-ink"
        )}
      >
        {task.title}
      </div>

      <div className="flex items-center gap-[9px] mt-[11px]">
        {task.assignee_name ? (
          <UserAvatar
            name={task.assignee_name}
            hueKey={task.assignee_id}
            size={22}
          />
        ) : (
          <span className="grid place-items-center size-[22px] rounded-full bg-bg2 border border-line text-faint [&_svg]:size-[13px]">
            <IconUser />
          </span>
        )}
        <span className="ml-auto flex items-center gap-[11px] font-mono text-[11px] text-muted-foreground [&_svg]:size-[13px] [&_svg]:opacity-80">
          {task.due_date && (
            <span className={cn("inline-flex items-center gap-1", soon && "text-bad")}>
              <IconCal />
              {formatShort(task.due_date)}
            </span>
          )}
          {cmt > 0 && (
            <span className="inline-flex items-center gap-1">
              <IconChat />
              {cmt}
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
