// src/lib/lifetimeStatsService.ts
// Computes LifetimeGTDStats from local Dexie tables and persists them.
// Called after key events: action completed, review done, inbox zero.
// iCCW #6 D2 deliverable.

import { db } from '@/lib/db'
import type { LifetimeGTDStats } from '@/types'

const ZERO_STATS = (uid: string): LifetimeGTDStats => ({
  uid,
  totalItemsCaptured: 0,
  totalItemsClarified: 0,
  totalNextActionsCompleted: 0,
  totalProjectsCompleted: 0,
  totalWeeklyReviewsCompleted: 0,
  totalTwoMinuteTasksDone: 0,
  totalInboxZeroAchievements: 0,
  currentWeeklyReviewStreak: 0,
  longestWeeklyReviewStreak: 0,
  currentDailyActivityStreak: 0,
  longestDailyActivityStreak: 0,
  avgInboxProcessingHours: 0,
  avgDailyActionsCompleted: 0,
  avgWeeklyReviewDurationMinutes: 0,
  healthScoreHistory: [],
  milestones: [],
  updatedAt: new Date().toISOString(),
})

/**
 * Fully recomputes lifetime stats from Dexie tables.
 * Returns the updated record (also writes to Dexie).
 */
export async function computeAndSaveLifetimeStats(uid: string): Promise<LifetimeGTDStats> {
  const existing = (await db.lifetime_stats.get(uid)) ?? ZERO_STATS(uid)

  const [
    allInbox,
    allActions,
    allProjects,
    allReviews,
  ] = await Promise.all([
    db.inbox_items.toArray(),
    db.actions.toArray(),
    db.projects.toArray(),
    db.reviews.orderBy('completedAt').toArray(),
  ])

  const totalItemsCaptured   = allInbox.length
  const totalItemsClarified  = allInbox.filter(i => i.status === 'processed').length
  const totalNextActionsCompleted = allActions.filter(a => a.status === 'complete').length
  const totalProjectsCompleted    = allProjects.filter(p => p.status === 'complete').length
  const totalWeeklyReviewsCompleted = allReviews.length

  // Two-minute tasks: completed actions with timeEstimate <= 5 min
  const totalTwoMinuteTasksDone = allActions.filter(
    a => a.status === 'complete' && a.timeEstimate <= 5
  ).length

  // Weekly review streak (consecutive weeks with at least one review)
  let currentStreak = 0
  let longestStreak = existing.longestWeeklyReviewStreak
  if (allReviews.length > 0) {
    const now = new Date()
    let checkDate = new Date(now)
    checkDate.setDate(checkDate.getDate() - checkDate.getDay()) // start of current week

    for (let week = 0; week < 52; week++) {
      const weekStart = new Date(checkDate)
      const weekEnd   = new Date(checkDate)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const hasReview = allReviews.some(r => {
        const d = new Date(r.completedAt)
        return d >= weekStart && d < weekEnd
      })

      if (hasReview) {
        currentStreak++
        if (currentStreak > longestStreak) longestStreak = currentStreak
        checkDate.setDate(checkDate.getDate() - 7)
      } else if (week === 0) {
        // Current week may not have a review yet — check prior week
        checkDate.setDate(checkDate.getDate() - 7)
      } else {
        break
      }
    }
  }

  // Avg review duration
  const reviewsWithDuration = allReviews.filter(r => r.durationMinutes > 0)
  const avgWeeklyReviewDurationMinutes = reviewsWithDuration.length > 0
    ? Math.round(
        reviewsWithDuration.reduce((sum, r) => sum + r.durationMinutes, 0)
        / reviewsWithDuration.length
      )
    : 0

  const stats: LifetimeGTDStats = {
    ...existing,
    uid,
    totalItemsCaptured,
    totalItemsClarified,
    totalNextActionsCompleted,
    totalProjectsCompleted,
    totalWeeklyReviewsCompleted,
    totalTwoMinuteTasksDone,
    currentWeeklyReviewStreak: currentStreak,
    longestWeeklyReviewStreak:  longestStreak,
    avgWeeklyReviewDurationMinutes,
    updatedAt: new Date().toISOString(),
  }

  await db.lifetime_stats.put(stats)
  return stats
}

/**
 * Returns the current lifetime stats from Dexie (instant read).
 * Returns zeroed-out stats if none exist yet (not null — avoids undefined UI states).
 */
export async function getLifetimeStats(uid: string): Promise<LifetimeGTDStats> {
  return (await db.lifetime_stats.get(uid)) ?? ZERO_STATS(uid)
}

/**
 * Atomically increments a single numeric field in lifetime_stats.
 * Used for fire-and-forget updates from event handlers.
 */
export async function incrementStat(
  uid: string,
  field: keyof Pick<
    LifetimeGTDStats,
    | 'totalItemsCaptured'
    | 'totalItemsClarified'
    | 'totalNextActionsCompleted'
    | 'totalProjectsCompleted'
    | 'totalWeeklyReviewsCompleted'
    | 'totalTwoMinuteTasksDone'
    | 'totalInboxZeroAchievements'
  >,
  delta = 1
): Promise<void> {
  const existing = (await db.lifetime_stats.get(uid)) ?? ZERO_STATS(uid)
  const current = existing[field] as number
  await db.lifetime_stats.put({
    ...existing,
    [field]: current + delta,
    updatedAt: new Date().toISOString(),
  })
}
