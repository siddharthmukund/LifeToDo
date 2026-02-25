'use client'
// useADHDMode — single source of truth for ADHD Mode state and constants.
// Reads the adhdMode toggle from settingsStore (persisted in Dexie).
// Returns isADHDMode boolean + all ADHD-specific constants in one object.
// All components that change behaviour in ADHD Mode consume this hook.

import { useGTDStore } from '@/store/gtdStore'
import { ADHD_MAX_ITEMS } from '@/constants/gtd'

/** All ADHD-mode-specific constants in one place. */
export const ADHD_CONSTANTS = {
  /** Maximum items shown per page when ADHD Mode is ON. */
  PAGE_SIZE: ADHD_MAX_ITEMS,
  /** Font scale multiplier applied via .adhd-mode CSS class. */
  FONT_SCALE: 1.5,
  /** Maximum notification nudges per day in ADHD Mode. */
  MAX_DAILY_NUDGES: 3,
  /** Enforced transition duration (ms) — no sudden layout shifts. */
  TRANSITION_MS: 250,
} as const

export type ADHDConstants = typeof ADHD_CONSTANTS

export function useADHDMode(): ADHDConstants & { isADHDMode: boolean } {
  const isADHDMode = useGTDStore(s => s.settings?.adhdMode ?? false)
  return { isADHDMode, ...ADHD_CONSTANTS }
}
