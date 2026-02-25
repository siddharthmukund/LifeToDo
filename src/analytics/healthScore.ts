// analytics/healthScore.ts
// Pure function — no side effects, no Dexie access.
// Takes snapshot data and returns a weighted GTD health score (0-100).
//
// Component weights (must sum to 1.0):
//   inbox_processing_speed      25%  — how quickly inbox items get clarified
//   weekly_review_consistency   25%  — regularity of weekly reviews
//   next_action_completion_rate 20%  — velocity of active actions
//   inbox_zero_frequency        15%  — how often inbox reaches zero
//   system_freshness            15%  — how recently active actions were updated

import type { AnalyticsEvent, Review, Action } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HealthScoreBreakdown {
  inboxProcessingSpeed:      number   // 0-100
  weeklyReviewConsistency:   number   // 0-100
  nextActionCompletionRate:  number   // 0-100
  inboxZeroFrequency:        number   // 0-100
  systemFreshness:           number   // 0-100
}

export type HealthGrade = 'A' | 'B' | 'C' | 'D' | 'F'

export interface HealthScore {
  total:            number                // 0-100 weighted sum
  breakdown:        HealthScoreBreakdown
  grade:            HealthGrade
  hasEnoughData:    boolean               // false if < 3 events ever recorded
  lastComputedAt:   Date
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const MS = {
  day:       86_400_000,
  week:      7  * 86_400_000,
  twoWeeks:  14 * 86_400_000,
  month:     30 * 86_400_000,
  fourWeeks: 28 * 86_400_000,
} as const

function clamp(v: number): number { return Math.max(0, Math.min(100, Math.round(v))) }

// ── Core function ─────────────────────────────────────────────────────────────

/**
 * Compute the GTD Health Score from raw Dexie snapshots.
 *
 * @param events  All records from db.analytics_events
 * @param reviews All records from db.reviews
 * @param actions All records from db.actions (any status)
 */
export function computeHealthScore(
  events:  AnalyticsEvent[],
  reviews: Review[],
  actions: Action[],
): HealthScore {
  const now = Date.now()

  // ── 1. Inbox Processing Speed (25%) ────────────────────────────────────────
  // Ratio of clarified → captured events in the last 7 days.
  // No recent captures → score 100 (nothing to process).
  const captured7d  = events.filter(e => e.name === 'inbox_item_captured'  && e.ts > now - MS.week).length
  const clarified7d = events.filter(e => e.name === 'inbox_item_clarified' && e.ts > now - MS.week).length
  const inboxProcessingSpeed = captured7d === 0
    ? 100
    : clamp((clarified7d / captured7d) * 100)

  // ── 2. Weekly Review Consistency (25%) ─────────────────────────────────────
  // Reviews completed in the last 4 weeks out of 4 possible.
  const reviews4w = reviews.filter(r =>
    new Date(r.completedAt).getTime() > now - MS.fourWeeks
  ).length
  const weeklyReviewConsistency = clamp((reviews4w / 4) * 100)

  // ── 3. Next Action Completion Rate (20%) ───────────────────────────────────
  // Completed events in 7d / (active actions + completed in 7d).
  // No active or completed actions → score 100 (system is clean).
  const completed7d  = events.filter(e => e.name === 'next_action_completed' && e.ts > now - MS.week).length
  const activeCount  = actions.filter(a => a.status === 'active').length
  const denominator  = activeCount + completed7d
  const nextActionCompletionRate = denominator === 0
    ? 100
    : clamp((completed7d / denominator) * 100)

  // ── 4. Inbox Zero Frequency (15%) ──────────────────────────────────────────
  // inbox_zero_achieved events in 30 days; 4+ = 100%.
  const inboxZeroEvents = events.filter(e =>
    e.name === 'inbox_zero_achieved' && e.ts > now - MS.month
  ).length
  const inboxZeroFrequency = clamp((inboxZeroEvents / 4) * 100)

  // ── 5. System Freshness (15%) ──────────────────────────────────────────────
  // Active actions touched in last 7 days / total active actions.
  const activeActions  = actions.filter(a => a.status === 'active')
  const freshActions   = activeActions.filter(a =>
    new Date(a.updatedAt).getTime() > now - MS.week
  ).length
  const systemFreshness = activeActions.length === 0
    ? 100
    : clamp((freshActions / activeActions.length) * 100)

  // ── Weighted total ─────────────────────────────────────────────────────────
  const breakdown: HealthScoreBreakdown = {
    inboxProcessingSpeed,
    weeklyReviewConsistency,
    nextActionCompletionRate,
    inboxZeroFrequency,
    systemFreshness,
  }

  const total = clamp(
    inboxProcessingSpeed      * 0.25 +
    weeklyReviewConsistency   * 0.25 +
    nextActionCompletionRate  * 0.20 +
    inboxZeroFrequency        * 0.15 +
    systemFreshness           * 0.15,
  )

  const grade: HealthGrade =
    total >= 90 ? 'A' :
    total >= 75 ? 'B' :
    total >= 60 ? 'C' :
    total >= 45 ? 'D' : 'F'

  return {
    total,
    breakdown,
    grade,
    hasEnoughData: events.length >= 3,
    lastComputedAt: new Date(),
  }
}

// ── Display helpers ───────────────────────────────────────────────────────────

export const SCORE_COMPONENT_LABELS: Record<keyof HealthScoreBreakdown, string> = {
  inboxProcessingSpeed:      'Inbox Processing',
  weeklyReviewConsistency:   'Review Consistency',
  nextActionCompletionRate:  'Action Velocity',
  inboxZeroFrequency:        'Inbox Zero Streak',
  systemFreshness:           'System Freshness',
}

export const SCORE_COMPONENT_WEIGHTS: Record<keyof HealthScoreBreakdown, number> = {
  inboxProcessingSpeed:      25,
  weeklyReviewConsistency:   25,
  nextActionCompletionRate:  20,
  inboxZeroFrequency:        15,
  systemFreshness:           15,
}
