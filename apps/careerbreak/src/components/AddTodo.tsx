'use client'

import { useState } from 'react'
import { createTodo } from '@/app/actions'
import type { Goal, Tag } from '@/lib/types'
import TagPicker from './TagPicker'
import { button, input, run } from './ui'

export default function AddTodo({ date, tags, goals, onAdded }: {
  date: string
  tags: Tag[]
  goals: Goal[]
  onAdded: () => void
}) {
  const [title, setTitle] = useState('')
  const [tagId, setTagId] = useState<number | null>(null)
  const [goalId, setGoalId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const ready = title.trim() !== '' && tagId !== null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!ready || busy) return
    setBusy(true)
    const ok = await run(() => createTodo({ date, title, tagId: tagId!, goalId }), onAdded)
    setBusy(false)
    if (ok) { setTitle(''); setGoalId(null) }
  }

  return (
    <form onSubmit={submit} className="mt-2 flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        <input className={input} placeholder="+ Add a to-do" value={title} maxLength={200}
          onChange={(e) => setTitle(e.target.value)} aria-label="New to-do" />
        <button className={button} disabled={!ready || busy}>Add</button>
      </div>
      {title.trim() && (
        <div className="grid grid-cols-2 gap-1.5">
          <TagPicker tags={tags} value={tagId} onChange={setTagId} onCreated={onAdded} />
          <select className={input} value={goalId ?? ''} aria-label="Goal"
            onChange={(e) => setGoalId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">No goal</option>
            {goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
        </div>
      )}
    </form>
  )
}
