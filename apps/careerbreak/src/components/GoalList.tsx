'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { createGoal, deleteGoal, updateGoal } from '@/app/actions'
import type { Goal, WeekData } from '@/lib/types'
import { linkedDone } from '@/lib/week'
import TagPicker, { TagChip } from './TagPicker'
import { button, ghost, input, run, sectionTitle } from './ui'

function GoalForm({ data, initial, onDone, onCancel, onTagCreated, submitLabel }: {
  data: WeekData
  onTagCreated: () => void
  initial?: Goal
  onDone: (title: string, tagId: number) => Promise<boolean>
  onCancel?: () => void
  submitLabel: string
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [tagId, setTagId] = useState<number | null>(initial?.tagId ?? null)
  const ready = title.trim() !== '' && tagId !== null

  return (
    <form className="flex flex-col gap-1.5 mt-2" onSubmit={async (e) => {
      e.preventDefault()
      if (ready && (await onDone(title, tagId!)) && !initial) { setTitle(''); setTagId(null) }
    }}>
      <input className={input} placeholder="+ Add a goal for this week" value={title} maxLength={200}
        onChange={(e) => setTitle(e.target.value)} aria-label="Goal title" />
      {(title.trim() || initial) && (
        <div className="flex gap-1.5">
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

export default function GoalList({ weekStart, data, onChange }: { weekStart: string; data: WeekData; onChange: () => void }) {
  const [editing, setEditing] = useState<number | null>(null)

  return (
    <section className="my-5">
      <h2 className={sectionTitle}>This week&apos;s goals</h2>
      {data.goals.length === 0 && (
        <p className="text-sm text-zinc-500">No goals for this week yet. What do you want to get done?</p>
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
            <li key={g.id} className="flex items-center gap-2 py-1.5 text-sm">
              <input type="checkbox" className="size-4 shrink-0 accent-emerald-600" checked={g.hit} aria-label={`Goal hit: ${g.title}`}
                onChange={(e) => run(() => updateGoal(g.id, { hit: e.target.checked }), onChange)} />
              <TagChip tag={data.tags.find((t) => t.id === g.tagId)} />
              <span className="min-w-0 flex-1 break-words">{g.title}</span>
              <span className="shrink-0 text-xs text-zinc-500">{doneLabel(linkedDone(data.todos, g.id))}</span>
              <button className={ghost} aria-label="Edit goal" onClick={() => setEditing(g.id)}><Pencil size={14} /></button>
              <button className={ghost} aria-label="Delete goal"
                onClick={() => confirm(`Delete goal "${g.title}"? Its to-dos stay.`) && run(() => deleteGoal(g.id), onChange)}>
                <Trash2 size={14} />
              </button>
            </li>
          ),
        )}
      </ul>
      <GoalForm data={data} onTagCreated={onChange} submitLabel="Add"
        onDone={(title, tagId) => run(() => createGoal({ weekStart, title, tagId }), onChange)} />
    </section>
  )
}

export const doneLabel = (n: number) => `${n} to-do${n === 1 ? '' : 's'} done`
