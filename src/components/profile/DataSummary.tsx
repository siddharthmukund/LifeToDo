// src/components/profile/DataSummary.tsx
// "Your Data" overview — shows item counts per GTD category.
'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/db'

interface DataCounts {
  inbox: number
  actions: number
  projects: number
  contexts: number
  reviews: number
  analyticsEvents: number
}

export function DataSummary() {
  const [counts, setCounts] = useState<DataCounts | null>(null)

  useEffect(() => {
    async function load() {
      const [inbox, actions, projects, contexts, reviews, events] = await Promise.all([
        db.inbox_items.count(),
        db.actions.count(),
        db.projects.count(),
        db.contexts.count(),
        db.reviews.count(),
        db.analytics_events.count(),
      ])
      setCounts({ inbox, actions, projects, contexts, reviews, analyticsEvents: events })
    }
    void load()
  }, [])

  const rows: Array<{ label: string; key: keyof DataCounts; description: string }> = [
    { label: 'Inbox items',    key: 'inbox',           description: 'Captured, unprocessed' },
    { label: 'Next actions',   key: 'actions',         description: 'Active + completed' },
    { label: 'Projects',       key: 'projects',        description: 'Active + someday/archived' },
    { label: 'Contexts',       key: 'contexts',        description: 'Your @context list' },
    { label: 'Weekly reviews', key: 'reviews',         description: 'Completed review sessions' },
    { label: 'Analytics events', key: 'analyticsEvents', description: 'Local only — never sent anywhere' },
  ]

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-content-secondary px-1">
        Your data (stored locally on this device)
      </p>
      <div className="bg-surface-card rounded-2xl border border-border-default overflow-hidden divide-y divide-border-subtle">
        {rows.map(row => (
          <div key={row.key} className="flex items-center justify-between px-5 py-3.5">
            <div>
              <p className="text-sm font-medium text-content-primary">{row.label}</p>
              <p className="text-xs text-content-secondary">{row.description}</p>
            </div>
            <span className="text-sm font-bold text-content-primary tabular-nums">
              {counts ? counts[row.key].toLocaleString() : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
