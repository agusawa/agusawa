'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { getWeek } from '@/app/actions'
import { todayLocal, weekStart } from '@/lib/dates'

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

/** The week in ?w=YYYY-MM-DD if it is a valid Monday, else the current week. */
export function useSelectedWeek(): string {
  const w = useSearchParams().get('w')
  if (w && /^\d{4}-\d{2}-\d{2}$/.test(w) && weekStart(w) === w) return w
  return weekStart(todayLocal())
}
