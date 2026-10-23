'use client'

import { useSyncExternalStore } from 'react'
import { todayLocal } from '@/lib/dates'

/** Browser-local date; null during SSR so server and client markup match. */
export function useToday(): string | null {
  return useSyncExternalStore(() => () => {}, todayLocal, () => null)
}
