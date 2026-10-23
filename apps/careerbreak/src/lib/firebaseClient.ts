'use client'

import { getApps, initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth, inMemoryPersistence, setPersistence, signInWithPopup, signOut } from 'firebase/auth'

function auth() {
  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    })
  return getAuth(app)
}

/** Google popup sign-in; returns a fresh ID token for the server to swap for a session cookie. */
export async function signInWithGoogle(): Promise<string> {
  const a = auth()
  // The server cookie is the session; don't keep a second one in the browser.
  await setPersistence(a, inMemoryPersistence)
  const cred = await signInWithPopup(a, new GoogleAuthProvider())
  return cred.user.getIdToken()
}

export async function signOutClient(): Promise<void> {
  await signOut(auth())
}
