'use server'

import { ObjectId, type Filter } from 'mongodb'
import { addDays, weekStart as mondayOf } from '@/lib/dates'
import { db } from '@/lib/db/client'
import { requireUser } from '@/lib/session'
import { pickTagColor } from '@/lib/tagColors'
import type { Goal, Tag, Todo, WeekData, WeekNotes } from '@/lib/types'
import { assertDate, assertGoalWeek, cleanNote, cleanTagName, cleanTitle } from '@/lib/validate'

// Stored shapes. Dates stay 'YYYY-MM-DD' strings, so range queries compare as text.
type TagDoc = { _id: ObjectId; name: string; nameLower: string; color: string; createdAt: Date }
type GoalDoc = { _id: ObjectId; weekStart: string; title: string; tagId: ObjectId; hit: boolean; createdAt: Date }
type TodoDoc = {
  _id: ObjectId
  date: string
  plannedDate: string
  title: string
  tagId: ObjectId
  goalId: ObjectId | null
  done: boolean
  createdAt: Date
}
type NotesDoc = { _id: string; wentWell: string; improve: string } // _id = week start

const DUPLICATE_KEY = 11000

async function cols() {
  const d = await db()
  return {
    tags: d.collection<TagDoc>('tags'),
    goals: d.collection<GoalDoc>('goals'),
    todos: d.collection<TodoDoc>('todos'),
    notes: d.collection<NotesDoc>('weekNotes'),
  }
}

function oid(s: unknown): ObjectId {
  if (typeof s !== 'string' || !ObjectId.isValid(s) || s.length !== 24) throw new Error('Invalid id.')
  return new ObjectId(s)
}

function assertMonday(s: unknown): string {
  const d = assertDate(s)
  if (mondayOf(d) !== d) throw new Error('Week must start on a Monday.')
  return d
}

const toTag = (t: TagDoc): Tag => ({ id: t._id.toHexString(), name: t.name, color: t.color })
const toGoal = (g: GoalDoc): Goal => ({
  id: g._id.toHexString(), weekStart: g.weekStart, title: g.title, tagId: g.tagId.toHexString(), hit: g.hit,
})
const toTodo = (t: TodoDoc): Todo => ({
  id: t._id.toHexString(), date: t.date, plannedDate: t.plannedDate, title: t.title,
  tagId: t.tagId.toHexString(), goalId: t.goalId?.toHexString() ?? null, done: t.done,
})
const toNotes = (n: NotesDoc): WeekNotes => ({ weekStart: n._id, wentWell: n.wentWell, improve: n.improve })

// Mongo has no foreign keys, so references are checked here.
async function existingTag(id: unknown): Promise<ObjectId> {
  const _id = oid(id)
  if (!(await (await cols()).tags.countDocuments({ _id }, { limit: 1 }))) throw new Error('Tag not found.')
  return _id
}

async function goalFor(goalId: string | null | undefined, todoDate: string): Promise<ObjectId | null> {
  if (goalId == null) return null
  const g = await (await cols()).goals.findOne({ _id: oid(goalId) })
  if (!g) throw new Error('Goal not found.')
  assertGoalWeek(g.weekStart, todoDate)
  return g._id
}

export async function getWeek(weekStart: string): Promise<WeekData> {
  await requireUser()
  const ws = assertMonday(weekStart)
  const range = { $gte: ws, $lte: addDays(ws, 6) }
  const c = await cols()
  const [tags, goals, todos, notes] = await Promise.all([
    c.tags.find().sort({ nameLower: 1 }).toArray(),
    c.goals.find({ weekStart: ws }).sort({ createdAt: 1, _id: 1 }).toArray(),
    c.todos.find({ $or: [{ date: range }, { plannedDate: range }] }).sort({ createdAt: 1, _id: 1 }).toArray(),
    c.notes.find({ _id: { $in: [ws, addDays(ws, -7)] } }).toArray(),
  ])
  const mine = notes.find((n) => n._id === ws)
  const prev = notes.find((n) => n._id !== ws)
  return {
    weekStart: ws,
    tags: tags.map(toTag),
    goals: goals.map(toGoal),
    todos: todos.map(toTodo),
    notes: mine ? toNotes(mine) : null,
    prevNotes: prev ? toNotes(prev) : null,
  }
}

export async function createTag(name: string): Promise<Tag> {
  await requireUser()
  const n = cleanTagName(name)
  const { tags } = await cols()
  const existing = await tags.findOne({ nameLower: n.toLowerCase() })
  if (existing) return toTag(existing)
  const doc: TagDoc = {
    _id: new ObjectId(), name: n, nameLower: n.toLowerCase(),
    color: pickTagColor(await tags.countDocuments()), createdAt: new Date(),
  }
  try {
    await tags.insertOne(doc)
    return toTag(doc)
  } catch (e) {
    // Two quick creates of the same name: return the one that won.
    if ((e as { code?: number }).code !== DUPLICATE_KEY) throw e
    return toTag((await tags.findOne({ nameLower: doc.nameLower }))!)
  }
}

// Returns the duplicate-name error instead of throwing: Next hides thrown messages in production.
export async function renameTag(id: string, name: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireUser()
  const n = cleanTagName(name)
  try {
    await (await cols()).tags.updateOne({ _id: oid(id) }, { $set: { name: n, nameLower: n.toLowerCase() } })
    return { ok: true }
  } catch (e) {
    if ((e as { code?: number }).code === DUPLICATE_KEY) return { ok: false, error: 'A tag with that name already exists.' }
    throw e
  }
}

export async function deleteTag(id: string): Promise<{ ok: true } | { ok: false; usedBy: number }> {
  await requireUser()
  const tagId = oid(id)
  const c = await cols()
  const [todos, goals] = await Promise.all([c.todos.countDocuments({ tagId }), c.goals.countDocuments({ tagId })])
  if (todos + goals > 0) return { ok: false, usedBy: todos + goals }
  await c.tags.deleteOne({ _id: tagId })
  return { ok: true }
}

export async function createGoal(input: { weekStart: string; title: string; tagId: string }): Promise<void> {
  await requireUser()
  const weekStart = assertMonday(input.weekStart)
  const title = cleanTitle(input.title)
  const tagId = await existingTag(input.tagId)
  await (await cols()).goals.insertOne({ _id: new ObjectId(), weekStart, title, tagId, hit: false, createdAt: new Date() })
}

export async function updateGoal(id: string, patch: { title?: string; tagId?: string; hit?: boolean }): Promise<void> {
  await requireUser()
  const _id = oid(id)
  const set: Partial<GoalDoc> = {}
  if (patch.title !== undefined) set.title = cleanTitle(patch.title)
  if (patch.tagId !== undefined) set.tagId = await existingTag(patch.tagId)
  if (patch.hit !== undefined) set.hit = patch.hit === true
  if (Object.keys(set).length) await (await cols()).goals.updateOne({ _id }, { $set: set })
}

export async function deleteGoal(id: string): Promise<void> {
  await requireUser()
  const _id = oid(id)
  const c = await cols()
  // Linked to-dos stay; they just lose the link.
  await c.todos.updateMany({ goalId: _id }, { $set: { goalId: null } })
  await c.goals.deleteOne({ _id })
}

export async function createTodo(input: { date: string; title: string; tagId: string; goalId: string | null }): Promise<void> {
  await requireUser()
  const date = assertDate(input.date)
  const title = cleanTitle(input.title)
  const tagId = await existingTag(input.tagId)
  const goalId = await goalFor(input.goalId, date)
  await (await cols()).todos.insertOne({
    _id: new ObjectId(), date, plannedDate: date, title, tagId, goalId, done: false, createdAt: new Date(),
  })
}

export async function updateTodo(
  id: string,
  patch: { title?: string; tagId?: string; goalId?: string | null; done?: boolean },
): Promise<void> {
  await requireUser()
  const _id = oid(id)
  const c = await cols()
  const set: Partial<TodoDoc> = {}
  if (patch.title !== undefined) set.title = cleanTitle(patch.title)
  if (patch.tagId !== undefined) set.tagId = await existingTag(patch.tagId)
  if (patch.done !== undefined) set.done = patch.done === true
  if (patch.goalId !== undefined) {
    const t = await c.todos.findOne({ _id }, { projection: { date: 1 } })
    if (!t) throw new Error('To-do not found.')
    set.goalId = await goalFor(patch.goalId, t.date)
  }
  if (Object.keys(set).length) await c.todos.updateOne({ _id }, { $set: set })
}

export async function moveTodo(id: string, toDate: string): Promise<void> {
  await requireUser()
  const _id = oid(id)
  const to = assertDate(toDate)
  const c = await cols()
  const t = await c.todos.findOne({ _id }, { projection: { date: 1 } })
  if (!t) throw new Error('To-do not found.')
  if (mondayOf(t.date) !== mondayOf(to)) throw new Error('A to-do can only move within its week.')
  // plannedDate stays, so the original day keeps showing it as moved.
  await c.todos.updateOne({ _id }, { $set: { date: to } })
}

export async function deleteTodo(id: string): Promise<void> {
  await requireUser()
  await (await cols()).todos.deleteOne({ _id: oid(id) } as Filter<TodoDoc>)
}

export async function saveNotes(weekStart: string, notes: { wentWell: string; improve: string }): Promise<void> {
  await requireUser()
  const ws = assertMonday(weekStart)
  const wentWell = cleanNote(notes.wentWell)
  const improve = cleanNote(notes.improve)
  await (await cols()).notes.updateOne({ _id: ws }, { $set: { wentWell, improve } }, { upsert: true })
}
