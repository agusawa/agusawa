export type Tag = { id: number; name: string; color: string }
export type Goal = { id: number; weekStart: string; title: string; tagId: number; hit: boolean }
export type Todo = {
  id: number
  date: string
  plannedDate: string
  title: string
  tagId: number
  goalId: number | null
  done: boolean
}
export type WeekNotes = { weekStart: string; wentWell: string; improve: string }
export type WeekData = {
  weekStart: string
  tags: Tag[]
  goals: Goal[]
  todos: Todo[]
  notes: WeekNotes | null
  prevNotes: WeekNotes | null
}
/** moved = shown on its original day after being moved to a later one */
export type DayEntry = { todo: Todo; moved: boolean }
export type TagStat = { tag: Tag; done: number; total: number; pct: number }
export type ReviewStats = {
  done: number
  total: number
  moved: number
  byTag: TagStat[]
  perDay: number[]
  goals: { goal: Goal; linkedDone: number }[]
}
