// flags/flags.ts
// Feature flag catalogue — single source of truth for all flags in Life To Do.
// Tier enforcement: Free users cannot enable Pro flags, even programmatically.
// New flags go here first; flip defaultOn: true to roll out to everyone.

export type FlagTier = 'free' | 'pro'

export interface FlagDefinition {
  key:         string
  label:       string
  description: string
  tier:        FlagTier
  defaultOn:   boolean   // default enabled state for eligible tier
}

export const FLAGS: readonly FlagDefinition[] = [
  // ── Free tier flags ───────────────────────────────────────────────────────
  {
    key: 'adhd_mode',
    label: 'ADHD Mode',
    description: 'Limit lists to 7 items and scale font size 1.5×',
    tier: 'free',
    defaultOn: false,
  },
  {
    key: 'voice_capture',
    label: 'Voice Capture',
    description: 'Capture inbox items via the microphone',
    tier: 'free',
    defaultOn: true,
  },
  {
    key: 'offline_mode',
    label: 'Offline Mode',
    description: 'Full offline support with local-first IndexedDB storage',
    tier: 'free',
    defaultOn: true,
  },
  {
    key: 'stale_notifications',
    label: 'Stale Item Alerts',
    description: 'Navigation badge when items go stale',
    tier: 'free',
    defaultOn: true,
  },
  {
    key: 'weekly_review',
    label: 'Weekly Review',
    description: 'Guided GTD weekly review flow',
    tier: 'free',
    defaultOn: true,
  },

  // ── Pro tier flags ────────────────────────────────────────────────────────
  {
    key: 'insights_dashboard',
    label: 'Insights Dashboard',
    description: 'GTD health score, action trends, and inbox flow charts',
    tier: 'pro',
    defaultOn: true,   // on by default for Pro users
  },
  {
    key: 'ai_capture',
    label: 'AI Smart Capture',
    description: 'Natural-language parsing with confidence-gated auto-fill',
    tier: 'pro',
    defaultOn: true,
  },
  {
    key: 'calendar_sync',
    label: 'Calendar Sync',
    description: 'Two-way integration with system calendar',
    tier: 'pro',
    defaultOn: false,  // opt-in (requires permission grant)
  },
  {
    key: 'cloud_sync',
    label: 'Cloud Sync',
    description: 'Cross-device sync via Firestore (delta, <10KB/cycle)',
    tier: 'pro',
    defaultOn: true,
  },
  {
    key: 'widget_support',
    label: 'Home Screen Widget',
    description: 'Next action and inbox count on your device home screen',
    tier: 'pro',
    defaultOn: true,
  },
  {
    key: 'sharing',
    label: 'Action Sharing',
    description: 'Delegate and share actions with contacts',
    tier: 'pro',
    defaultOn: true,
  },
] as const

// ── Lookup helpers ────────────────────────────────────────────────────────────

export const FLAG_MAP: ReadonlyMap<string, FlagDefinition> = new Map(
  FLAGS.map(f => [f.key, f])
)

export function getFlag(key: string): FlagDefinition | undefined {
  return FLAG_MAP.get(key)
}

export function isFlagProOnly(key: string): boolean {
  return FLAG_MAP.get(key)?.tier === 'pro'
}
