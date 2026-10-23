'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

const OPTIONS = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  // false during SSR, true after hydration, so the active option matches the client theme
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  if (!mounted) return null

  return (
    <div role="radiogroup" aria-label="Theme" className="flex rounded-lg bg-paper p-0.5 text-sm">
      {OPTIONS.map((o) => (
        <button key={o.value} role="radio" aria-checked={theme === o.value} onClick={() => setTheme(o.value)}
          className={`flex-1 rounded-md px-2 py-1 ${theme === o.value ? 'bg-sheet text-ink shadow-sm' : 'text-graphite hover:text-ink'}`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
