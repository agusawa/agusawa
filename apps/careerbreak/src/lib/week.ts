import { weekDays, weekStart } from './dates'
import type { DayEntry, ReviewStats, TagStat, Todo, WeekData } from './types'

export function dayEntries(todos: Todo[], day: string): DayEntry[] {
  return [
    ...todos.filter((t) => t.date === day).map((todo) => ({ todo, moved: false })),
    ...todos.filter((t) => t.plannedDate === day && t.date !== day).map((todo) => ({ todo, moved: true })),
  ]
}

export function stillOpen(todos: Todo[], today: string): Todo[] {
  const ws = weekStart(today)
  return todos.filter((t) => !t.done && t.date < today && weekStart(t.date) === ws)
}

export function linkedDone(todos: Todo[], goalId: number): number {
  return todos.filter((t) => t.done && t.goalId === goalId).length
}

export function reviewStats(data: WeekData): ReviewStats {
  const days = weekDays(data.weekStart)
  const inWeek = data.todos.filter((t) => days.includes(t.date))
  const byTag: TagStat[] = data.tags
    .map((tag) => {
      const mine = inWeek.filter((t) => t.tagId === tag.id)
      const done = mine.filter((t) => t.done).length
      return { tag, done, total: mine.length, pct: mine.length ? Math.round((done / mine.length) * 100) : 0 }
    })
    .filter((s) => s.total > 0)
    .sort((a, b) => b.total - a.total)
  return {
    done: inWeek.filter((t) => t.done).length,
    total: inWeek.length,
    moved: inWeek.filter((t) => t.plannedDate !== t.date).length,
    byTag,
    perDay: days.map((d) => inWeek.filter((t) => t.done && t.date === d).length),
    goals: data.goals.map((goal) => ({ goal, linkedDone: linkedDone(inWeek, goal.id) })),
  }
}
