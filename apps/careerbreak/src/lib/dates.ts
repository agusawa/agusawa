// All dates are 'YYYY-MM-DD' strings. Math runs in UTC so the server timezone never shifts a day.

export const BREAK_START = '2026-10-19'

const DAY_MS = 86_400_000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function toUtc(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function fromUtc(dt: Date): string {
  return dt.toISOString().slice(0, 10)
}

function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / DAY_MS)
}

export function addDays(date: string, n: number): string {
  return fromUtc(new Date(toUtc(date).getTime() + n * DAY_MS))
}

export function weekStart(date: string): string {
  const dow = toUtc(date).getUTCDay() // 0 = Sunday
  return addDays(date, -((dow + 6) % 7))
}

export function weekDays(start: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function weekNumber(start: string): number {
  return Math.floor(daysBetween(BREAK_START, start) / 7) + 1
}

export function breakDay(today: string): number | null {
  const n = daysBetween(BREAK_START, today)
  return n < 0 ? null : n + 1
}

export function todayLocal(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatDay(date: string): string {
  const dt = toUtc(date)
  return `${DAYS[dt.getUTCDay()]}, ${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()]}`
}

export function shortDay(date: string): string {
  return DAYS[toUtc(date).getUTCDay()].slice(0, 3)
}

function dayMonth(date: string): string {
  const dt = toUtc(date)
  return `${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()]}`
}

export function formatRange(start: string): string {
  return `${dayMonth(start)} – ${dayMonth(addDays(start, 6))}`
}
