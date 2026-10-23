import { addDays, breakDay, formatDay, formatRange, shortDay, weekDays, weekNumber, weekStart } from '@/lib/dates'

describe('weekStart', () => {
  it('keeps a Monday', () => expect(weekStart('2026-10-26')).toBe('2026-10-26'))
  it('maps Sunday to the previous Monday', () => expect(weekStart('2026-11-01')).toBe('2026-10-26'))
  it('maps the next Monday to itself', () => expect(weekStart('2026-11-02')).toBe('2026-11-02'))

  it('ignores the server timezone', () => {
    const prev = process.env.TZ
    process.env.TZ = 'America/Los_Angeles'
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const d = require('@/lib/dates')
      expect(d.weekStart('2026-11-01')).toBe('2026-10-26')
    })
    process.env.TZ = prev
  })
})

describe('addDays', () => {
  it('crosses month end', () => expect(addDays('2026-10-31', 1)).toBe('2026-11-01'))
  it('crosses year end', () => expect(addDays('2026-12-31', 1)).toBe('2027-01-01'))
  it('goes backwards', () => expect(addDays('2026-11-02', -7)).toBe('2026-10-26'))
})

it('weekDays lists Mon..Sun', () => {
  expect(weekDays('2026-10-26')).toEqual([
    '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01',
  ])
})

it('weekNumber counts from the break start', () => {
  expect(weekNumber('2026-10-26')).toBe(1)
  expect(weekNumber('2026-11-02')).toBe(2)
})

it('breakDay is null before Day 1 and counts inclusively after', () => {
  expect(breakDay('2026-10-25')).toBeNull()
  expect(breakDay('2026-10-26')).toBe(1)
  expect(breakDay('2026-11-02')).toBe(8)
})

it('formats dates in fixed English', () => {
  expect(formatDay('2026-10-29')).toBe('Thursday, 29 Oct')
  expect(shortDay('2026-10-29')).toBe('Thu')
  expect(formatRange('2026-10-26')).toBe('26 Oct – 1 Nov')
})
