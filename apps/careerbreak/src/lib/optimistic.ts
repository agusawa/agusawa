import type { WeekData } from './types'

export function toggleTodoInWeek(data: WeekData, id: string, done: boolean): WeekData {
  if (!data.todos.some((t) => t.id === id)) return data
  return {
    ...data,
    todos: data.todos.map((t) => (t.id === id ? { ...t, done } : t)),
  }
}

export function toggleGoalInWeek(data: WeekData, id: string, hit: boolean): WeekData {
  if (!data.goals.some((g) => g.id === id)) return data
  return {
    ...data,
    goals: data.goals.map((g) => (g.id === id ? { ...g, hit } : g)),
  }
}
