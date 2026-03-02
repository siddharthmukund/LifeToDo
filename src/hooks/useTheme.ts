'use client'
// hooks/useTheme.ts
// iCCW #5 — Reactive theme hook.
//
// Reads theme preference from Zustand settings (persisted in Dexie),
// applies it as data-theme attribute on <html>, and mirrors to localStorage
// so the FOUC-prevention script in layout.tsx has the value on next load.
//
// The matchMedia listener keeps the DOM in sync when the user changes their
// OS dark-mode preference while the app is open (only relevant for 'system').

import { useEffect, useCallback } from 'react'
import { useGTDStore }            from '@/store/gtdStore'

export type ThemeMode     = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

/** localStorage key mirrored by the FOUC script. */
export const THEME_LS_KEY = 'ltd-theme'

// ── Helpers ───────────────────────────────────────────────────────────────

function resolveTheme(pref: ThemeMode): ResolvedTheme {
  if (pref === 'system') {
    return typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return pref
}

function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', resolved)
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useTheme() {
  const settings       = useGTDStore(s => s.settings)
  const updateSettings = useGTDStore(s => s.updateSettings)

  const pref: ThemeMode = (settings?.theme as ThemeMode) ?? 'system'
  const resolved        = resolveTheme(pref)

  // Apply theme whenever the preference changes (also handles initial load)
  useEffect(() => {
    applyTheme(resolved)
    try { localStorage.setItem(THEME_LS_KEY, pref) } catch { /* storage disabled */ }
  }, [pref, resolved])

  // OS preference listener — only active when the user chose 'system'
  useEffect(() => {
    if (pref !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) =>
      applyTheme(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [pref])

  const setTheme = useCallback(
    (mode: ThemeMode) => updateSettings({ theme: mode }),
    [updateSettings],
  )

  return { pref, resolved, setTheme, isDark: resolved === 'dark' }
}
