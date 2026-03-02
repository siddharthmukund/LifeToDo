// src/components/settings/WorkingHoursEditor.tsx
// Visual editor for working days + start/end times.
// Persisted in the UserProfile (not Settings) — requires user to be signed in.
// iCCW #6 D3A deliverable.
'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import { fetchProfile, updateProfile } from '@/lib/profileService'
import type { WorkingHours } from '@/types'

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const DEFAULT_HOURS: WorkingHours = {
  enabled: false,
  days: [1, 2, 3, 4, 5],
  startTime: '09:00',
  endTime: '18:00',
}

export function WorkingHoursEditor() {
  const { user } = useAuth()
  const [hours, setHours] = useState<WorkingHours>(DEFAULT_HOURS)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user?.uid) return
    fetchProfile(user.uid).then(p => {
      if (p?.workingHours) setHours(p.workingHours)
    })
  }, [user?.uid])

  async function save(update: Partial<WorkingHours>) {
    const next = { ...hours, ...update }
    setHours(next)
    if (!user?.uid) return
    setSaving(true)
    try {
      await updateProfile(user.uid, { workingHours: next })
    } finally {
      setSaving(false)
    }
  }

  function toggleDay(d: number) {
    const next = hours.days.includes(d)
      ? hours.days.filter(x => x !== d)
      : [...hours.days, d].sort()
    void save({ days: next })
  }

  return (
    <div className="space-y-3">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary px-1">
        Working Hours
      </h2>
      <div className="bg-surface-card rounded-2xl border border-border-default p-5 space-y-5">

        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-overlay-hover border border-border-default">
              <Clock size={15} className="text-content-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-content-primary">Enable working hours</p>
              <p className="text-xs text-content-secondary mt-0.5">
                {saving ? 'Saving…' : 'Hold notifications outside these hours'}
              </p>
            </div>
          </div>
          <button
            onClick={() => void save({ enabled: !hours.enabled })}
            className={`relative w-11 h-6 rounded-full transition-colors active:scale-95
              ${hours.enabled ? 'bg-primary shadow-glow-accent' : 'bg-overlay-active'}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                ${hours.enabled ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>

        {hours.enabled && (
          <>
            {/* Day selector */}
            <div>
              <p className="text-xs text-content-secondary mb-2">Working days</p>
              <div className="flex gap-1.5">
                {DAY_LABELS.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-95
                      ${hours.days.includes(i)
                        ? 'bg-primary text-on-brand shadow-glow-accent'
                        : 'bg-surface-elevated text-content-secondary border border-border-default hover:text-content-primary'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-content-secondary mb-1.5">Start time</p>
                <input
                  type="time"
                  value={hours.startTime}
                  onChange={e => void save({ startTime: e.target.value })}
                  className="w-full bg-surface-base border border-border-default rounded-xl
                             px-3 py-2.5 text-sm text-content-primary focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <p className="text-xs text-content-secondary mb-1.5">End time</p>
                <input
                  type="time"
                  value={hours.endTime}
                  onChange={e => void save({ endTime: e.target.value })}
                  className="w-full bg-surface-base border border-border-default rounded-xl
                             px-3 py-2.5 text-sm text-content-primary focus:outline-none focus:border-brand"
                />
              </div>
            </div>
          </>
        )}

        {!user && (
          <p className="text-xs text-content-muted">
            Sign in to save working hours across devices.
          </p>
        )}
      </div>
    </div>
  )
}
