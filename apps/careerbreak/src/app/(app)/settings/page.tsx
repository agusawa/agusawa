'use client'

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { createTag, deleteTag, renameTag } from '@/app/actions'
import { button, ghost, input, run, sectionTitle } from '@/components/ui'
import { useToday } from '@/components/useToday'
import { useWeek } from '@/components/useWeek'
import { weekStart } from '@/lib/dates'
import type { Tag } from '@/lib/types'

export default function SettingsPage() {
  const today = useToday()
  return today ? <Settings ws={weekStart(today)} /> : null
}

function Settings({ ws }: { ws: string }) {
  const { data, error, reload } = useWeek(ws) // tags are global; any week returns them all
  const [name, setName] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  if (error) return <p className="mt-6 text-sm text-red-600">{error}</p>
  if (!data) return <p className="mt-6 text-sm text-zinc-500">Loading…</p>

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim() && (await run(() => createTag(name), reload))) setName('')
  }

  return (
    <section className="my-5">
      <h2 className={sectionTitle}>Tags</h2>
      {data.tags.length === 0 && <p className="text-sm text-zinc-500">No tags yet.</p>}
      <ul>
        {data.tags.map((t) => <TagRow key={`${t.id}-${t.name}`} tag={t} onChange={reload} onMessage={setMessage} />)}
      </ul>
      {message && <p role="alert" className="text-sm text-red-600 dark:text-red-400 my-2">{message}</p>}
      <form onSubmit={add} className="flex gap-1.5 mt-3">
        <input className={input} placeholder="New tag name" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} aria-label="New tag name" />
        <button className={button} disabled={!name.trim()}>Add tag</button>
      </form>
    </section>
  )
}

function TagRow({ tag, onChange, onMessage }: { tag: Tag; onChange: () => void; onMessage: (m: string | null) => void }) {
  const [name, setName] = useState(tag.name)

  async function rename() {
    if (!name.trim() || name.trim() === tag.name) return setName(tag.name)
    const r = await renameTag(tag.id, name).catch(() => null)
    if (r?.ok) { onMessage(null); onChange(); return }
    onMessage(r ? r.error : 'Something went wrong. Please try again.')
    setName(tag.name)
  }

  async function remove() {
    if (!confirm(`Delete tag "${tag.name}"?`)) return
    const r = await deleteTag(tag.id).catch(() => null)
    if (!r) return onMessage('Something went wrong. Please try again.')
    if (r.ok) { onMessage(null); onChange() } else onMessage(`"${tag.name}" is used by ${r.usedBy} item${r.usedBy === 1 ? '' : 's'}. Remove it from them first.`)
  }

  return (
    <li className="flex items-center gap-2 py-1">
      <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
      <input className={`${input} border-transparent hover:border-zinc-300 dark:hover:border-zinc-700`} value={name} maxLength={30}
        aria-label={`Rename ${tag.name}`} onChange={(e) => setName(e.target.value)} onBlur={rename}
        onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setName(tag.name) }} />
      <button className={ghost} aria-label={`Delete ${tag.name}`} onClick={remove}><Trash2 size={14} /></button>
    </li>
  )
}
