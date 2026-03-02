'use client'
// flags/flagStore.ts
// Zustand store for runtime flag state.
// Tier enforcement is baked into isEnabled(): Pro flags always return false
// for Free users regardless of manual toggles.
//
// iCCW #6: syncFromTier() batch-updates overrides when subscription tier
// changes — called by subscriptionStore.hydrate() via subscription listener.

import { create } from 'zustand'
import { FLAGS, getFlag } from './flags'
import type { FlagTier } from './flags'

// ── Types ─────────────────────────────────────────────────────────────────────

interface FlagState {
  /** Map of flagKey → user-set enabled state */
  overrides: Record<string, boolean>

  /**
   * Check whether a flag is active for the current user tier.
   * @param key   Flag key (e.g. 'insights_dashboard')
   * @param tier  Current user tier from settings ('free' | 'pro')
   */
  isEnabled: (key: string, tier: FlagTier) => boolean

  /**
   * Toggle a flag override.
   * Pro-gated flags silently no-op if tier is 'free'.
   */
  setFlag: (key: string, enabled: boolean, tier: FlagTier) => void

  /** Reset all overrides to FLAG catalogue defaults */
  resetAll: () => void

  /**
   * Batch-sync all flag overrides to match the given tier.
   * Called when subscription tier changes (Pro → Free or Free → Pro).
   * Free tier: all Pro flags forced off.
   * Pro tier:  all Pro flags restored to their defaultOn values.
   */
  syncFromTier: (tier: FlagTier) => void
}

// ── Initial defaults from FLAG catalogue ─────────────────────────────────────

function buildDefaults(): Record<string, boolean> {
  return Object.fromEntries(FLAGS.map(f => [f.key, f.defaultOn]))
}

function buildForTier(tier: FlagTier): Record<string, boolean> {
  return Object.fromEntries(
    FLAGS.map(f => [
      f.key,
      f.tier === 'pro' && tier === 'free' ? false : f.defaultOn,
    ])
  )
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useFlagStore = create<FlagState>((set, get) => ({
  overrides: buildDefaults(),

  isEnabled(key, tier) {
    const def = getFlag(key)
    if (!def) return false

    // Pro-gated flag: Free users always get false
    if (def.tier === 'pro' && tier === 'free') return false

    return get().overrides[key] ?? def.defaultOn
  },

  setFlag(key, enabled, tier) {
    const def = getFlag(key)
    if (!def) return
    // Silently reject attempts to enable Pro flags for Free users
    if (def.tier === 'pro' && tier === 'free') return
    set(s => ({ overrides: { ...s.overrides, [key]: enabled } }))
  },

  resetAll() {
    set({ overrides: buildDefaults() })
  },

  syncFromTier(tier) {
    set({ overrides: buildForTier(tier) })
  },
}))
