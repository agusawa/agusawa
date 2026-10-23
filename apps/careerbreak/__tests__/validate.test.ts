import { assertDate, assertGoalWeek, cleanNote, cleanTagName, cleanTitle } from '@/lib/validate'

describe('cleanTitle', () => {
  it('trims', () => expect(cleanTitle('  Pitch  ')).toBe('Pitch'))
  it('rejects blank', () => expect(() => cleanTitle('   ')).toThrow())
  it('rejects non-strings', () => expect(() => cleanTitle(42)).toThrow())
  it('rejects over 200 chars', () => expect(() => cleanTitle('a'.repeat(201))).toThrow())
  it('accepts 200 chars', () => expect(cleanTitle('a'.repeat(200))).toHaveLength(200))
})

describe('cleanTagName', () => {
  it('trims', () => expect(cleanTagName(' learning ')).toBe('learning'))
  it('rejects blank', () => expect(() => cleanTagName('')).toThrow())
  it('rejects over 30 chars', () => expect(() => cleanTagName('a'.repeat(31))).toThrow())
})

describe('assertDate', () => {
  it('accepts a real date', () => expect(assertDate('2026-10-26')).toBe('2026-10-26'))
  it('rejects an impossible date', () => expect(() => assertDate('2026-02-30')).toThrow())
  it('rejects a loose format', () => expect(() => assertDate('2026-1-5')).toThrow())
  it('rejects non-strings', () => expect(() => assertDate(undefined)).toThrow())
})

describe('assertGoalWeek', () => {
  it('passes for a date in the goal week', () => expect(() => assertGoalWeek('2026-10-26', '2026-11-01')).not.toThrow())
  it('throws for a date in another week', () => expect(() => assertGoalWeek('2026-10-26', '2026-11-02')).toThrow())
})

describe('cleanNote', () => {
  it('turns non-strings into empty', () => expect(cleanNote(null)).toBe(''))
  it('keeps text', () => expect(cleanNote('ok')).toBe('ok'))
  it('rejects over 5000 chars', () => expect(() => cleanNote('a'.repeat(5001))).toThrow())
})
