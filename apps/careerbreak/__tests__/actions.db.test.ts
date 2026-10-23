// Runs against a real MongoDB: MONGODB_TEST_URI=mongodb://localhost:27018 pnpm test
// Skipped when the variable is not set.
jest.mock('server-only', () => ({}))
jest.mock('@/lib/session', () => ({ requireUser: async () => ({ email: 'test@local' }) }))

const TEST_URI = process.env.MONGODB_TEST_URI
if (TEST_URI) process.env.MONGODB_URI = `${TEST_URI.replace(/\/$/, '')}/careerbreak_test`

import * as A from '@/app/actions'
import { closeDb, db } from '@/lib/db/client'
import { ensureIndexes } from '@/lib/db/indexes'

const run = TEST_URI ? describe : describe.skip

run('actions against MongoDB', () => {
  beforeAll(async () => {
    await (await db()).dropDatabase()
    await ensureIndexes()
  })
  afterAll(async () => {
    await (await db()).dropDatabase()
    await closeDb()
  })

  it('treats tag names as unique regardless of case', async () => {
    const a = await A.createTag('Learning')
    const b = await A.createTag('learning')
    expect(b.id).toBe(a.id)
    expect(typeof a.id).toBe('string')
  })

  it('rejects renaming a tag to an existing name', async () => {
    await A.createTag('Freelance')
    const other = await A.createTag('Job hunt')
    expect(await A.renameTag(other.id, 'freelance')).toEqual({ ok: false, error: 'A tag with that name already exists.' })
  })

  it('blocks deleting a tag that is still used, and counts the uses', async () => {
    const tag = await A.createTag('In use')
    await A.createGoal({ weekStart: '2026-10-26', title: 'G', tagId: tag.id })
    await A.createTodo({ date: '2026-10-27', title: 'T', tagId: tag.id, goalId: null })
    expect(await A.deleteTag(tag.id)).toEqual({ ok: false, usedBy: 2 })
  })

  it('deletes an unused tag', async () => {
    const tag = await A.createTag('Unused')
    expect(await A.deleteTag(tag.id)).toEqual({ ok: true })
    const week = await A.getWeek('2026-10-26')
    expect(week.tags.find((t) => t.id === tag.id)).toBeUndefined()
  })

  it('rejects a to-do with a tag that does not exist', async () => {
    await expect(A.createTodo({ date: '2026-10-27', title: 'T', tagId: '0123456789abcdef01234567', goalId: null })).rejects.toThrow()
  })

  it('unlinks to-dos when their goal is deleted, keeping the to-dos', async () => {
    const tag = await A.createTag('Goals')
    await A.createGoal({ weekStart: '2026-10-26', title: 'Ship', tagId: tag.id })
    const goal = (await A.getWeek('2026-10-26')).goals.find((g) => g.title === 'Ship')!
    await A.createTodo({ date: '2026-10-28', title: 'Linked', tagId: tag.id, goalId: goal.id })
    await A.deleteGoal(goal.id)
    const todo = (await A.getWeek('2026-10-26')).todos.find((t) => t.title === 'Linked')!
    expect(todo.goalId).toBeNull()
  })

  it('rejects linking a to-do to a goal from another week', async () => {
    const tag = await A.createTag('Weeks')
    await A.createGoal({ weekStart: '2026-10-26', title: 'Week 1 goal', tagId: tag.id })
    const goal = (await A.getWeek('2026-10-26')).goals.find((g) => g.title === 'Week 1 goal')!
    await expect(A.createTodo({ date: '2026-11-02', title: 'X', tagId: tag.id, goalId: goal.id })).rejects.toThrow()
  })

  it('keeps the planned day when a to-do moves, and getWeek returns it once', async () => {
    const tag = await A.createTag('Moves')
    await A.createTodo({ date: '2026-10-26', title: 'Mover', tagId: tag.id, goalId: null })
    let todo = (await A.getWeek('2026-10-26')).todos.find((t) => t.title === 'Mover')!
    await A.moveTodo(todo.id, '2026-10-29')
    const todos = (await A.getWeek('2026-10-26')).todos.filter((t) => t.title === 'Mover')
    expect(todos).toHaveLength(1)
    todo = todos[0]
    expect([todo.date, todo.plannedDate]).toEqual(['2026-10-29', '2026-10-26'])
  })

  it('refuses to move a to-do into another week', async () => {
    const todo = (await A.getWeek('2026-10-26')).todos.find((t) => t.title === 'Mover')!
    await expect(A.moveTodo(todo.id, '2026-11-02')).rejects.toThrow()
  })

  it('saves notes and returns them as this week and as next week’s previous notes', async () => {
    await A.saveNotes('2026-10-26', { wentWell: 'mornings', improve: 'pitch earlier' })
    expect((await A.getWeek('2026-10-26')).notes).toEqual({ weekStart: '2026-10-26', wentWell: 'mornings', improve: 'pitch earlier' })
    expect((await A.getWeek('2026-11-02')).prevNotes?.improve).toBe('pitch earlier')
  })

  it('rejects an invalid id', async () => {
    await expect(A.deleteTodo('not-an-id')).rejects.toThrow('Invalid id.')
  })
})
