'use client'
// analytics/useGTDHealthScore.ts
// Loads analytics_events + reviews + actions from Dexie and computes
// the GTD Health Score. Re-computes whenever the actions list changes.

import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { useGTDStore } from '@/store/gtdStore'
import { computeHealthScore, type HealthScore } from './healthScore'

interface UseGTDHealthScoreResult {
  score:   HealthScore | null
  loading: boolean
  refresh: () => Promise<void>
}

export function useGTDHealthScore(): UseGTDHealthScoreResult {
  const actions = useGTDStore(s => s.actions)

  const [score,   setScore]   = useState<HealthScore | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      const [events, reviews] = await Promise.all([
        db.analytics_events.toArray(),
        db.reviews.toArray(),
      ])
      setScore(computeHealthScore(events, reviews, actions))
    } catch {
      // non-critical — score stays null, UI shows a graceful fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions])

  return { score, loading, refresh }
}
