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
  high:   'text-primary',
  medium: 'text-accent',
  low:    'text-green-400',
}

export function NextActionWidget() {
  const [data, setData] = useState<NextActionWidgetData | null>(null)

  useEffect(() => {
    getNextActionWidgetData().then(setData)
  }, [])

  if (!data) {
    return (
      <div className="bg-card-dark rounded-2xl border border-white/8 p-4 flex items-center gap-3">
        <Zap size={18} className="text-slate-500" />
        <p className="text-sm text-slate-500">Nothing active — great job!</p>
      </div>
    )
  }

  return (
    <Link href="/" className="block">
      <div className="bg-card-dark rounded-2xl border border-primary/15 p-4 hover:border-primary/30 transition-colors">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Next Action</p>
        <p className="text-sm font-medium text-white line-clamp-2 mb-3">{data.text}</p>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${ENERGY_COLORS[data.energy] ?? 'text-slate-400'}`}>
            <Zap size={10} /> {data.energy}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            <Clock size={10} /> {data.timeEstimate}m
          </span>
        </div>
      </div>
    </Link>
  )
}
