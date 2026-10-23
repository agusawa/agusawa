'use client'

import AddTodo from '@/components/AddTodo'
import GoalList from '@/components/GoalList'
import ImproveNote from '@/components/ImproveNote'
import TodoItem from '@/components/TodoItem'
import { sectionTitle } from '@/components/ui'
import { useToday } from '@/components/useToday'
import { useWeek } from '@/components/useWeek'
import { formatDay, weekStart } from '@/lib/dates'
import { dayEntries, stillOpen } from '@/lib/week'

export default function TodayPage() {
  const today = useToday()
  return today ? <Today today={today} /> : null
}

function Today({ today }: { today: string }) {
  const ws = weekStart(today)
  const { data, error, reload } = useWeek(ws)
  if (error) return <p className="mt-6 text-sm text-red-600">{error}</p>
  if (!data) return <p className="mt-6 text-sm text-zinc-500">Loading…</p>

  const entries = dayEntries(data.todos, today)
  const open = stillOpen(data.todos, today)
  const item = { tags: data.tags, goals: data.goals, onChange: reload }

  return (
    <>
      <ImproveNote text={data.prevNotes?.improve} />
      <GoalList weekStart={ws} data={data} onChange={reload} />
      <section className="my-5">
        <h2 className={sectionTitle}>{formatDay(today)}</h2>
        {entries.length === 0 && <p className="text-sm text-zinc-500">Nothing planned yet.</p>}
        <ul>{entries.map((e) => <TodoItem key={`${e.todo.id}-${e.moved}`} entry={e} {...item} />)}</ul>
        <AddTodo date={today} tags={data.tags} goals={data.goals} onAdded={reload} />
      </section>
      {open.length > 0 && (
        <section className="my-5">
          <h2 className={sectionTitle}>Still open from earlier this week</h2>
          <ul>{open.map((t) => <TodoItem key={t.id} entry={{ todo: t, moved: false }} showMove {...item} />)}</ul>
        </section>
      )}
    </>
  )
}
