// Shared class strings so every screen looks the same.
export const input =
  'w-full min-w-0 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-2.5 py-1.5 text-sm outline-none focus:border-zinc-500'
export const button =
  'shrink-0 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3 py-1.5 text-sm font-medium disabled:opacity-40'
export const ghost = 'shrink-0 rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900'
export const sectionTitle = 'text-xs uppercase tracking-wider text-zinc-500 mb-2'

/** Run a server action; server error text is hidden in production, so show a plain message. */
export async function run(fn: () => Promise<unknown>, after?: () => unknown): Promise<boolean> {
  try {
    await fn()
    await after?.()
    return true
  } catch {
    alert('Something went wrong. Please try again.')
    return false
  }
}
