'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { addDays, formatRange, weekNumber } from '@/lib/dates'

export default function WeekNav({ weekStart }: { weekStart: string }) {
  const router = useRouter()
  const path = usePathname()
  const go = (n: number) => router.push(`${path}?w=${addDays(weekStart, n * 7)}`)
  const btn = 'p-2 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'
  return (
    <div className="flex items-center justify-between my-4">
      <button onClick={() => go(-1)} className={btn} aria-label="Previous week"><ChevronLeft size={18} /></button>
      <div className="text-sm font-semibold">
        Week {weekNumber(weekStart)} <span className="font-normal text-zinc-500">· {formatRange(weekStart)}</span>
      </div>
      <button onClick={() => go(1)} className={btn} aria-label="Next week"><ChevronRight size={18} /></button>
    </div>
  )
}
