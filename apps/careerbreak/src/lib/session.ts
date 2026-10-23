import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isAllowedEmail } from './auth'
import { adminAuth } from './firebaseAdmin'

export const SESSION_COOKIE = 'session'
export const SESSION_MAX_AGE_S = 14 * 24 * 60 * 60

export async function getUser(): Promise<{ email: string } | null> {
  // Local testing without Firebase. `next build` / `next start` force NODE_ENV=production, so this can't run in prod.
  if (process.env.NODE_ENV === 'development' && process.env.DEV_SKIP_AUTH === '1') return { email: 'dev@localhost' }
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value
  if (!cookie) return null
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true)
    if (!isAllowedEmail(decoded.email, decoded.email_verified, process.env.ALLOWED_EMAIL)) return null
    return { email: decoded.email! }
  } catch {
    return null
  }
}

// Redirect (not throw) so an expired session in an open tab lands on /login; Next applies it client-side for actions.
export async function requireUser(): Promise<{ email: string }> {
  const user = await getUser()
  if (!user) redirect('/login')
  return user
}
