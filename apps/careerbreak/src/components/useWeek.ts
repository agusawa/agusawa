'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { getWeek } from '@/app/actions'
import { todayLocal, weekStart } from '@/lib/dates'
import type { WeekData } from '@/lib/types'

export function useWeek(ws: string) {
  const [data, setData] = useState<WeekData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setData(await getWeek(ws))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load this week.')
    }
  }, [ws])

  useEffect(() => {
    let live = true
    getWeek(ws).then(
      (d) => live && (setData(d), setError(null)),
      (e) => live && setError(e instanceof Error ? e.message : 'Could not load this week.'),
    )
    return () => { live = false }
  }, [ws])

  return { data: data?.weekStart === ws ? data : null, error, reload }
}

/** The week in ?w=YYYY-MM-DD if it is a valid Monday, else the current week. */
export function useSelectedWeek(): string {
  const w = useSearchParams().get('w')
  if (w && /^\d{4}-\d{2}-\d{2}$/.test(w) && weekStart(w) === w) return w
  return weekStart(todayLocal())
}
