// Shared class strings so every screen looks the same.
export const input =
  'w-full min-w-0 rounded-lg border border-rule bg-sheet px-3 py-2.5 text-[16px] text-ink placeholder:text-graphite/70 outline-none focus:border-pine'
export const button =
  'shrink-0 rounded-lg bg-pine text-sheet px-4 py-2.5 text-[15px] font-semibold disabled:opacity-35'
export const ghost = 'shrink-0 rounded-lg px-3 py-2 text-[15px] text-graphite hover:text-ink hover:bg-rule/50'
/** Section headings: sentence case, quiet, no all-caps label. */
export const sectionTitle = 'text-[15px] font-semibold text-graphite mb-2'

/** Run a server action; server error text is hidden in production, so show a plain message. */
export async function run(fn: () => Promise<unknown>, after?: () => unknown): Promise<boolean> {
  try {
    await fn()
    await after?.()
    return true
  } catch {
    alert('That didn’t save. Check your connection and try again.')
    return false
  }
}
