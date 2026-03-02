'use client'
// widget/NextActionWidget.tsx
// Compact "next action" widget — used both as an in-app widget preview
// and as the template for the PWA home-screen widget (Chromium M124+).
// Reads data from the widget cache (widgetDataProvider.refreshWidgetCache).

import { useState, useEffect } from 'react'
import { Zap, Clock }          from 'lucide-react'
import Link                    from 'next/link'
import { getNextActionWidgetData, type NextActionWidgetData } from './widgetDataProvider'

const ENERGY_COLORS: Record<string, string> = {
  high:   'text-primary-ink',
  medium: 'text-accent',
  low:    'text-status-success',
}

export function NextActionWidget() {
  const [data, setData] = useState<NextActionWidgetData | null>(null)

  useEffect(() => {
    getNextActionWidgetData().then(setData)
  }, [])

  if (!data) {
    return (
      <div className="bg-surface-card rounded-2xl border border-border-subtle p-4 flex items-center gap-3">
        <Zap size={18} className="text-content-muted" />
        <p className="text-sm text-content-muted">Nothing active — great job!</p>
      </div>
    )
  }

  return (
    <Link href="/" className="block">
      <div className="bg-surface-card rounded-2xl border border-primary/15 p-4 hover:border-primary/30 transition-colors">
        <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-2">Next Action</p>
        <p className="text-sm font-medium text-content-primary line-clamp-2 mb-3">{data.text}</p>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${ENERGY_COLORS[data.energy] ?? 'text-content-secondary'}`}>
            <Zap size={10} /> {data.energy}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-content-secondary">
            <Clock size={10} /> {data.timeEstimate}m
          </span>
        </div>
      </div>
    </Link>
  )
}
