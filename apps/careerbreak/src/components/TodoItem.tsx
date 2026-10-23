'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { deleteTodo, moveTodo, updateTodo } from '@/app/actions'
import { shortDay, todayLocal } from '@/lib/dates'
import type { DayEntry, Goal, Tag } from '@/lib/types'
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
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [tagId, setTagId] = useState<string | null>(todo.tagId)
  const [goalId, setGoalId] = useState<string | null>(todo.goalId)

  if (moved) {
    return (
      <li className="flex items-center gap-2 py-1.5 text-sm text-zinc-400 dark:text-zinc-600">
        <span className="w-4 shrink-0" />
        <span className="line-through truncate">{todo.title}</span>
        <span className="shrink-0 text-xs">moved → {shortDay(todo.date)}</span>
      </li>
    )
  }

  if (editing) {
    const save = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!title.trim() || tagId === null) return
      if (await run(() => updateTodo(todo.id, { title, tagId, goalId }), onChange)) setEditing(false)
    }
    return (
      <li className="py-1.5">
        <form onSubmit={save} className="flex flex-col gap-1.5">
          <input className={input} value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} autoFocus aria-label="Title" />
          <div className="grid grid-cols-2 gap-1.5">
            <TagPicker tags={tags} value={tagId} onChange={setTagId} onCreated={onChange} />
            <select className={input} value={goalId ?? ''} aria-label="Goal"
              onChange={(e) => setGoalId(e.target.value || null)}>
              <option value="">No goal</option>
              {goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>
          <div className="flex gap-1.5 justify-end">
            <button type="button" className={ghost} onClick={() => setEditing(false)}>Cancel</button>
            <button className={button} disabled={!title.trim() || tagId === null}>Save</button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="flex items-center gap-2 py-1.5 text-sm">
      <input type="checkbox" className="size-4 shrink-0 accent-emerald-600" checked={todo.done} aria-label={`Done: ${todo.title}`}
        onChange={(e) => run(() => updateTodo(todo.id, { done: e.target.checked }), onChange)} />
      <span className={`min-w-0 flex-1 break-words ${todo.done ? 'line-through text-zinc-400 dark:text-zinc-600' : ''}`}>{todo.title}</span>
      <TagChip tag={tag} />
      {showMove && (
        <button className={ghost} onClick={() => run(() => moveTodo(todo.id, todayLocal()), onChange)}>Move to today</button>
      )}
      <button className={ghost} aria-label="Edit" onClick={() => setEditing(true)}><Pencil size={14} /></button>
      <button className={ghost} aria-label="Delete"
        onClick={() => confirm(`Delete "${todo.title}"?`) && run(() => deleteTodo(todo.id), onChange)}><Trash2 size={14} /></button>
    </li>
  )
}
