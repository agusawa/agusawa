'use client'

import { Suspense, useRef, useState } from 'react'
import { saveNotes } from '@/app/actions'
import { doneLabel } from '@/components/GoalList'
import { TagChip } from '@/components/TagPicker'
import { input, run, sectionTitle } from '@/components/ui'
import { useToday } from '@/components/useToday'
import { useSelectedWeek, useWeek } from '@/components/useWeek'
import WeekNav from '@/components/WeekNav'
import type { WeekData } from '@/lib/types'
import { reviewStats } from '@/lib/week'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function ReviewPage() {
  return useToday() ? <Suspense><Review /></Suspense> : null
}

function Review() {
  const ws = useSelectedWeek()
  const { data, error } = useWeek(ws)
  return (
    <>
      <WeekNav weekStart={ws} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!data && !error && <p className="text-sm text-zinc-500">Loading…</p>}
      {data && <Stats key={ws} data={data} />}
    </>
  )
}

function Stats({ data }: { data: WeekData }) {
  const s = reviewStats(data)
  const maxDay = Math.max(...s.perDay)
  return (
    <>
      <section className="my-5">
        <h2 className={sectionTitle}>To-dos done</h2>
        <p className="text-3xl font-bold">{s.done} / {s.total}</p>
        {s.moved > 0 && <p className="text-sm text-zinc-500 mt-1">{s.moved} moved to a later day</p>}
      </section>

      {s.byTag.length > 0 && (
        <section className="my-5">
          <h2 className={sectionTitle}>By tag</h2>
          {s.byTag.map((b) => (
            <div key={b.tag.id} className="grid grid-cols-[6.5rem_1fr_3rem] items-center gap-3 py-1 text-sm">
              <span className="min-w-0 truncate"><TagChip tag={b.tag} /></span>
              <div className="h-2 rounded bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full rounded" style={{ width: `${b.pct}%`, backgroundColor: b.tag.color }} />
              </div>
              <span className="text-right tabular-nums">{b.done}/{b.total}</span>
            </div>
          ))}
        </section>
      )}

      <section className="my-5">
        <h2 className={sectionTitle}>Done per day</h2>
        <div className="flex items-end gap-2 h-20">
          {s.perDay.map((n, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
              <span className="text-[10px] text-zinc-500 tabular-nums">{n || ''}</span>
              <div className="w-full rounded-t bg-blue-500/70" style={{ height: maxDay ? `${(n / maxDay) * 100}%` : 0, minHeight: n ? 2 : 0 }} />
              <span className="text-[11px] text-zinc-500">{DAY_LETTERS[i]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="my-5">
        <h2 className={sectionTitle}>Goals</h2>
        {s.goals.length === 0 && <p className="text-sm text-zinc-500">No goals were set this week.</p>}
        <ul>
          {s.goals.map(({ goal, linkedDone }) => (
            <li key={goal.id} className="flex items-start gap-2 py-1 text-sm">
              <span className={goal.hit ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'} aria-label={goal.hit ? 'Hit' : 'Missed'}>
                {goal.hit ? '✓' : '✗'}
              </span>
              <span className="min-w-0 flex-1 break-words">{goal.title}</span>
              <span className="shrink-0 text-xs text-zinc-500">({doneLabel(linkedDone)})</span>
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
        <textarea className={`${input} min-h-20`} value={wentWell} maxLength={5000}
          onChange={(e) => setWentWell(e.target.value)} onBlur={save} aria-label="What went well" />
      </section>
      <section className="my-5">
        <h2 className={sectionTitle}>What to improve next week</h2>
        <textarea className={`${input} min-h-20`} value={improve} maxLength={5000}
          onChange={(e) => setImprove(e.target.value)} onBlur={save} aria-label="What to improve next week" />
        <p className="text-xs text-zinc-500 mt-1">
          This shows at the top of next week&apos;s Today screen.{saved && <span className="text-emerald-600"> Saved</span>}
        </p>
      </section>
    </>
  )
}
