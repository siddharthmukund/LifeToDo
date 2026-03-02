// src/auth/AuthProvider.tsx
// Bridges Firebase's onAuthStateChanged listener into the Zustand auth store.
// Mount this once at the app root (layout.tsx). It never blocks rendering.
'use client'

import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { FIREBASE_CONFIGURED, getFirebaseAuth } from '@/lib/firebase'
import { useAuthStore } from './authStore'
import {
  mapFirebaseUser,
  handlePostAuthMigration,
  getRedirectResult,
  getAuthErrorMessage,
} from './authService'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setAuthState, setLoading, setError, setAnonId } =
    useAuthStore()

  useEffect(() => {
    // ── 1. Initialise permanent anonymous ID ────────────────────────────
    let anonId = localStorage.getItem('ltd-anon-id')
    if (!anonId) {
      anonId = crypto.randomUUID()
      localStorage.setItem('ltd-anon-id', anonId)
    }
    setAnonId(anonId)

    // ── 2. Bail out gracefully when Firebase is not configured ──────────
    if (!FIREBASE_CONFIGURED) {
      setLoading(false)
      setAuthState('ANONYMOUS')
      return
    }

    const auth = getFirebaseAuth()

    // ── 3. Handle mobile OAuth redirect result ──────────────────────────
    // On mobile PWA, signInWithRedirect causes a page reload.
    // getRedirectResult picks up the credential after the redirect.
    getRedirectResult(auth).catch((err: { code?: string }) => {
      const code = err.code ?? ''
      // Ignore "no redirect" — that's the normal case on non-redirect flows
      if (code && code !== 'auth/null-user') {
        setError(getAuthErrorMessage(code))
        setAuthState('AUTH_ERROR')
      }
    })

    // ── 4. Subscribe to Firebase auth state ─────────────────────────────
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const authUser = mapFirebaseUser(firebaseUser)
        setUser(authUser)
        setAuthState(
          firebaseUser.emailVerified || authUser.providers.some(p => p !== 'email')
            ? 'AUTHENTICATED'
            : 'EMAIL_VERIFICATION_PENDING'
        )
        setError(null)
        // Run idempotent migration in the background — never blocks UI
        void handlePostAuthMigration(firebaseUser.uid)
      } else {
        setUser(null)
        setAuthState('ANONYMOUS')
      }
      setLoading(false)
    })

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
