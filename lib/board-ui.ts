export type PriorityMeta = {
  key: "high" | "med" | "low"
  label: string
  pill: "bad" | "warn" | "idle"
  text: string
  dot: string
}

export function priorityMeta(priority?: string): PriorityMeta {
  switch (priority) {
    case "high":
      return { key: "high", label: "High", pill: "bad", text: "text-bad", dot: "bg-bad" }
    case "low":
      return { key: "low", label: "Low", pill: "idle", text: "text-faint", dot: "bg-faint" }
    default:
      return { key: "med", label: "Med", pill: "warn", text: "text-warn", dot: "bg-warn" }
  }
}

// status dot color, by section title then index
export function sectionDot(title: string, index: number): string {
  const t = title.toLowerCase()
  if (/done|complete|shipped/.test(t)) return "var(--ok)"
  if (/progress|doing|active/.test(t)) return "var(--warn)"
  if (/test|review|qa/.test(t)) return "var(--acc)"
  if (/todo|to do|backlog|new/.test(t)) return "var(--faint)"
  const palette = ["var(--faint)", "var(--warn)", "var(--acc)", "var(--ok)"]
  return palette[index % palette.length]
}

export function isDoneSection(title: string) {
  return /done|complete|shipped/i.test(title)
}

// counts + latest task activity from a section(task(updated_at)) embed
export function computeBoardProgress(
  sections:
    | { title: string; task?: { updated_at: string }[] | null }[]
    | null
    | undefined
) {
  let total = 0
  let done = 0
  let lastActivity: string | null = null
  for (const s of sections ?? []) {
    const tasks = s.task ?? []
    total += tasks.length
    if (isDoneSection(s.title)) done += tasks.length
    for (const t of tasks) {
      if (
        t.updated_at &&
        (!lastActivity ||
          new Date(t.updated_at).getTime() > new Date(lastActivity).getTime())
      ) {
        lastActivity = t.updated_at
      }
    }
  }
  return { total, done, lastActivity }
}

export function newerTime(a: string, b?: string | null): string {
  if (!b) return a
  return new Date(b).getTime() > new Date(a).getTime() ? b : a
}
