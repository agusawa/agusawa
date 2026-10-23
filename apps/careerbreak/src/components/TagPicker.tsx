'use client'

import { useState } from 'react'
import { createTag } from '@/app/actions'
import type { Tag } from '@/lib/types'
import { button, input, run } from './ui'

export function TagChip({ tag }: { tag: Tag | undefined }) {
  if (!tag) return null
  return (
    <span className="shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] leading-4"
      style={{ backgroundColor: `${tag.color}26`, color: tag.color }}>
      {tag.name}
    </span>
  )
}

const NEW = '__new'

export default function TagPicker({ tags, value, onChange, onCreated }: {
  tags: Tag[]
  value: number | null
  onChange: (id: number) => void
  onCreated: () => void
}) {
  const [adding, setAdding] = useState(tags.length === 0)
  const [name, setName] = useState('')

  async function add() {
    if (!name.trim()) return
    let created: Tag | null = null
    const ok = await run(async () => { created = await createTag(name) }, onCreated)
    if (ok && created) {
      onChange((created as Tag).id)
      setName('')
      setAdding(false)
    }
  }

  if (adding) {
    return (
      <div className="flex gap-1.5 min-w-0">
        <input className={input} placeholder="New tag name" value={name} maxLength={30} autoFocus={tags.length > 0}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } if (e.key === 'Escape' && tags.length) setAdding(false) }} />
        <button type="button" className={button} onClick={add} disabled={!name.trim()}>Create</button>
      </div>
    )
  }

  return (
    <select className={input} value={value ?? ''} aria-label="Tag"
      onChange={(e) => (e.target.value === NEW ? setAdding(true) : onChange(Number(e.target.value)))}>
      <option value="" disabled>Tag…</option>
      {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
      <option value={NEW}>+ New tag…</option>
    </select>
  )
}
