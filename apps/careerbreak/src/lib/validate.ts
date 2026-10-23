import { weekStart } from './dates'

function text(s: unknown, label: string, max: number): string {
  if (typeof s !== 'string') throw new Error(`${label} is required.`)
  const t = s.trim()
  if (!t) throw new Error(`${label} is required.`)
  if (t.length > max) throw new Error(`${label} must be ${max} characters or fewer.`)
  return t
}

export const cleanTitle = (s: unknown) => text(s, 'Title', 200)
export const cleanTagName = (s: unknown) => text(s, 'Tag name', 30)

export function assertDate(s: unknown): string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error('Invalid date.')
  const d = new Date(`${s}T00:00:00Z`)
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) throw new Error('Invalid date.')
  return s
}

export function assertGoalWeek(goalWeekStart: string, todoDate: string): void {
  if (weekStart(todoDate) !== goalWeekStart) throw new Error('That goal belongs to a different week.')
}

export function cleanNote(s: unknown): string {
  if (typeof s !== 'string') return ''
  if (s.length > 5000) throw new Error('Note must be 5000 characters or fewer.')
  return s
}
