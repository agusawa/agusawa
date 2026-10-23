import { db } from './client'
import { MIGRATIONS } from './migrations'

export async function migrate(): Promise<void> {
  const sql = db()
  await sql`create table if not exists schema_migrations (id int primary key, applied_at timestamptz not null default now())`
  const done = new Set((await sql<{ id: number }[]>`select id from schema_migrations`).map((r) => r.id))
  for (const [id, text] of MIGRATIONS.entries()) {
    if (done.has(id)) continue
    await sql.begin(async (tx) => {
      await tx.unsafe(text)
      await tx`insert into schema_migrations (id) values (${id})`
    })
    console.log(`[migrate] applied migration ${id}`)
  }
}
