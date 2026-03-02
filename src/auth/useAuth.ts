// src/auth/useAuth.ts
// Primary hook for consuming auth state and actions in components.
'use client'

import { useAuthStore } from './authStore'
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
  signOut,
  sendPasswordReset,
  resendVerificationEmail,
  linkAuthProvider,
} from './authService'

export function useAuth() {
  const { user, authState, error, isLoading, anonId } = useAuthStore()

  return {
    // ── State ──────────────────────────────────────────────────────────────
    user,
    authState,
    error,
    isLoading,
    anonId,
    isAuthenticated:   !!user,
    isEmailVerified:   user?.emailVerified ?? false,
    isPendingVerification: authState === 'EMAIL_VERIFICATION_PENDING',

    // ── Actions ────────────────────────────────────────────────────────────
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
    sendPasswordReset,
    resendVerificationEmail,
    linkAuthProvider,
  }
}
