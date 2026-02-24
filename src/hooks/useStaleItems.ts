'use client'
// useStaleItems — detects stale items across all GTD buckets.
// Single responsibility: compute StaleCounts from IndexedDB.
// No UI logic; components consume the counts and decide how to render.

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/db'
import { STALE_THRESHOLDS } from '@/constants/gtd'
import type { StaleCounts } from '@/types'

const MS_PER_DAY = 86_400_000

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * MS_PER_DAY)
}

export function useStaleItems(): StaleCounts & { refresh: () => Promise<void> } {
  const [counts, setCounts] = useState<StaleCounts>({
    inbox: 0, someday: 0, waitingFor: 0, total: 0,
  })

  const compute = useCallback(async () => {
    const [inboxStale, somedayStale, waitingStale] = await Promise.all([
      // Inbox items captured more than 7 days ago that are still unprocessed
      db.inbox_items
        .where('status').anyOf(['raw', 'clarifying'])
        .filter(i => new Date(i.capturedAt) < daysAgo(STALE_THRESHOLDS.inbox))
        .count(),

      // Someday items not touched for 30+ days
      db.actions
        .where('status').equals('someday')
        .filter(a => new Date(a.updatedAt) < daysAgo(STALE_THRESHOLDS.someday))
        .count(),

      // Waiting-for items not updated for 14+ days
      db.actions
        .where('status').equals('waiting')
        .filter(a => new Date(a.updatedAt) < daysAgo(STALE_THRESHOLDS.waitingFor))
        .count(),
    ])

    setCounts({
      inbox:     inboxStale,
      someday:   somedayStale,
      waitingFor: waitingStale,
      total:     inboxStale + somedayStale + waitingStale,
    })
  }, [])

  useEffect(() => { compute() }, [compute])

  return { ...counts, refresh: compute }
}
