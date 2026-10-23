import Link from 'next/link'
import { shortDay, weekDays } from '@/lib/dates'
import type { Todo } from '@/lib/types'

/** Seven cells, Mon–Sun. Each fills by the share of that day's to-dos that are done. */
export default function WeekStrip({ weekStart, todos, today, href }: {
  weekStart: string
  todos: Todo[]
  today: string | null
  href?: (day: string) => string
}) {
  return (
    <ol className="grid grid-cols-7 gap-1.5" aria-label="Done per day">
      {weekDays(weekStart).map((day) => {
        const mine = todos.filter((t) => t.date === day)
        const done = mine.filter((t) => t.done).length
        const fill = mine.length ? done / mine.length : 0
        const isToday = day === today
        const cell = (
          <>
            <span className={`relative block h-14 rounded-lg bg-sheet overflow-hidden ${isToday ? 'border-2 border-ink' : 'border border-rule'}`}>
              <span className="absolute inset-x-0 bottom-0 bg-pine/80" style={{ height: `${fill * 100}%` }} />
            </span>
            <span className={`mt-1 block text-center text-[12px] ${isToday ? 'text-ink font-semibold' : 'text-graphite'}`}>
              {shortDay(day).slice(0, 2)}
            </span>
          </>
        )
        const label = `${shortDay(day)}: ${mine.length ? `${done} of ${mine.length} done` : 'nothing planned'}`
        return (
          <li key={day}>
            {href ? <Link href={href(day)} aria-label={label}>{cell}</Link> : <span aria-label={label} role="img">{cell}</span>}
          </li>
        )
      })}
    </ol>
  )
}
