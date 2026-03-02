// src/auth/authService.ts
// Firebase Auth wrapper — all sign-in, sign-out, and account management logic.
// Components call these functions; they never call Firebase directly.
'use client'

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  linkWithPopup,
  linkWithRedirect,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  OAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

import { getFirebaseAuth, getFirebaseFirestore, FIREBASE_CONFIGURED } from '@/lib/firebase'
import { db } from '@/lib/db'
import { useAuthStore } from './authStore'
import type { AuthUser, AuthProviderType } from './types'

// ── Provider singletons ───────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')

const appleProvider = new OAuthProvider('apple.com')
appleProvider.addScope('email')
appleProvider.addScope('name')

// ── Utilities ─────────────────────────────────────────────────────────────

/** True on mobile browsers and PWA standalone mode — use redirect, not popup */
export function isMobileOrPWA(): boolean {
  if (typeof window === 'undefined') return false
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  const isIOSStandalone =
    'standalone' in window.navigator &&
    (window.navigator as { standalone?: boolean }).standalone === true
  const isMobileUA = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  return isStandalone || isIOSStandalone || isMobileUA
}

/** Maps a Firebase User to our app-internal AuthUser shape */
export function mapFirebaseUser(user: FirebaseUser): AuthUser {
  return {
    uid:           user.uid,
    email:         user.email,
    displayName:   user.displayName,
    photoURL:      user.photoURL,
    emailVerified: user.emailVerified,
    providers:     user.providerData.map(
      p => p.providerId as AuthProviderType
    ),
  }
}

/** Maps Firebase error codes to user-facing strings */
export function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use':
      'That email is already registered. Try signing in instead.',
    'auth/wrong-password':
      'Incorrect password. Try again or reset your password.',
    'auth/invalid-credential':
      'Incorrect email or password.',
    'auth/user-not-found':
      'No account found with that email.',
    'auth/too-many-requests':
      'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed':
      'Network error. Check your connection and try again.',
    'auth/popup-closed-by-user':
      'Sign-in was cancelled.',
    'auth/cancelled-popup-request':
      'Sign-in was cancelled.',
    'auth/popup-blocked':
      'Pop-up was blocked. Please allow pop-ups or use a different sign-in method.',
    'auth/invalid-email':
      'Please enter a valid email address.',
    'auth/weak-password':
      'Password must be at least 6 characters.',
    'auth/requires-recent-login':
      'For security, please sign in again before making this change.',
    'auth/provider-already-linked':
      'This sign-in method is already linked to your account.',
    'auth/credential-already-in-use':
      'These credentials are already associated with a different account.',
    'auth/account-exists-with-different-credential':
      'An account already exists with this email using a different sign-in method.',
    'auth/operation-not-allowed':
      'This sign-in method is not enabled. Please contact support.',
  }
  return messages[code] ?? 'Something went wrong. Please try again.'
}

// ── Guard ─────────────────────────────────────────────────────────────────

function assertFirebase(): void {
  if (!FIREBASE_CONFIGURED) {
    throw new Error(
      'Firebase is not configured. Add your Firebase credentials to .env.local — ' +
      'see .env.local.example for required keys.'
    )
  }
}

// ── Auth actions ──────────────────────────────────────────────────────────

/** Sign up with email + password. Sends verification email. */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<void> {
  assertFirebase()
  const { setAuthState, setError, setLoading } = useAuthStore.getState()
  setAuthState('SIGNING_UP')
  setLoading(true)
  setError(null)
  try {
    const cred = await createUserWithEmailAndPassword(
      getFirebaseAuth(), email, password
    )
    await sendEmailVerification(cred.user)
    setAuthState('EMAIL_VERIFICATION_PENDING')
    // onAuthStateChanged in AuthProvider will set user + AUTHENTICATED state
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? ''
    setError(getAuthErrorMessage(code))
    setAuthState('AUTH_ERROR')
    throw err
  } finally {
    setLoading(false)
  }
}

/** Sign in with email + password. */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<void> {
  assertFirebase()
  const { setAuthState, setError, setLoading } = useAuthStore.getState()
  setAuthState('SIGNING_IN')
  setLoading(true)
  setError(null)
  try {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
    // onAuthStateChanged handles the rest
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? ''
    setError(getAuthErrorMessage(code))
    setAuthState('AUTH_ERROR')
    throw err
  } finally {
    setLoading(false)
  }
}

/** Sign in with Google. Uses popup on desktop, redirect on mobile/PWA. */
export async function signInWithGoogle(): Promise<void> {
  assertFirebase()
  const { setAuthState, setError } = useAuthStore.getState()
  setAuthState('SIGNING_IN')
  setError(null)
  try {
    if (isMobileOrPWA()) {
      await signInWithRedirect(getFirebaseAuth(), googleProvider)
      // Page will redirect — result handled in AuthProvider via getRedirectResult
    } else {
      await signInWithPopup(getFirebaseAuth(), googleProvider)
      // onAuthStateChanged handles the rest
    }
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? ''
    if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
      setError(getAuthErrorMessage(code))
    }
    setAuthState('AUTH_ERROR')
    throw err
  }
}

/** Sign in with Apple. Uses popup on desktop, redirect on mobile/PWA. */
export async function signInWithApple(): Promise<void> {
  assertFirebase()
  const { setAuthState, setError } = useAuthStore.getState()
  setAuthState('SIGNING_IN')
  setError(null)
  try {
    if (isMobileOrPWA()) {
      await signInWithRedirect(getFirebaseAuth(), appleProvider)
    } else {
      await signInWithPopup(getFirebaseAuth(), appleProvider)
    }
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? ''
    if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
      setError(getAuthErrorMessage(code))
    }
    setAuthState('AUTH_ERROR')
    throw err
  }
}

/** Sign out the current user. */
export async function signOut(): Promise<void> {
  const { setAuthState, setError, setLoading } = useAuthStore.getState()
  setAuthState('SIGNING_OUT')
  setLoading(true)
  try {
    if (FIREBASE_CONFIGURED) {
      await firebaseSignOut(getFirebaseAuth())
    }
    // onAuthStateChanged handles clearing user state
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? ''
    setError(getAuthErrorMessage(code))
    setAuthState('AUTH_ERROR')
    throw err
  } finally {
    setLoading(false)
  }
}

/** Send password reset email. */
export async function sendPasswordReset(email: string): Promise<void> {
  assertFirebase()
  await sendPasswordResetEmail(getFirebaseAuth(), email)
}

/** Re-send email verification to the current user. */
export async function resendVerificationEmail(): Promise<void> {
  assertFirebase()
  const user = getFirebaseAuth().currentUser
  if (!user) throw new Error('No user signed in')
  await sendEmailVerification(user)
}

/** Link an additional provider to the current account. */
export async function linkAuthProvider(
  provider: 'google' | 'apple'
): Promise<void> {
  assertFirebase()
  const { setAuthState, setError } = useAuthStore.getState()
  const user = getFirebaseAuth().currentUser
  if (!user) throw new Error('No user signed in')

  setAuthState('LINKING_PROVIDER')
  setError(null)
  try {
    const p = provider === 'google' ? googleProvider : appleProvider
    if (isMobileOrPWA()) {
      await linkWithRedirect(user, p)
    } else {
      await linkWithPopup(user, p)
    }
    setAuthState('AUTHENTICATED')
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? ''
    setError(getAuthErrorMessage(code))
    setAuthState('AUTH_ERROR')
    throw err
  }
}

// ── Post-authentication migration ─────────────────────────────────────────

/**
 * Called once after authentication. Idempotent — safe to call every sign-in.
 *
 * 1. Creates Firestore profile doc if it doesn't exist yet.
 * 2. Updates local Dexie Settings with firebaseUid.
 * 3. If tier === 'pro', marks all local records as 'queued' for sync.
 */
export async function handlePostAuthMigration(uid: string): Promise<void> {
  if (!FIREBASE_CONFIGURED) return

  try {
    // 1. Update local settings with Firebase UID
    const localSettings = await db.settings.get('singleton')
    if (localSettings && localSettings.firebaseUid !== uid) {
      await db.settings.update('singleton', { firebaseUid: uid })
    }

    // 2. Create Firestore profile if it doesn't exist
    const firestore = getFirebaseFirestore()
    const profileRef = doc(firestore, 'users', uid, 'data', 'profile')
    const profileSnap = await getDoc(profileRef)

    if (!profileSnap.exists()) {
      const user = getFirebaseAuth().currentUser
      await setDoc(profileRef, {
        uid,
        email:           user?.email ?? null,
        displayName:     user?.displayName ?? '',
        avatarUrl:       user?.photoURL ?? null,
        bio:             '',
        timezone:        Intl.DateTimeFormat().resolvedOptions().timeZone,
        role:            'custom',
        workingHours: {
          enabled:   false,
          days:      [1, 2, 3, 4, 5],
          startTime: '09:00',
          endTime:   '18:00',
        },
        reviewSchedule: {
          dayOfWeek:              0,
          timeOfDay:             '18:00',
          reminderMinutesBefore: 30,
        },
        defaultContexts: [],
        createdAt:       serverTimestamp(),
        updatedAt:       serverTimestamp(),
      })
    }

    // 3. Queue bulk sync for Pro users
    if (localSettings?.tier === 'pro') {
      const tables = [
        db.inbox_items,
        db.actions,
        db.projects,
      ] as const
      for (const table of tables) {
        await table
          .where('syncStatus')
          .equals('local')
          .modify({ syncStatus: 'queued' })
      }
    }
  } catch (err) {
    // Migration failure is non-fatal — log locally and continue
    console.warn('[auth] Post-auth migration failed, will retry on next sign-in:', err)
  }
}

// ── Re-export for mobile redirect handling ────────────────────────────────
export { getRedirectResult }
