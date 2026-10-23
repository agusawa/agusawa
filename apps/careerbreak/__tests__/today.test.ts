import { subscribeToday } from '@/lib/today'

describe('subscribeToday', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('re-checks the date when the tab becomes visible again', () => {
    const target = new EventTarget()
    const cb = jest.fn()
    subscribeToday(cb, target)
    target.dispatchEvent(new Event('visibilitychange'))
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('re-checks the date when the window regains focus', () => {
    const target = new EventTarget()
    const cb = jest.fn()
    subscribeToday(cb, target)
    target.dispatchEvent(new Event('focus'))
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('re-checks the date every minute while open', () => {
    const cb = jest.fn()
    subscribeToday(cb, new EventTarget())
    jest.advanceTimersByTime(60_000)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('stops after unsubscribe', () => {
    const target = new EventTarget()
    const cb = jest.fn()
    const off = subscribeToday(cb, target)
    off()
    target.dispatchEvent(new Event('focus'))
    jest.advanceTimersByTime(120_000)
    expect(cb).not.toHaveBeenCalled()
  })
})
