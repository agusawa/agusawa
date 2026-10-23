import postgres from 'postgres'

function create() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set.')
  return postgres(url, {
    prepare: false, // required by Supabase's transaction pooler
    transform: postgres.camel,
    onnotice: () => {}, // "already exists, skipping" noise from migrate()
    // Keep DATE columns as 'YYYY-MM-DD' strings instead of JS Dates.
    types: { date: { to: 1082, from: [1082], serialize: (x: string) => x, parse: (x: string) => x } },
  })
}

type Sql = ReturnType<typeof create>
const g = globalThis as unknown as { __careerbreakSql?: Sql }

export function db(): Sql {
  return (g.__careerbreakSql ??= create())
}
