// src/components/subscription/PlanComparisonTable.tsx
'use client'

import { Check, X } from 'lucide-react'

const FEATURES: Array<{ label: string; free: boolean | string; pro: boolean | string }> = [
  { label: 'Capture → Clarify → Engage (full GTD)',  free: true,           pro: true },
  { label: 'Offline-first (IndexedDB)',               free: true,           pro: true },
  { label: 'ADHD Mode',                               free: true,           pro: true },
  { label: 'Projects',                                free: 'Up to 5',      pro: 'Unlimited' },
  { label: 'Custom contexts',                         free: 'Up to 3',      pro: 'Unlimited' },
  { label: 'Weekly review',                           free: true,           pro: true },
  { label: 'Insights dashboard',                      free: false,          pro: true },
  { label: 'AI Smart Capture',                        free: false,          pro: true },
  { label: 'Cloud sync (multi-device)',               free: false,          pro: true },
  { label: 'Calendar sync',                           free: false,          pro: true },
  { label: 'Home screen widget',                      free: false,          pro: true },
  { label: 'Action sharing',                          free: false,          pro: true },
  { label: 'Lifetime GTD stats',                      free: false,          pro: true },
]

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="text-xs text-content-secondary">{value}</span>
  }
  return value
    ? <Check size={15} className="text-status-success" />
    : <X size={15} className="text-content-muted" />
}

export function PlanComparisonTable() {
  return (
    <div className="rounded-2xl border border-border-default overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-3 bg-surface-elevated border-b border-border-default">
        <div className="px-4 py-3" />
        <div className="px-4 py-3 text-center">
          <p className="text-xs font-bold text-content-secondary uppercase tracking-wide">Free</p>
        </div>
        <div className="px-4 py-3 text-center bg-primary/5">
          <p className="text-xs font-bold text-primary-ink uppercase tracking-wide">Pro</p>
        </div>
      </div>

      {/* Rows */}
      {FEATURES.map((f, i) => (
        <div
          key={f.label}
          className={`grid grid-cols-3 ${i % 2 === 0 ? 'bg-surface-card' : 'bg-surface-base'} border-b border-border-subtle last:border-0`}
        >
          <div className="px-4 py-3">
            <p className="text-xs text-content-primary leading-snug">{f.label}</p>
          </div>
          <div className="px-4 py-3 flex items-center justify-center">
            <Cell value={f.free} />
          </div>
          <div className="px-4 py-3 flex items-center justify-center bg-primary/5">
            <Cell value={f.pro} />
          </div>
        </div>
      ))}
    </div>
  )
}
