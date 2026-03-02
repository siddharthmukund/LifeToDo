// flags/flags.ts
// Feature flag catalogue — single source of truth for all flags in Life To Do.
// Tier enforcement: Free users cannot enable Pro flags, even programmatically.
// New flags go here first; flip defaultOn: true to roll out to everyone.

export type FlagTier = 'free' | 'pro'

export interface FlagDefinition {
  key: string
  label: string
  description: string
  tier: FlagTier
  defaultOn: boolean   // default enabled state for eligible tier
}

export type FeatureFlag =
  | 'quick_capture'
  | 'weekly_review'
  | 'gamification'
  | 'leaderboard'
  | 'adhd_mode'
  | 'ai_coach'
  | 'ai_smart_capture'
  | 'ai_brain_dump'
  | 'ai_coach_insight'
  | 'ai_socratic_clarify'
  | 'ai_auto_split'
  | 'ai_auto_categorize'
  | 'ai_review_coach'
  | 'ai_weekly_report'
  | 'ai_priority_picker'
  | 'ai_content_drafter'
  // iCCW #7 — Native Wrappers
  | 'native_push'
  | 'native_biometric'
  | 'native_haptics'
  | 'native_share';

export const FLAGS: readonly FlagDefinition[] = [
  // ── Free tier flags ───────────────────────────────────────────────────────
  {
    key: 'gamification',
    label: 'Gamification',
    description: 'XP, levels, achievements, and daily challenges',
    tier: 'free',
    defaultOn: true,
  },
  {
    key: 'quick_capture',
    label: 'Quick Capture',
    description: 'Keyboard shortcut and floating button to capture items instantly',
    tier: 'free',
    defaultOn: true,
  },
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

  // ── Native capability flags (iCCW #7) ────────────────────────────────────
  // These are free-tier and default-on; they no-op automatically on web.
  {
    key: 'native_push',
    label: 'Push Notifications',
    description: 'Native push notifications via FCM (iOS + Android)',
    tier: 'free',
    defaultOn: true,
  },
  {
    key: 'native_biometric',
    label: 'Biometric Lock',
    description: 'Face ID / fingerprint app lock on iOS and Android',
    tier: 'free',
    defaultOn: true,
  },
  {
    key: 'native_haptics',
    label: 'Haptic Feedback',
    description: 'Tactile feedback on GTD actions (iOS Taptic Engine + Android vibrator)',
    tier: 'free',
    defaultOn: true,
  },
  {
    key: 'native_share',
    label: 'Native Share',
    description: 'Share tasks via the native iOS / Android Share Sheet',
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
    key: 'ai_coach',
    label: 'AI GTD Coach',
    description: 'Master toggle — LLM-powered coaching across all GTD phases.',
    tier: 'pro',
    defaultOn: true,
  },
  {
    key: 'ai_smart_capture',
    label: 'AI Smart Capture',
    description: 'NLP parsing of natural language into structured GTD fields.',
    tier: 'pro',
    defaultOn: true,
  },
  {
    key: 'ai_brain_dump',
    label: 'Magic Brain Dump',
    description: 'Paste a paragraph — AI extracts individual tasks.',
    tier: 'pro',
    defaultOn: true,
  },
  {
    key: 'ai_coach_insight',
    label: 'AI Coach Insight',
    description: 'One-sentence strategic nudge based on current inbox state.',
    tier: 'pro',
    defaultOn: true,
  },
  {
    key: 'ai_socratic_clarify',
    label: 'Socratic Clarification',
    description: 'AI suggests 2-3 concrete next actions for vague tasks.',
    tier: 'pro',
    defaultOn: true,
  },
  {
    key: 'ai_auto_split',
    label: 'Auto-Split Tasks',
    description: 'Break complex tasks into 3 sequenced sub-tasks.',
    tier: 'pro',
    defaultOn: true,
  },
  {
    key: 'ai_auto_categorize',
    label: 'Auto-Categorization',
    description: 'Invisibly assign context, project, energy during capture.',
    tier: 'pro',
    defaultOn: true,
  },
  {
    key: 'ai_review_coach',
    label: 'Conversational Review Coach',
    description: 'Chat with AI coach during weekly review.',
    tier: 'pro',
    defaultOn: true,
  },
  {
    key: 'ai_weekly_report',
    label: 'Auto-Weekly Report',
    description: 'AI-generated weekly review wrap-up with data and tip.',
    tier: 'pro',
    defaultOn: true,
  },
  {
    key: 'ai_priority_picker',
    label: 'AI Priority Picker',
    description: 'AI singles out the #1 task to do right now.',
    tier: 'pro',
    defaultOn: true,
  },
  {
    key: 'ai_content_drafter',
    label: 'AI Content Drafter',
    description: 'Generate a 50-word starter draft for any task.',
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
  {
    key: 'leaderboard',
    label: 'GTD Leaderboard',
    description: 'Opt-in global GTD health score rankings (no task content shared)',
    tier: 'pro',
    defaultOn: false,  // opt-in — user must explicitly join
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
