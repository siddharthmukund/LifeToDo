'use client'
// components/calendar/CalendarEventCard.tsx
// A compact card showing a single GTD action on the calendar.

import { Clock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Action } from '@/types'

const ENERGY_COLORS = {
  high:   'border-l-primary bg-primary/10',
  medium: 'border-l-accent bg-accent/10',
  low:    'border-l-status-ok bg-status-ok/10',
} as const

interface CalendarEventCardProps {
  action:    Action
  startAt?:  Date
  onClick?:  () => void
  compact?:  boolean
}

export function CalendarEventCard({ action, startAt, onClick, compact = false }: CalendarEventCardProps) {
  const timeLabel = startAt
    ? startAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : null

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border-l-2 px-3 py-2 transition-all hover:scale-[1.01]',
        ENERGY_COLORS[action.energy],
        compact ? 'py-1' : 'py-2',
      )}
    >
      <p className={cn('font-medium text-content-primary truncate', compact ? 'text-xs' : 'text-sm')}>
        {action.text}
      </p>
      {!compact && (
        <div className="flex items-center gap-2 mt-1">
          {timeLabel && (
            <span className="flex items-center gap-1 text-[10px] text-content-secondary">
              <Clock size={10} />
              {timeLabel}
            </span>
          )}
          <span className="flex items-center gap-1 text-[10px] text-content-secondary">
            <Zap size={10} />
            {action.timeEstimate}m
          </span>
        </div>
      )}
    </button>
  )
}
