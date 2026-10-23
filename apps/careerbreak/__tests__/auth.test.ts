import { isAllowedEmail } from '@/lib/auth'

describe('isAllowedEmail', () => {
  it('allows the exact email', () => expect(isAllowedEmail('agus@x.com', true, 'agus@x.com')).toBe(true))
  it('ignores case and surrounding spaces', () => expect(isAllowedEmail(' Agus@X.com ', true, 'agus@x.com ')).toBe(true))
  it('rejects an unverified email', () => expect(isAllowedEmail('agus@x.com', false, 'agus@x.com')).toBe(false))
  it('rejects verified unknown', () => expect(isAllowedEmail('agus@x.com', undefined, 'agus@x.com')).toBe(false))
  it('rejects another email', () => expect(isAllowedEmail('other@x.com', true, 'agus@x.com')).toBe(false))
  it('fails closed when the allowlist is empty', () => expect(isAllowedEmail('agus@x.com', true, '')).toBe(false))
  it('fails closed when the allowlist is blank', () => expect(isAllowedEmail('', true, '  ')).toBe(false))
  it('fails closed when the allowlist is unset', () => expect(isAllowedEmail('agus@x.com', true, undefined)).toBe(false))
  it('rejects a missing email', () => expect(isAllowedEmail(undefined, true, 'agus@x.com')).toBe(false))
})
