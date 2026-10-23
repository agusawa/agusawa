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
    <main className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-4">
      <h1 className="text-2xl font-semibold">Career Break</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Plan each day, review each week.</p>
      <button
        onClick={signIn}
        disabled={busy}
        className="mt-2 px-4 py-2 rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-sm font-medium disabled:opacity-50"
      >
        {busy ? 'Signing in…' : 'Sign in with Google'}
      </button>
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </main>
  )
}
