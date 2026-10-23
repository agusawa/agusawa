jest.mock('server-only', () => ({}))
jest.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined }) }))
jest.mock('@/lib/firebaseAdmin', () => ({ adminAuth: () => { throw new Error('not used') } }))
const redirect = jest.fn(() => { throw new Error('NEXT_REDIRECT') })
jest.mock('next/navigation', () => ({ redirect }))

import { requireUser } from '@/lib/session'

it('sends a signed-out caller to /login instead of a generic error', async () => {
  await expect(requireUser()).rejects.toThrow('NEXT_REDIRECT')
  expect(redirect).toHaveBeenCalledWith('/login')
})
