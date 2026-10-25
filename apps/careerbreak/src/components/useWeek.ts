'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { getWeek, updateGoal, updateTodo } from '@/app/actions'
import { todayLocal, weekStart } from '@/lib/dates'
import { toggleGoalInWeek, toggleTodoInWeek } from '@/lib/optimistic'
import type { WeekData } from '@/lib/types'

export const weekKey = (ws: string) => ['week', ws] as const

/**
 * One week of data, cached per week. Revisiting a week shows the cached copy at once
 * and refreshes it in the background.
 */
export function useWeek(ws: string) {
  const client = useQueryClient()
  const query = useQuery({ queryKey: weekKey(ws), queryFn: () => getWeek(ws) })

  // Any save can touch other weeks (tags are shared, notes show on the next week), so refresh them all.
  const reload = useCallback(() => client.invalidateQueries({ queryKey: ['week'] }), [client])

  return {
    data: query.data ?? null,
    // A failed background refresh keeps showing the cached week; only report errors when there's nothing to show.
    error: query.error && !query.data ? 'Could not load this week. Check your connection and try again.' : null,
    reload,
  }
}

/** Optimistically toggles a to-do's done status in query cache with rollback on failure. */
export function useToggleTodo() {
  const client = useQueryClient()
  const mutation = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      await updateTodo(id, { done })
    },
    onMutate: async ({ id, done }) => {
      await client.cancelQueries({ queryKey: ['week'] })
      const previousWeeks = client.getQueriesData<WeekData>({ queryKey: ['week'] })
      client.setQueriesData<WeekData>({ queryKey: ['week'] }, (old) => {
        if (!old) return old
        return toggleTodoInWeek(old, id, done)
      })
      return { previousWeeks }
    },
    onError: (_err, _vars, context) => {
      context?.previousWeeks?.forEach(([key, data]) => {
        client.setQueryData(key, data)
      })
      if (typeof window !== 'undefined') {
        alert('That didn’t save. Check your connection and try again.')
      }
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: ['week'] })
    },
  })

  return {
    toggleTodo: mutation.mutate,
    isPending: mutation.isPending,
  }
}

/** Optimistically toggles a weekly goal's hit status in query cache with rollback on failure. */
export function useToggleGoal() {
  const client = useQueryClient()
  const mutation = useMutation({
    mutationFn: async ({ id, hit }: { id: string; hit: boolean }) => {
      await updateGoal(id, { hit })
    },
    onMutate: async ({ id, hit }) => {
      await client.cancelQueries({ queryKey: ['week'] })
      const previousWeeks = client.getQueriesData<WeekData>({ queryKey: ['week'] })
      client.setQueriesData<WeekData>({ queryKey: ['week'] }, (old) => {
        if (!old) return old
        return toggleGoalInWeek(old, id, hit)
      })
      return { previousWeeks }
    },
    onError: (_err, _vars, context) => {
      context?.previousWeeks?.forEach(([key, data]) => {
        client.setQueryData(key, data)
      })
      if (typeof window !== 'undefined') {
        alert('That didn’t save. Check your connection and try again.')
      }
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: ['week'] })
    },
  })

  return {
    toggleGoal: mutation.mutate,
    isPending: mutation.isPending,
  }
}

/** The week in ?w=YYYY-MM-DD if it is a valid Monday, else the current week. */
export function useSelectedWeek(): string {
  const w = useSearchParams().get('w')
  if (w && /^\d{4}-\d{2}-\d{2}$/.test(w) && weekStart(w) === w) return w
  return weekStart(todayLocal())
}

