import { toggleGoalInWeek, toggleTodoInWeek } from '@/lib/optimistic'
import type { Goal, Tag, Todo, WeekData } from '@/lib/types'

const tag: Tag = { id: 't1', name: 'work', color: '#000' }
const goal: Goal = { id: 'g1', weekStart: '2026-10-26', title: 'Goal 1', tagId: 't1', hit: false }
const todo: Todo = { id: 'td1', date: '2026-10-26', plannedDate: '2026-10-26', title: 'Task 1', tagId: 't1', goalId: 'g1', done: false }

const mockWeek: WeekData = {
  weekStart: '2026-10-26',
  tags: [tag],
  goals: [goal],
  todos: [todo],
  notes: null,
  prevNotes: null,
}

describe('optimistic cache transformations', () => {
  it('toggles a todo done state immutably', () => {
    const next = toggleTodoInWeek(mockWeek, 'td1', true)
    expect(next.todos[0].done).toBe(true)
    expect(mockWeek.todos[0].done).toBe(false)
  })

  it('safely handles non-existent todo id', () => {
    const next = toggleTodoInWeek(mockWeek, 'unknown', true)
    expect(next).toEqual(mockWeek)
  })

  it('toggles a goal hit state immutably', () => {
    const next = toggleGoalInWeek(mockWeek, 'g1', true)
    expect(next.goals[0].hit).toBe(true)
    expect(mockWeek.goals[0].hit).toBe(false)
  })

  it('safely handles non-existent goal id', () => {
    const next = toggleGoalInWeek(mockWeek, 'unknown', true)
    expect(next).toEqual(mockWeek)
  })
})
