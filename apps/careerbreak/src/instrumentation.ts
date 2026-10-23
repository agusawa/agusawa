export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { ensureIndexes } = await import('./lib/db/indexes')
    await ensureIndexes()
  }
}
