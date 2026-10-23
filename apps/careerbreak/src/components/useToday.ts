'use client'

import { useSyncExternalStore } from 'react'
import { todayLocal } from '@/lib/dates'
import { subscribeToday } from '@/lib/today'

// visibilitychange fires on document, focus on window; listen on both.
const subscribe = (cb: () => void) => {
  const offDoc = subscribeToday(cb, document)
  const offWin = subscribeToday(cb, window)
  return () => { offDoc(); offWin() }
}

/** Browser-local date that rolls over at midnight; null during SSR so server and client markup match. */
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, todayLocal, () => null)
}
