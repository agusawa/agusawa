/** Calls back when "today" may have changed: tab shown again, window focused, or each minute. */
export function subscribeToday(onChange: () => void, target: EventTarget = window): () => void {
  const events = ['visibilitychange', 'focus']
  events.forEach((e) => target.addEventListener(e, onChange))
  const timer = setInterval(onChange, 60_000)
  return () => {
    events.forEach((e) => target.removeEventListener(e, onChange))
    clearInterval(timer)
  }
}
