import 'server-only'
import { cookies } from 'next/headers'
import { isAllowedEmail } from './auth'
import { adminAuth } from './firebaseAdmin'

export const SESSION_COOKIE = 'session'
export const SESSION_MAX_AGE_S = 14 * 24 * 60 * 60

export async function getUser(): Promise<{ email: string } | null> {
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

export async function requireUser(): Promise<{ email: string }> {
  const user = await getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}
