import 'server-only'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'

export function adminAuth(): Auth {
  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Env vars usually carry the key with literal "\n".
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  return getAuth(app)
}
