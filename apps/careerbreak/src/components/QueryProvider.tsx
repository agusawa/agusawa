'use client'

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useState } from 'react'

const WEEK = 7 * 24 * 60 * 60 * 1000
export const CACHE_KEY = 'careerbreak-cache'

function browserStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined // private mode or blocked storage: run without a saved cache
  }
}

/**
 * Keeps fetched weeks in memory between tabs and saves them to localStorage,
 * so a reload shows the last data at once while it refreshes in the background.
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, gcTime: WEEK, refetchOnWindowFocus: true, retry: 1 },
        },
      }),
  )
  const [persister] = useState(() => createSyncStoragePersister({ storage: browserStorage(), key: CACHE_KEY }))

  return (
    // buster: bump when WeekData's shape changes so old saved caches are dropped
    <PersistQueryClientProvider client={client} persistOptions={{ persister, maxAge: WEEK, buster: 'week-v1' }}>
      {children}
    </PersistQueryClientProvider>
  )
}

/** Drop everything cached for this person, in memory and on disk. Used on sign out. */
export function clearSavedCache(client: QueryClient) {
  client.clear()
  try {
    browserStorage()?.removeItem(CACHE_KEY)
  } catch {
    // storage unavailable; nothing was saved
  }
}
