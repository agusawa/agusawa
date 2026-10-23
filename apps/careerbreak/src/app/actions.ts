'use server'

import { addDays, weekStart as mondayOf } from '@/lib/dates'
import { db } from '@/lib/db/client'
import { requireUser } from '@/lib/session'
import { pickTagColor } from '@/lib/tagColors'
import type { Goal, Tag, Todo, WeekData, WeekNotes } from '@/lib/types'
import { assertDate, assertGoalWeek, cleanNote, cleanTagName, cleanTitle } from '@/lib/validate'

function assertId(n: unknown): number {
  if (!Number.isInteger(n) || (n as number) <= 0) throw new Error('Invalid id.')
  return n as number
}

function assertMonday(s: unknown): string {
  const d = assertDate(s)
  if (mondayOf(d) !== d) throw new Error('Week must start on a Monday.')
  return d
}

async function checkGoalFor(goalId: number | null | undefined, todoDate: string) {
  if (goalId == null) return
  const [g] = await db()<{ weekStart: string }[]>`select week_start from goals where id = ${assertId(goalId)}`
  if (!g) throw new Error('Goal not found.')
  assertGoalWeek(g.weekStart, todoDate)
}

const TODO_COLS = 'id, date, planned_date, title, tag_id, goal_id, done'

export async function getWeek(weekStart: string): Promise<WeekData> {
  await requireUser()
  const ws = assertMonday(weekStart)
  const we = addDays(ws, 6)
  const sql = db()
  const [tags, goals, todos, notes] = await Promise.all([
    sql<Tag[]>`select id, name, color from tags order by lower(name)`,
    sql<Goal[]>`select id, week_start, title, tag_id, hit from goals where week_start = ${ws} order by created_at, id`,
    sql<Todo[]>`select ${sql.unsafe(TODO_COLS)} from todos
      where date between ${ws} and ${we} or planned_date between ${ws} and ${we}
      order by created_at, id`,
    sql<WeekNotes[]>`select week_start, went_well, improve from week_notes where week_start in (${ws}, ${addDays(ws, -7)})`,
  ])
  return {
    weekStart: ws,
    tags: [...tags],
    goals: [...goals],
    todos: [...todos],
    notes: notes.find((n) => n.weekStart === ws) ?? null,
    prevNotes: notes.find((n) => n.weekStart !== ws) ?? null,
  }
}

export async function createTag(name: string): Promise<Tag> {
  await requireUser()
  const n = cleanTagName(name)
  const sql = db()
  const [existing] = await sql<Tag[]>`select id, name, color from tags where lower(name) = lower(${n})`
  if (existing) return existing
  const [{ count }] = await sql<{ count: number }[]>`select count(*)::int as count from tags`
  const [tag] = await sql<Tag[]>`insert into tags (name, color) values (${n}, ${pickTagColor(count)}) returning id, name, color`
  return tag
}

// Returns the duplicate-name error instead of throwing: Next hides thrown messages in production.
export async function renameTag(id: number, name: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireUser()
  const n = cleanTagName(name)
  try {
    await db()`update tags set name = ${n} where id = ${assertId(id)}`
    return { ok: true }
  } catch (e) {
    if ((e as { code?: string }).code === '23505') return { ok: false, error: 'A tag with that name already exists.' }
    throw e
  }
}

export async function deleteTag(id: number): Promise<{ ok: true } | { ok: false; usedBy: number }> {
  await requireUser()
  const tid = assertId(id)
  const sql = db()
  const [{ usedBy }] = await sql<{ usedBy: number }[]>`
    select (select count(*) from todos where tag_id = ${tid}) + (select count(*) from goals where tag_id = ${tid}) as used_by`
  if (Number(usedBy) > 0) return { ok: false, usedBy: Number(usedBy) }
  await sql`delete from tags where id = ${tid}`
  return { ok: true }
}

export async function createGoal(input: { weekStart: string; title: string; tagId: number }): Promise<void> {
  await requireUser()
  await db()`insert into goals (week_start, title, tag_id)
    values (${assertMonday(input.weekStart)}, ${cleanTitle(input.title)}, ${assertId(input.tagId)})`
}

export async function updateGoal(id: number, patch: { title?: string; tagId?: number; hit?: boolean }): Promise<void> {
  await requireUser()
  const set: Record<string, unknown> = {}
  if (patch.title !== undefined) set.title = cleanTitle(patch.title)
  if (patch.tagId !== undefined) set.tagId = assertId(patch.tagId)
  if (patch.hit !== undefined) set.hit = patch.hit === true
  if (!Object.keys(set).length) return
  const sql = db()
  await sql`update goals set ${sql(set)} where id = ${assertId(id)}`
}

export async function deleteGoal(id: number): Promise<void> {
  await requireUser()
  await db()`delete from goals where id = ${assertId(id)}`
}

export async function createTodo(input: { date: string; title: string; tagId: number; goalId: number | null }): Promise<void> {
  await requireUser()
  const date = assertDate(input.date)
  await checkGoalFor(input.goalId, date)
  await db()`insert into todos (date, planned_date, title, tag_id, goal_id)
    values (${date}, ${date}, ${cleanTitle(input.title)}, ${assertId(input.tagId)}, ${input.goalId ?? null})`
}

export async function updateTodo(
  id: number,
  patch: { title?: string; tagId?: number; goalId?: number | null; done?: boolean },
): Promise<void> {
  await requireUser()
  const tid = assertId(id)
  const sql = db()
  const set: Record<string, unknown> = {}
  if (patch.title !== undefined) set.title = cleanTitle(patch.title)
  if (patch.tagId !== undefined) set.tagId = assertId(patch.tagId)
  if (patch.done !== undefined) set.done = patch.done === true
  if (patch.goalId !== undefined) {
    const [t] = await sql<{ date: string }[]>`select date from todos where id = ${tid}`
    if (!t) throw new Error('To-do not found.')
    await checkGoalFor(patch.goalId, t.date)
    set.goalId = patch.goalId
  }
  if (!Object.keys(set).length) return
  await sql`update todos set ${sql(set)} where id = ${tid}`
}

export async function moveTodo(id: number, toDate: string): Promise<void> {
  await requireUser()
  const tid = assertId(id)
  const to = assertDate(toDate)
  const sql = db()
  const [t] = await sql<{ date: string }[]>`select date from todos where id = ${tid}`
  if (!t) throw new Error('To-do not found.')
  if (mondayOf(t.date) !== mondayOf(to)) throw new Error('A to-do can only move within its week.')
  // planned_date stays, so the original day keeps showing it as moved.
  await sql`update todos set date = ${to} where id = ${tid}`
}

export async function deleteTodo(id: number): Promise<void> {
  await requireUser()
  await db()`delete from todos where id = ${assertId(id)}`
}

export async function saveNotes(weekStart: string, notes: { wentWell: string; improve: string }): Promise<void> {
  await requireUser()
  const ws = assertMonday(weekStart)
  const wentWell = cleanNote(notes.wentWell)
  const improve = cleanNote(notes.improve)
  await db()`insert into week_notes (week_start, went_well, improve) values (${ws}, ${wentWell}, ${improve})
    on conflict (week_start) do update set went_well = excluded.went_well, improve = excluded.improve`
}
