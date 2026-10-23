'use client'

import { Plus } from 'lucide-react'
import { Suspense, useState } from 'react'
import AddTodo from '@/components/AddTodo'
import GoalList from '@/components/GoalList'
import ImproveNote from '@/components/ImproveNote'
import TodoItem from '@/components/TodoItem'
import { useToday } from '@/components/useToday'
import { useSelectedWeek, useWeek } from '@/components/useWeek'
import WeekNav from '@/components/WeekNav'
import WeekStrip from '@/components/WeekStrip'
import { formatDay, weekDays } from '@/lib/dates'
import type { WeekData } from '@/lib/types'
import { dayEntries } from '@/lib/week'

export default function WeekPage() {
  const today = useToday()
  return today ? <Suspense><Week today={today} /></Suspense> : null
}

function Week({ today }: { today: string }) {
  const ws = useSelectedWeek()
  const { data, error, reload } = useWeek(ws)
  return (
    <>
      <WeekNav weekStart={ws} />
      {error && <p className="text-[15px] text-flag">{error}</p>}
      {!data && !error && <p className="text-[15px] text-graphite">Loading the week…</p>}
      {data && (
        <>
          <WeekStrip weekStart={ws} todos={data.todos} today={today} href={(d) => `#day-${d}`} />
          <ImproveNote text={data.prevNotes?.improve} />
          <GoalList weekStart={ws} data={data} onChange={reload} heading="Goals" />
          <div className="mt-8">
            {weekDays(ws).map((day) => <Day key={day} day={day} isToday={day === today} data={data} reload={reload} />)}
          </div>
        </>
      )}
    </>
  )
}

function Day({ day, isToday, data, reload }: { day: string; isToday: boolean; data: WeekData; reload: () => void }) {
  const [adding, setAdding] = useState(false)
  const entries = dayEntries(data.todos, day)
  return (
    <section id={`day-${day}`} className="scroll-mt-6 border-t border-rule py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-semibold">
          {formatDay(day)}
          {isToday && <span className="ml-2 rounded-md bg-pine-soft px-2 py-0.5 text-[13px] font-semibold text-pine align-middle">Today</span>}
        </h2>
        {!adding && (
          <button className="p-2 -mr-2 rounded-lg text-graphite hover:text-ink hover:bg-rule/50" aria-label={`Add a to-do on ${formatDay(day)}`}
            onClick={() => setAdding(true)}>
            <Plus size={20} />
          </button>
        )}
      </div>
      {entries.length > 0 && (
        <ul className="mt-1">{entries.map((e) => <TodoItem key={`${e.todo.id}-${e.moved}`} entry={e} tags={data.tags} goals={data.goals} onChange={reload} />)}</ul>
      )}
      {adding && <AddTodo date={day} tags={data.tags} goals={data.goals} onAdded={reload} autoFocus />}
    </section>
  )
}
