// src/auth/authStore.ts
// Zustand slice for authentication state.
// NOT persisted to IndexedDB — Firebase Auth handles session persistence via
// browserLocalPersistence. This store is purely in-memory UI state.
'use client'

import { create } from 'zustand'
import type { AuthStoreState, AuthStoreActions } from './types'

export const useAuthStore = create<AuthStoreState & AuthStoreActions>((set) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  user:      null,
  authState: 'ANONYMOUS',
  error:     null,
  isLoading: true,   // true until first onAuthStateChanged fires
  anonId:    null,

  // ── Actions ────────────────────────────────────────────────────────────────
  setUser:      (user)      => set({ user }),
  setAuthState: (authState) => set({ authState }),
  setError:     (error)     => set({ error }),
  setLoading:   (isLoading) => set({ isLoading }),
  setAnonId:    (anonId)    => set({ anonId }),
}))
