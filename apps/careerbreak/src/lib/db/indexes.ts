import { db } from './client'

/** Idempotent; runs on every server start (see instrumentation.ts). */
export async function ensureIndexes(): Promise<void> {
  const d = await db()
  await Promise.all([
    d.collection('tags').createIndex({ nameLower: 1 }, { unique: true }),
    d.collection('goals').createIndex({ weekStart: 1 }),
    d.collection('goals').createIndex({ tagId: 1 }),
    d.collection('todos').createIndex({ date: 1 }),
    d.collection('todos').createIndex({ plannedDate: 1 }),
    d.collection('todos').createIndex({ tagId: 1 }),
    d.collection('todos').createIndex({ goalId: 1 }),
  ])
}
