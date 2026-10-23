'use client'

import { useState } from 'react'
import { deleteTodo, moveTodo, updateTodo } from '@/app/actions'
import { shortDay, todayLocal } from '@/lib/dates'
import type { DayEntry, Goal, Tag } from '@/lib/types'
import CheckCircle from './CheckCircle'
import TagPicker, { TagChip } from './TagPicker'
import { button, ghost, input, run } from './ui'

export default function TodoItem({ entry, tags, goals, onChange, showMove }: {
  entry: DayEntry
  tags: Tag[]
  goals: Goal[]
  onChange: () => void
  showMove?: boolean
}) {
  const { todo, moved } = entry
  const tag = tags.find((t) => t.id === todo.tagId)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [tagId, setTagId] = useState<string | null>(todo.tagId)
  const [goalId, setGoalId] = useState<string | null>(todo.goalId)

  if (moved) {
    return (
      <li className="flex items-center gap-3 py-2.5 text-graphite/80">
        <span className="size-6 shrink-0 rounded-full border-2 border-dashed border-rule" aria-hidden />
        <span className="min-w-0 flex-1 line-through decoration-graphite/40">{todo.title}</span>
        <span className="shrink-0 text-[13px]">moved to {shortDay(todo.date)}</span>
      </li>
    )
  }

  if (editing) {
    const save = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!title.trim() || tagId === null) return
      if (await run(() => updateTodo(todo.id, { title, tagId, goalId }), onChange)) { setEditing(false); setOpen(false) }
    }
    return (
      <li className="py-2">
        <form onSubmit={save} className="flex flex-col gap-2 rounded-xl bg-sheet border border-rule p-3">
          <input className={input} value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} autoFocus aria-label="Title" />
          <div className="grid grid-cols-2 gap-2">
            <TagPicker tags={tags} value={tagId} onChange={setTagId} onCreated={onChange} />
            <select className={input} value={goalId ?? ''} aria-label="Goal" onChange={(e) => setGoalId(e.target.value || null)}>
              <option value="">No goal</option>
              {goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className={ghost} onClick={() => setEditing(false)}>Cancel</button>
            <button className={button} disabled={!title.trim() || tagId === null}>Save</button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="py-1">
      <div className="flex items-center gap-3 py-1.5">
        <CheckCircle checked={todo.done} label={`Done: ${todo.title}`}
          onChange={(v) => run(() => updateTodo(todo.id, { done: v }), onChange)} />
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
          className="min-w-0 flex-1 text-left flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className={`break-words ${todo.done ? 'line-through decoration-graphite/50 text-graphite' : ''}`}>{todo.title}</span>
          <TagChip tag={tag} />
        </button>
        {showMove && (
          <button className="shrink-0 rounded-lg px-3 py-1.5 text-[14px] font-semibold text-pine bg-pine-soft"
            onClick={() => run(() => moveTodo(todo.id, todayLocal()), onChange)}>
            Move to today
          </button>
        )}
      </div>
      {open && (
        <div className="flex gap-1 pl-9 pb-1">
          <button className={ghost} onClick={() => setEditing(true)}>Edit</button>
          <button className={`${ghost} text-flag hover:text-flag`}
            onClick={() => confirm(`Delete "${todo.title}"?`) && run(() => deleteTodo(todo.id), onChange)}>
            Delete
          </button>
        </div>
      )}
    </li>
  )
}
