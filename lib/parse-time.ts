/**
 * Deterministic time parsing. Jev decides *whether* the user wants to send
 * later; code works out *when*, because dates have a correct answer.
 */
const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

export function parseTime(text: string, now = new Date()): Date | null {
  const lower = text.toLowerCase()
  const date = new Date(now)
  let found = false

  if (/\btomorrow\b/.test(lower)) {
    date.setDate(date.getDate() + 1)
    date.setHours(9, 0, 0, 0)
    found = true
  } else if (/\btonight\b/.test(lower)) {
    date.setHours(20, 0, 0, 0)
    found = true
  } else {
    const weekday = WEEKDAYS.findIndex((d) => new RegExp(`\\b${d}\\b`).test(lower))
    if (weekday >= 0) {
      const delta = (weekday - date.getDay() + 7) % 7 || 7
      date.setDate(date.getDate() + delta)
      date.setHours(9, 0, 0, 0)
      found = true
    }
  }

  const time = lower.match(/\bat (\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/)
  if (time) {
    let hours = Number(time[1])
    const minutes = Number(time[2] ?? 0)
    if (time[3] === "pm" && hours < 12) hours += 12
    if (time[3] === "am" && hours === 12) hours = 0
    if (!time[3] && hours < 7) hours += 12
    date.setHours(hours, minutes, 0, 0)
    if (!found && date <= now) date.setDate(date.getDate() + 1)
    found = true
  }

  if (found) return date

  // Relative times only count when there's no absolute one
  // ("standup in 5 min… send tomorrow at 8:55" means tomorrow).
  const relative = lower.match(/\bin (\d+) (minute|min|hour|hr)s?\b/)
  if (relative) {
    const n = Number(relative[1])
    date.setMinutes(date.getMinutes() + (relative[2].startsWith("h") ? n * 60 : n))
    return date
  }
  return null
}

export function formatWhen(date: Date) {
  return date.toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  })
}
