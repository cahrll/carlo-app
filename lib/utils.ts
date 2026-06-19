import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// e.g. "Jun 6"
export function formatShort(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

// within `days` ahead, or up to a day overdue
export function isDueSoon(date?: string | null, days = 3) {
  if (!date) return false
  const due = new Date(date).getTime()
  const now = Date.now()
  const diff = due - now
  return diff <= days * 86_400_000 && diff >= -86_400_000
}

// "2h ago", "yesterday", etc.
export function timeAgo(date: string) {
  const then = new Date(date).getTime()
  const mins = Math.round((Date.now() - then) / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return formatShort(date)
}

// e.g. "9:01"
export function formatTime(date: string) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function isSameDay(a: string, b: string) {
  const x = new Date(a)
  const y = new Date(b)
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  )
}

// "Today", "Yesterday", "Jun 6", or "June 6, 2025"
export function formatDayLabel(date: string) {
  const d = new Date(date)
  const now = new Date()
  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (d.getFullYear() === now.getFullYear()) return formatShort(date)
  return formatDate(date)
}

// e.g. "#a1b2"
export function shortId(id: string) {
  return '#' + id.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase()
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}