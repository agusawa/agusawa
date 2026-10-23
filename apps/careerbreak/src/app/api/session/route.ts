import { NextResponse } from 'next/server'
import { isAllowedEmail } from '@/lib/auth'
import { adminAuth } from '@/lib/firebaseAdmin'
import { SESSION_COOKIE, SESSION_MAX_AGE_S } from '@/lib/session'

const forbidden = () => NextResponse.json({ error: 'This account is not allowed.' }, { status: 403 })

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const idToken = typeof body?.idToken === 'string' ? body.idToken : null
  if (!idToken) return forbidden()

  try {
    const auth = adminAuth()
    const decoded = await auth.verifyIdToken(idToken, true)
    if (!isAllowedEmail(decoded.email, decoded.email_verified, process.env.ALLOWED_EMAIL)) return forbidden()
    // Only accept a sign-in that just happened, per Firebase's session-cookie guidance.
    if (Date.now() / 1000 - decoded.auth_time > 5 * 60) return forbidden()

    const cookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_S * 1000 })
    const res = new NextResponse(null, { status: 204 })
    res.cookies.set(SESSION_COOKIE, cookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_S,
    })
    return res
  } catch {
    return forbidden()
  }
}

export async function DELETE() {
  const res = new NextResponse(null, { status: 204 })
  res.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  return res
}
