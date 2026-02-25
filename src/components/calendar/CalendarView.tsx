'use client'
// components/calendar/CalendarView.tsx
// 7-day horizontal calendar showing GTD actions with a scheduledDate.
// Tapping a day scrolls to it; tapping an event opens AddToCalendarModal.
// Pro-only: for Free users renders an upgrade nudge.

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCalendarSync }     from '@/hooks/useCalendarSync'
import { CalendarEventCard }   from './CalendarEventCard'
import { AddToCalendarModal }  from './AddToCalendarModal'
import { FeatureGate }         from '@/flags/FeatureGate'
import type { Action }         from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function startOfDay(date: Date): Date {
  const d = new Date(date); d.setHours(0, 0, 0, 0); return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date); d.setDate(d.getDate() + n); return d
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate()
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── Component ─────────────────────────────────────────────────────────────────

export function CalendarView() {
  const { scheduledActions } = useCalendarSync()

  const today          = startOfDay(new Date())
  const [weekStart, setWeekStart] = useState(today)
  const [selected, setSelected]   = useState<Date>(today)
  const [modalAction, setModalAction] = useState<Action | null>(null)

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const actionsForDay = (day: Date) =>
    scheduledActions.filter(a =>
      a.scheduledDate && isSameDay(new Date(a.scheduledDate), day)
    )

  const selectedActions = actionsForDay(selected)

  return (
    <FeatureGate flag="calendar_sync" showUpgradeNudge>
      <div className="space-y-4">
        {/* Week navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setWeekStart(w => addDays(w, -7)) }}
            className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10"
          >
            <ChevronLeft size={16} className="text-slate-400" />
          </button>
          <p className="text-xs font-bold text-slate-400">
            {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
            {addDays(weekStart, 6).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <button
            onClick={() => { setWeekStart(w => addDays(w, 7)) }}
            className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10"
          >
            <ChevronRight size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Day strip */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const isToday    = isSameDay(day, today)
            const isSelected = isSameDay(day, selected)
            const count      = actionsForDay(day).length

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelected(day)}
                className={[
                  'flex flex-col items-center gap-1 py-2 rounded-xl transition-all',
                  isSelected ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5',
                ].join(' ')}
              >
                <span className="text-[9px] font-bold uppercase text-slate-500">
                  {DAY_LABELS[day.getDay()]}
                </span>
                <span className={[
                  'text-sm font-bold',
                  isToday ? 'text-primary' : isSelected ? 'text-white' : 'text-slate-300',
                ].join(' ')}>
                  {day.getDate()}
                </span>
                {count > 0 && (
                  <span className="w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>

        {/* Events for selected day */}
        <div className="space-y-2">
          {selectedActions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              No scheduled actions for this day
            </p>
          ) : (
            selectedActions.map(action => (
              <CalendarEventCard
                key={action.id}
                action={action}
                startAt={action.scheduledDate ? new Date(action.scheduledDate) : undefined}
                onClick={() => setModalAction(action)}
              />
            ))
          )}
        </div>

        {/* Add to calendar modal */}
        {modalAction && (
          <AddToCalendarModal
            action={modalAction}
            open={Boolean(modalAction)}
            onClose={() => setModalAction(null)}
          />
        )}
      </div>
    </FeatureGate>
  )
}
