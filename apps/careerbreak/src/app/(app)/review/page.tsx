'use client'

import { Suspense, useRef, useState } from 'react'
import { saveNotes } from '@/app/actions'
import { doneLabel } from '@/components/GoalList'
import { input, run, sectionTitle } from '@/components/ui'
import { useToday } from '@/components/useToday'
import { useSelectedWeek, useWeek } from '@/components/useWeek'
import WeekNav from '@/components/WeekNav'
import WeekStrip from '@/components/WeekStrip'
import type { WeekData } from '@/lib/types'
import { reviewStats } from '@/lib/week'

export default function ReviewPage() {
  return useToday() ? <Suspense><Review /></Suspense> : null
}

function Review() {
  const ws = useSelectedWeek()
  const { data, error } = useWeek(ws)
  return (
    <>
      <WeekNav weekStart={ws} />
      {error && <p className="text-[15px] text-flag">{error}</p>}
      {!data && !error && <p className="text-[15px] text-graphite">Loading the week…</p>}
      {data && <Stats key={ws} data={data} />}
    </>
  )
}

function Stats({ data }: { data: WeekData }) {
  const s = reviewStats(data)
  return (
    <>
      <section className="mb-8" aria-label="To-dos done">
        <p className="leading-none tabular-nums">
          <span className="text-[4.5rem] font-extrabold tracking-[-0.045em]">{s.done}</span>
          <span className="text-[2rem] font-bold text-graphite tracking-[-0.02em]"> of {s.total}</span>
        </p>
        <p className="mt-2 text-[17px] text-graphite">
          to-dos done{s.moved > 0 && `, ${s.moved} moved to a later day`}
        </p>
      </section>

      <WeekStrip weekStart={data.weekStart} todos={data.todos} today={null} />

      {s.byTag.length > 0 && (
        <section className="my-8">
          <h2 className={sectionTitle}>Where your time went</h2>
          <ul className="flex flex-col gap-3">
            {s.byTag.map((b) => (
              <li key={b.tag.id}>
                <div className="flex items-baseline justify-between text-[15px]">
                  <span className="font-medium">{b.tag.name}</span>
                  <span className="text-graphite tabular-nums">{b.done} of {b.total}</span>
                </div>
                <div className="mt-1 h-3 rounded-full bg-rule overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${b.pct}%`, backgroundColor: b.tag.color }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="my-8">
        <h2 className={sectionTitle}>Goals</h2>
        {s.goals.length === 0 && <p className="text-[15px] text-graphite">No goals were set this week.</p>}
        <ul>
          {s.goals.map(({ goal, linkedDone }) => (
            <li key={goal.id} className="flex items-start gap-3 py-2">
              <span className={`mt-0.5 grid place-items-center size-6 shrink-0 rounded-full text-[13px] font-bold ${goal.hit ? 'bg-pine text-sheet' : 'border-2 border-flag/60 text-flag'}`}>
                {goal.hit ? '✓' : '✗'}
              </span>
              <span className="min-w-0 flex-1 break-words">
                {goal.title}
                <span className="block text-[13px] text-graphite">{goal.hit ? 'Hit' : 'Missed'}, {doneLabel(linkedDone)}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Notes data={data} />
    </>
  )
}

function Notes({ data }: { data: WeekData }) {
  const [wentWell, setWentWell] = useState(data.notes?.wentWell ?? '')
  const [improve, setImprove] = useState(data.notes?.improve ?? '')
  const [saved, setSaved] = useState(false)
  const last = useRef({ wentWell, improve })

  async function save() {
    if (wentWell === last.current.wentWell && improve === last.current.improve) return
    if (await run(() => saveNotes(data.weekStart, { wentWell, improve }))) {
      last.current = { wentWell, improve }
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }
  }

  return (
    <>
      <section className="my-5">
        <h2 className={sectionTitle}>What went well</h2>
        <textarea className={`${input} min-h-28 leading-relaxed`} value={wentWell} maxLength={5000}
          onChange={(e) => setWentWell(e.target.value)} onBlur={save} aria-label="What went well" />
      </section>
      <section className="my-5">
        <h2 className={sectionTitle}>What to improve next week</h2>
        <textarea className={`${input} min-h-28 leading-relaxed`} value={improve} maxLength={5000}
          onChange={(e) => setImprove(e.target.value)} onBlur={save} aria-label="What to improve next week" />
        <p className="text-[13px] text-graphite mt-1.5">
          This shows at the top of next week&apos;s Today screen.{saved && <span className="text-pine font-semibold"> Saved</span>}
        </p>
      </section>
    </>
  )
}
