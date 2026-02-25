'use client'
// widget/InboxCountWidget.tsx
// Compact inbox-count widget card.
// Shows unprocessed inbox count + last-capture timestamp.
// Zero state: celebratory "Inbox Zero" display.

import { useState, useEffect } from 'react'
import { Inbox }               from 'lucide-react'
import Link                    from 'next/link'
import { getInboxCountWidgetData, type InboxCountWidgetData } from './widgetDataProvider'

export function InboxCountWidget() {
  const [data, setData] = useState<InboxCountWidgetData | null>(null)

  useEffect(() => {
    getInboxCountWidgetData().then(setData)
  }, [])

  const count        = data?.count ?? 0
  const isInboxZero  = data !== null && count === 0
  const lastCapLabel = data?.lastCaptured
    ? new Date(data.lastCaptured).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <Link href="/inbox" className="block">
      <div className={[
        'rounded-2xl border p-4 hover:border-primary/30 transition-colors',
        isInboxZero ? 'bg-green-500/10 border-green-500/20' : 'bg-card-dark border-white/8',
      ].join(' ')}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Inbox</p>
          <Inbox size={14} className={isInboxZero ? 'text-green-400' : 'text-primary'} />
        </div>
        <p className={`text-3xl font-display font-bold leading-none mb-1 ${isInboxZero ? 'text-green-400' : 'text-white'}`}>
          {count}
        </p>
        <p className="text-[10px] text-slate-500">
          {isInboxZero ? '🎉 Inbox Zero!' : `item${count !== 1 ? 's' : ''} to process`}
          {lastCapLabel && !isInboxZero && ` · last: ${lastCapLabel}`}
        </p>
      </div>
    </Link>
  )
}
