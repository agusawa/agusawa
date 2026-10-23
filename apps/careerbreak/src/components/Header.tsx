'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { breakDay } from '@/lib/dates'
import { signOutClient } from '@/lib/firebaseClient'
import ThemeToggle from './ThemeToggle'
import { useToday } from './useToday'

const TABS = [
  { href: '/', label: 'Today' },
  { href: '/week', label: 'Week' },
  { href: '/review', label: 'Review' },
]

export default function Header() {
  const path = usePathname()
  const router = useRouter()
  const today = useToday()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const day = today ? breakDay(today) : null

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  async function signOut() {
    await fetch('/api/session', { method: 'DELETE' })
    await signOutClient().catch(() => {})
    router.replace('/login')
    router.refresh()
  }

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-[15px] min-h-6">
          {today && (day ? <>Day {day} <span className="font-normal text-zinc-500">of your career break</span></> : 'Starts Monday')}
        </p>
        <div ref={ref} className="relative">
          <button onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open}
            className="p-2 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900">
            <Menu size={18} />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 w-44 z-50 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg p-2 flex flex-col gap-1 text-sm">
              <Link href="/settings" onClick={() => setOpen(false)} className="px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900">Tags</Link>
              <div className="px-2 py-1 flex items-center justify-between"><span className="text-zinc-500">Theme</span><ThemeToggle /></div>
              <button onClick={signOut} className="text-left px-2 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 text-red-600 dark:text-red-400">Sign out</button>
            </div>
          )}
        </div>
      </div>
      <nav className="flex gap-5 mt-2 text-sm">
        {TABS.map((t) => {
          const on = t.href === '/' ? path === '/' : path.startsWith(t.href)
          return (
            <Link key={t.href} href={t.href}
              className={on ? 'font-semibold underline underline-offset-8 decoration-2' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}>
              {t.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
