'use client'
// flags/useFeatureFlag.ts
// Convenience hook — reads a single flag for the current user tier.
// Returns false immediately if the flag doesn't exist.

import { useGTDStore }  from '@/store/gtdStore'
import { useFlagStore } from './flagStore'

/**
 * @param key  Feature flag key (e.g. 'insights_dashboard')
 * @returns    true if the flag is enabled for the current user's tier
 *
 * @example
 * const canViewInsights = useFeatureFlag('insights_dashboard')
 * if (!canViewInsights) return <UpgradeNudge />
 */
export function useFeatureFlag(key: string): boolean {
  const tier    = useGTDStore(s => s.settings?.tier ?? 'free')
  const enabled = useFlagStore(s => s.isEnabled(key, tier))
  return enabled
}
