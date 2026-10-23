'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { addDays, formatRange, weekNumber } from '@/lib/dates'

export default function WeekNav({ weekStart }: { weekStart: string }) {
  const router = useRouter()
  const path = usePathname()
  const go = (n: number) => router.push(`${path}?w=${addDays(weekStart, n * 7)}`)
  const n = weekNumber(weekStart)
  const btn = 'p-2.5 rounded-lg text-graphite hover:text-ink hover:bg-rule/50'
  return (
    <div className="flex items-end justify-between gap-2 mb-6">
      <h1 className="leading-tight">
        <span className="block text-[2.5rem] sm:text-[3rem] font-extrabold tracking-[-0.035em]">{n >= 1 ? `Week ${n}` : 'Before the break'}</span>
        <span className="block text-[15px] text-graphite">{formatRange(weekStart)}</span>
      </h1>
      <div className="flex gap-1 pb-1">
        <button onClick={() => go(-1)} className={btn} aria-label="Previous week"><ChevronLeft size={22} /></button>
        <button onClick={() => go(1)} className={btn} aria-label="Next week"><ChevronRight size={22} /></button>
      </div>
    </div>
  )
}
