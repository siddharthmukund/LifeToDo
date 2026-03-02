// src/auth/useRequireAuth.ts
// Lightweight hook for components that need to know if auth is present.
// Does NOT redirect — use AuthGate for rendering decisions.
'use client'

import { useAuthStore } from './authStore'

export function useRequireAuth() {
  const { user, isLoading, authState } = useAuthStore()
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
    authState,
  }
}
