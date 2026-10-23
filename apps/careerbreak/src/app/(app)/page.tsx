'use client'

import AddTodo from '@/components/AddTodo'
import GoalList from '@/components/GoalList'
import ImproveNote from '@/components/ImproveNote'
import TodoItem from '@/components/TodoItem'
import { sectionTitle } from '@/components/ui'
import { useToday } from '@/components/useToday'
import { useWeek } from '@/components/useWeek'
import WeekStrip from '@/components/WeekStrip'
import { breakDay, weekStart } from '@/lib/dates'
import { dayEntries, stillOpen } from '@/lib/week'

export default function TodayPage() {
  const today = useToday()
  return today ? <Today today={today} /> : null
}

function Today({ today }: { today: string }) {
  const ws = weekStart(today)
  const { data, error, reload } = useWeek(ws)
  const day = breakDay(today)

  return (
    <>
      <section aria-label="Your break so far" className="mb-6">
        {day ? (
          <h1 className="leading-none">
            <span className="block text-[5.5rem] sm:text-[7.5rem] font-extrabold tracking-[-0.045em] tabular-nums">Day {day}</span>
            <span className="block mt-2 text-[17px] text-graphite">of your career break</span>
          </h1>
        ) : (
          <h1 className="text-[3rem] font-extrabold tracking-[-0.03em] leading-tight">Your break starts Monday</h1>
        )}
      </section>

      {error && <p className="text-[15px] text-flag">{error}</p>}
      {!data && !error && <p className="text-[15px] text-graphite">Loading your week…</p>}
      {data && (
        <>
          <WeekStrip weekStart={ws} todos={data.todos} today={today} href={() => '/week'} />
          <ImproveNote text={data.prevNotes?.improve} />
          <GoalList weekStart={ws} data={data} onChange={reload} />
          <TodayList today={today} data={data} reload={reload} />
        </>
      )}
    </>
  )
}

function TodayList({ today, data, reload }: { today: string; data: NonNullable<ReturnType<typeof useWeek>['data']>; reload: () => void }) {
  const entries = dayEntries(data.todos, today)
  const open = stillOpen(data.todos, today)
  const item = { tags: data.tags, goals: data.goals, onChange: reload }
  return (
    <>
      <section className="my-8">
        <h2 className={sectionTitle}>Today</h2>
        {entries.length === 0 && <p className="text-[15px] text-graphite py-1">Nothing planned yet. What&apos;s the first thing?</p>}
        <ul>{entries.map((e) => <TodoItem key={`${e.todo.id}-${e.moved}`} entry={e} {...item} />)}</ul>
        <AddTodo date={today} tags={data.tags} goals={data.goals} onAdded={reload} />
      </section>
      {open.length > 0 && (
        <section className="my-8">
          <h2 className={sectionTitle}>Still open from earlier this week</h2>
          <ul>{open.map((t) => <TodoItem key={t.id} entry={{ todo: t, moved: false }} showMove {...item} />)}</ul>
        </section>
      )}
    </>
  )
}
