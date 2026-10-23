'use client'

import { useQueryClient } from '@tanstack/react-query'
import { CalendarDays, ChartNoAxesColumn, CircleCheck, Menu } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { breakDay, formatDay } from '@/lib/dates'
import { signOutClient } from '@/lib/firebaseClient'
import { clearSavedCache } from './QueryProvider'
import ThemeToggle from './ThemeToggle'
import { useToday } from './useToday'

const TABS = [
  { href: '/', label: 'Today', icon: CircleCheck },
  { href: '/week', label: 'Week', icon: CalendarDays },
  { href: '/review', label: 'Review', icon: ChartNoAxesColumn },
]

const isActive = (path: string, href: string) => (href === '/' ? path === '/' : path.startsWith(href))

export default function Header() {
  const path = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
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
    clearSavedCache(queryClient)
    router.replace('/login')
    router.refresh()
  }

  // Today has its own big counter; other pages get a small one here.
  const context = !today ? '' : path === '/' ? formatDay(today) : day ? `Day ${day} of your career break` : 'Your break starts Monday'

  return (
    <>
      <header className="flex items-center justify-between gap-3 mb-4 sm:mb-8">
        <p className="text-[15px] text-graphite min-h-6">{context}</p>
        <div className="flex items-center gap-1">
          <nav className="hidden sm:flex gap-1 mr-2" aria-label="Sections">
            {TABS.map((t) => (
              <Link key={t.href} href={t.href} aria-current={isActive(path, t.href) ? 'page' : undefined}
                className={`rounded-lg px-3 py-1.5 text-[15px] ${isActive(path, t.href) ? 'bg-sheet text-ink font-semibold shadow-sm' : 'text-graphite hover:text-ink'}`}>
                {t.label}
              </Link>
            ))}
          </nav>
          <div ref={ref} className="relative">
            <button onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open}
              className="p-2.5 rounded-lg text-graphite hover:text-ink hover:bg-rule/50">
              <Menu size={20} />
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-1 w-56 z-50 rounded-xl border border-rule bg-sheet shadow-lg p-2 flex flex-col gap-1 text-[15px]">
                <Link href="/settings" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-paper">Manage tags</Link>
                <div className="px-1 py-1"><ThemeToggle /></div>
                <button onClick={signOut} className="text-left px-3 py-2 rounded-lg hover:bg-paper text-flag">Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Phones: tabs sit at the bottom, within thumb reach. */}
      <nav aria-label="Sections"
        className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-sheet/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-[40rem] mx-auto grid grid-cols-3">
          {TABS.map((t) => {
            const on = isActive(path, t.href)
            const Icon = t.icon
            return (
              <Link key={t.href} href={t.href} aria-current={on ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[12px] ${on ? 'text-pine font-semibold' : 'text-graphite'}`}>
                <Icon size={22} strokeWidth={on ? 2.25 : 1.75} />
                {t.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
