'use client'

import { Suspense, useState } from 'react'
import AddTodo from '@/components/AddTodo'
import GoalList from '@/components/GoalList'
import ImproveNote from '@/components/ImproveNote'
import TodoItem from '@/components/TodoItem'
import { ghost } from '@/components/ui'
import { useToday } from '@/components/useToday'
import { useSelectedWeek, useWeek } from '@/components/useWeek'
import WeekNav from '@/components/WeekNav'
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
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!data && !error && <p className="text-sm text-zinc-500">Loading…</p>}
      {data && (
        <>
          <ImproveNote text={data.prevNotes?.improve} />
          <GoalList weekStart={ws} data={data} onChange={reload} heading="Goals" />
          {weekDays(ws).map((day) => <Day key={day} day={day} isToday={day === today} data={data} reload={reload} />)}
        </>
      )}
    </>
  )
}

function Day({ day, isToday, data, reload }: { day: string; isToday: boolean; data: WeekData; reload: () => void }) {
  const [adding, setAdding] = useState(false)
  const entries = dayEntries(data.todos, day)
  return (
    <section className={`my-3 rounded-md border px-3 py-2 ${isToday ? 'border-blue-500' : 'border-zinc-200 dark:border-zinc-800'}`}>
      <div className="flex items-center justify-between">
        <h2 className={`text-sm font-semibold ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
          {formatDay(day)}{isToday && <span className="font-normal"> · today</span>}
        </h2>
        {!adding && <button className={ghost} onClick={() => setAdding(true)}>+ Add</button>}
      </div>
      <ul>{entries.map((e) => <TodoItem key={`${e.todo.id}-${e.moved}`} entry={e} tags={data.tags} goals={data.goals} onChange={reload} />)}</ul>
      {adding && <AddTodo date={day} tags={data.tags} goals={data.goals} onAdded={reload} />}
    </section>
  )
}
