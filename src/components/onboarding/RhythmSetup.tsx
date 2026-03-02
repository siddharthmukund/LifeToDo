// src/components/onboarding/RhythmSetup.tsx
// Working hours + review day/time setup during onboarding.
'use client'

import { useState } from 'react'
import { dayLabel } from '@/lib/utils'
import type { WorkingHours, ReviewScheduleConfig } from '@/types'

const DAYS = [0, 1, 2, 3, 4, 5, 6]
const REMINDER_OPTIONS = [0, 15, 30, 60]

interface RhythmSetupProps {
  workingHours: WorkingHours
  reviewSchedule: ReviewScheduleConfig
  onChange: (wh: WorkingHours, rs: ReviewScheduleConfig) => void
}

export function RhythmSetup({ workingHours, reviewSchedule, onChange }: RhythmSetupProps) {
  const [wh, setWH]   = useState(workingHours)
  const [rs, setRS]   = useState(reviewSchedule)

  function updateWH(patch: Partial<WorkingHours>) {
    const next = { ...wh, ...patch }
    setWH(next)
    onChange(next, rs)
  }

  function updateRS(patch: Partial<ReviewScheduleConfig>) {
    const next = { ...rs, ...patch }
    setRS(next)
    onChange(wh, next)
  }

  function toggleDay(d: number) {
    const days = wh.days.includes(d)
      ? wh.days.filter(x => x !== d)
      : [...wh.days, d].sort()
    updateWH({ days })
  }

  return (
    <div className="space-y-6 w-full">
      {/* Working hours toggle */}
      <div className="bg-surface-card rounded-2xl border border-border-default p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-content-primary">Working hours</p>
            <p className="text-xs text-content-secondary mt-0.5">
              Skip tasks outside these times
            </p>
          </div>
          <button
            onClick={() => updateWH({ enabled: !wh.enabled })}
            className={`relative w-12 h-6 rounded-full transition-colors active:scale-95
              ${wh.enabled ? 'bg-primary' : 'bg-overlay-active'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
              ${wh.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {wh.enabled && (
          <>
            {/* Day picker */}
            <div className="flex gap-1.5">
              {DAYS.map(d => (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors active:scale-95
                    ${wh.days.includes(d)
                      ? 'bg-primary text-text-on-brand'
                      : 'bg-surface-elevated text-content-secondary border border-border-default'
                    }`}
                >
                  {dayLabel(d)}
                </button>
              ))}
            </div>

            {/* Time range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-content-secondary mb-1">Start</p>
                <input
                  type="time"
                  value={wh.startTime}
                  onChange={e => updateWH({ startTime: e.target.value })}
                  className="w-full bg-surface-base border border-border-default rounded-xl
                             px-3 py-2.5 text-sm text-content-primary
                             focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <p className="text-xs text-content-secondary mb-1">End</p>
                <input
                  type="time"
                  value={wh.endTime}
                  onChange={e => updateWH({ endTime: e.target.value })}
                  className="w-full bg-surface-base border border-border-default rounded-xl
                             px-3 py-2.5 text-sm text-content-primary
                             focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Weekly review schedule */}
      <div className="bg-surface-card rounded-2xl border border-border-default p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-content-primary">Weekly review</p>
          <p className="text-xs text-content-secondary mt-0.5">
            When should we remind you to review?
          </p>
        </div>

        {/* Day picker */}
        <div className="flex gap-1.5">
          {DAYS.map(d => (
            <button
              key={d}
              onClick={() => updateRS({ dayOfWeek: d })}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors active:scale-95
                ${rs.dayOfWeek === d
                  ? 'bg-primary text-text-on-brand'
                  : 'bg-surface-elevated text-content-secondary border border-border-default'
                }`}
            >
              {dayLabel(d)}
            </button>
          ))}
        </div>

        {/* Time */}
        <input
          type="time"
          value={rs.timeOfDay}
          onChange={e => updateRS({ timeOfDay: e.target.value })}
          className="w-full bg-surface-base border border-border-default rounded-xl
                     px-3 py-2.5 text-sm text-content-primary
                     focus:outline-none focus:border-brand"
        />

        {/* Reminder */}
        <div>
          <p className="text-xs text-content-secondary mb-2">Reminder before</p>
          <div className="flex gap-2">
            {REMINDER_OPTIONS.map(mins => (
              <button
                key={mins}
                onClick={() => updateRS({ reminderMinutesBefore: mins })}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors active:scale-95
                  ${rs.reminderMinutesBefore === mins
                    ? 'bg-primary/10 text-primary-ink border border-primary/30'
                    : 'bg-surface-elevated text-content-secondary border border-border-default'
                  }`}
              >
                {mins === 0 ? 'None' : `${mins}m`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
