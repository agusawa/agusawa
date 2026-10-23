'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { signInWithGoogle, signOutClient } from '@/lib/firebaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function signIn() {
    setBusy(true)
    setError(null)
    try {
      const idToken = await signInWithGoogle()
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      await signOutClient()
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? 'Sign-in failed.')
        return
      }
      router.replace('/')
      router.refresh()
    } catch {
      setError('Sign-in was cancelled or failed. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-[75vh] flex flex-col justify-center gap-4">
      <h1 className="text-[4rem] sm:text-[5.5rem] font-extrabold tracking-[-0.045em] leading-[0.95]">Career<br />Break</h1>
      <p className="text-[17px] text-graphite">Plan each day. Review each Sunday. Do better next week.</p>
      <button
        onClick={signIn}
        disabled={busy}
        className="mt-4 self-start rounded-lg bg-pine text-sheet px-5 py-3 text-[16px] font-semibold disabled:opacity-50"
      >
        {busy ? 'Signing in…' : 'Sign in with Google'}
      </button>
      {error && <p role="alert" className="text-[15px] text-flag">{error}</p>}
    </main>
  )
}
