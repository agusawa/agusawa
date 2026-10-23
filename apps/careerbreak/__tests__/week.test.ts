import { dayEntries, linkedDone, reviewStats, stillOpen } from '@/lib/week'
import type { Goal, Tag, Todo, WeekData } from '@/lib/types'

const learning: Tag = { id: 1, name: 'learning', color: '#4a7cff' }
const freelance: Tag = { id: 2, name: 'freelance', color: '#3a8a5c' }
const unused: Tag = { id: 3, name: 'unused', color: '#c55050' }

const goal: Goal = { id: 10, weekStart: '2026-10-26', title: 'Send 5 pitches', tagId: 2, hit: false }

const todo = (t: Partial<Todo> & Pick<Todo, 'id' | 'date'>): Todo => ({
  plannedDate: t.date, title: `t${t.id}`, tagId: 1, goalId: null, done: false, ...t,
})

// Moved Mon → Thu and done there; undone Tue; done Wed.
const moved = todo({ id: 1, plannedDate: '2026-10-26', date: '2026-10-29', done: true, tagId: 2, goalId: 10 })
const tue = todo({ id: 2, date: '2026-10-27' })
const wed = todo({ id: 3, date: '2026-10-28', done: true })
const todos = [moved, tue, wed]

const week = (t: Todo[], g: Goal[] = [goal]): WeekData => ({
  weekStart: '2026-10-26', tags: [learning, freelance, unused], goals: g, todos: t, notes: null, prevNotes: null,
})

describe('dayEntries', () => {
  it('shows a moved to-do as moved on its original day', () => {
    expect(dayEntries(todos, '2026-10-26')).toEqual([{ todo: moved, moved: true }])
  })
  it('shows a moved to-do normally on its new day', () => {
    expect(dayEntries(todos, '2026-10-29')).toEqual([{ todo: moved, moved: false }])
  })
})

describe('stillOpen', () => {
  it('lists undone to-dos from earlier this week', () => {
    expect(stillOpen(todos, '2026-10-29')).toEqual([tue])
  })
  it('starts each week clean', () => {
    expect(stillOpen(todos, '2026-11-02')).toEqual([])
  })
})

it('linkedDone counts done to-dos linked to a goal', () => {
  expect(linkedDone(todos, 10)).toBe(1)
})

describe('reviewStats', () => {
  it('counts a moved to-do once, on its current day', () => {
    const s = reviewStats(week(todos))
    expect(s.total).toBe(3)
    expect(s.done).toBe(2)
    expect(s.moved).toBe(1)
    expect(s.perDay).toEqual([0, 0, 1, 1, 0, 0, 0])
  })

  it('groups by tag, largest first, skipping unused tags', () => {
    const s = reviewStats(week(todos))
    expect(s.byTag.map((b) => [b.tag.name, b.done, b.total, b.pct])).toEqual([
      ['learning', 1, 2, 50],
      ['freelance', 1, 1, 100],
    ])
  })

  it('reports linked done count per goal', () => {
    expect(reviewStats(week(todos)).goals).toEqual([{ goal, linkedDone: 1 }])
  })

  it('handles an empty week without NaN', () => {
    const s = reviewStats(week([], []))
    expect(s).toEqual({ done: 0, total: 0, moved: 0, byTag: [], perDay: [0, 0, 0, 0, 0, 0, 0], goals: [] })
    expect(JSON.stringify(s)).not.toContain('null')
  })

  it('ignores to-dos that only planned in this week but now sit outside it', () => {
    const out = todo({ id: 4, plannedDate: '2026-11-01', date: '2026-11-02' })
    expect(reviewStats(week([out])).total).toBe(0)
  })
})
