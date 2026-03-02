// src/components/profile/ProfileStatsCard.tsx
// Lifetime GTD stats linked to user identity.
// Reads from Dexie lifetime_stats table (computed by lifetimeStatsService).
// iCCW #6 D2B deliverable.
'use client'

import { useEffect, useState } from 'react'
import { Trophy, Flame, CheckSquare, BookOpen } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import { getLifetimeStats, computeAndSaveLifetimeStats } from '@/lib/lifetimeStatsService'
import type { LifetimeGTDStats } from '@/types'

interface StatTile {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
}

export function ProfileStatsCard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<LifetimeGTDStats | null>(null)

  useEffect(() => {
    const uid = user?.uid ?? 'anonymous'
    // Quick read first, then recompute in background
    getLifetimeStats(uid).then(setStats)
    void computeAndSaveLifetimeStats(uid).then(setStats)
  }, [user?.uid])

  if (!stats) return null

  const tiles: StatTile[] = [
    {
      icon: <CheckSquare size={16} className="text-primary-ink" />,
      label: 'Tasks done',
      value: stats.totalNextActionsCompleted.toLocaleString(),
    },
    {
      icon: <Flame size={16} className="text-status-danger" />,
      label: 'Review streak',
      value: stats.currentWeeklyReviewStreak,
      sub: `best: ${stats.longestWeeklyReviewStreak}`,
    },
    {
      icon: <BookOpen size={16} className="text-content-secondary" />,
      label: 'Reviews done',
      value: stats.totalWeeklyReviewsCompleted.toLocaleString(),
    },
    {
      icon: <Trophy size={16} className="text-primary-ink" />,
      label: 'Projects done',
      value: stats.totalProjectsCompleted.toLocaleString(),
    },
  ]

  return (
    <div className="space-y-3">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary px-1">
        Lifetime Stats
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {tiles.map(tile => (
          <div
            key={tile.label}
            className="bg-surface-card rounded-2xl border border-border-default p-4 space-y-1"
          >
            <div className="flex items-center gap-2">
              {tile.icon}
              <p className="text-xs text-content-secondary">{tile.label}</p>
            </div>
            <p className="text-2xl font-bold text-content-primary tabular-nums leading-tight">
              {tile.value}
            </p>
            {tile.sub && (
              <p className="text-xs text-content-muted">{tile.sub}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
