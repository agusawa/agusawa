'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { createGoal, deleteGoal, updateGoal } from '@/app/actions'
import type { Goal, WeekData } from '@/lib/types'
import { linkedDone } from '@/lib/week'
import CheckCircle from './CheckCircle'
import TagPicker, { TagChip } from './TagPicker'
import { button, ghost, input, run, sectionTitle } from './ui'

export const doneLabel = (n: number) => `${n} to-do${n === 1 ? '' : 's'} done`

function GoalForm({ data, initial, onDone, onCancel, onTagCreated, submitLabel }: {
  data: WeekData
  initial?: Goal
  onDone: (title: string, tagId: string) => Promise<boolean>
  onCancel?: () => void
  onTagCreated: () => void
  submitLabel: string
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [tagId, setTagId] = useState<string | null>(initial?.tagId ?? null)
  const ready = title.trim() !== '' && tagId !== null

  return (
    <form className={`flex flex-col gap-2 ${initial ? 'rounded-xl bg-sheet border border-rule p-3 my-1' : 'mt-1'}`} onSubmit={async (e) => {
      e.preventDefault()
      if (ready && (await onDone(title, tagId!)) && !initial) { setTitle(''); setTagId(null) }
    }}>
      {initial ? (
        <input className={input} value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} aria-label="Goal title" autoFocus />
      ) : (
        <label className="flex items-center gap-3 py-1.5">
          <Plus size={20} className="text-graphite shrink-0 ml-0.5" aria-hidden />
          <input className="w-full min-w-0 bg-transparent py-1.5 text-[16px] outline-none placeholder:text-graphite"
            placeholder="Add a goal" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} aria-label="Goal title" />
        </label>
      )}
      {(title.trim() || initial) && (
        <div className={`flex gap-2 ${initial ? '' : 'pl-9'}`}>
          <div className="flex-1 min-w-0">
            <TagPicker tags={data.tags} value={tagId} onChange={setTagId} onCreated={onTagCreated} />
          </div>
          {onCancel && <button type="button" className={ghost} onClick={onCancel}>Cancel</button>}
          <button className={button} disabled={!ready}>{submitLabel}</button>
        </div>
      )}
    </form>
  )
}

function GoalRow({ goal, data, onChange, onEdit }: { goal: Goal; data: WeekData; onChange: () => void; onEdit: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="py-1">
      <div className="flex items-center gap-3 py-1.5">
        <CheckCircle checked={goal.hit} label={`Goal hit: ${goal.title}`}
          onChange={(v) => run(() => updateGoal(goal.id, { hit: v }), onChange)} />
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
          className="min-w-0 flex-1 text-left flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className={`break-words font-medium ${goal.hit ? 'text-graphite' : ''}`}>{goal.title}</span>
          <TagChip tag={data.tags.find((t) => t.id === goal.tagId)} />
        </button>
        <span className="shrink-0 text-[13px] text-graphite tabular-nums">{doneLabel(linkedDone(data.todos, goal.id))}</span>
      </div>
      {open && (
        <div className="flex gap-1 pl-9 pb-1">
          <button className={ghost} onClick={onEdit}>Edit</button>
          <button className={`${ghost} text-flag hover:text-flag`}
            onClick={() => confirm(`Delete goal "${goal.title}"? Its to-dos stay.`) && run(() => deleteGoal(goal.id), onChange)}>
            Delete
          </button>
        </div>
      )}
    </li>
  )
}

export default function GoalList({ weekStart, data, onChange, heading = 'Goals this week' }: {
  weekStart: string
  data: WeekData
  onChange: () => void
  heading?: string
}) {
  const [editing, setEditing] = useState<string | null>(null)

  return (
    <section className="my-8">
      <h2 className={sectionTitle}>{heading}</h2>
      {data.goals.length === 0 && (
        <p className="text-[15px] text-graphite py-1">No goals yet. Pick two or three things you want done by Sunday.</p>
      )}
      <ul>
        {data.goals.map((g) =>
          editing === g.id ? (
            <li key={g.id}>
              <GoalForm data={data} initial={g} onTagCreated={onChange} submitLabel="Save" onCancel={() => setEditing(null)}
                onDone={async (title, tagId) => {
                  const ok = await run(() => updateGoal(g.id, { title, tagId }), onChange)
                  if (ok) setEditing(null)
                  return ok
                }} />
            </li>
          ) : (
            <GoalRow key={g.id} goal={g} data={data} onChange={onChange} onEdit={() => setEditing(g.id)} />
          ),
        )}
      </ul>
      <GoalForm data={data} onTagCreated={onChange} submitLabel="Add goal"
        onDone={(title, tagId) => run(() => createGoal({ weekStart, title, tagId }), onChange)} />
    </section>
  )
}
