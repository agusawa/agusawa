'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { createTodo } from '@/app/actions'
import type { Goal, Tag } from '@/lib/types'
import TagPicker from './TagPicker'
import { button, input, run } from './ui'

export default function AddTodo({ date, tags, goals, onAdded, autoFocus }: {
  date: string
  tags: Tag[]
  goals: Goal[]
  onAdded: () => void
  autoFocus?: boolean
}) {
  const [title, setTitle] = useState('')
  const [tagId, setTagId] = useState<string | null>(null)
  const [goalId, setGoalId] = useState<string | null>(null)
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
    <form onSubmit={submit} className="mt-2 flex flex-col gap-2">
      <label className="flex items-center gap-3 py-1.5">
        <Plus size={20} className="text-graphite shrink-0 ml-0.5" aria-hidden />
        <input className="w-full min-w-0 bg-transparent py-1.5 text-[16px] outline-none placeholder:text-graphite"
          placeholder="Add a to-do" value={title} maxLength={200} autoFocus={autoFocus}
          onChange={(e) => setTitle(e.target.value)} aria-label="New to-do" />
      </label>
      {title.trim() && (
        <div className="flex flex-col gap-2 pl-9">
          <div className="grid grid-cols-2 gap-2">
            <TagPicker tags={tags} value={tagId} onChange={setTagId} onCreated={onAdded} />
            <select className={input} value={goalId ?? ''} aria-label="Goal" onChange={(e) => setGoalId(e.target.value || null)}>
              <option value="">No goal</option>
              {goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] text-graphite">{tagId ? '' : 'Pick a tag to add it.'}</p>
            <button className={button} disabled={!ready || busy}>Add to-do</button>
          </div>
        </div>
      )}
    </form>
  )
}
