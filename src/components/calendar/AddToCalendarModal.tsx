'use client'
// components/calendar/AddToCalendarModal.tsx
// Modal that lets users schedule a GTD action on a specific date/time.
// Calls useCalendarSync.addToCalendar() on confirm.
// Pro-gated: shows an upgrade nudge for Free users.

import { useState } from 'react'
import { Calendar, Clock } from 'lucide-react'
import { Modal }          from '@/components/ui/Modal'
import { Button }         from '@/components/ui/Button'
import { useCalendarSync } from '@/hooks/useCalendarSync'
import type { Action }    from '@/types'

interface AddToCalendarModalProps {
  action:    Action
  open:      boolean
  onClose:   () => void
  onAdded?:  () => void
}

export function AddToCalendarModal({ action, open, onClose, onAdded }: AddToCalendarModalProps) {
  const { addToCalendar, available, adding } = useCalendarSync()

  const today = new Date().toISOString().split('T')[0]
  const [date, setDate]  = useState(today)
  const [time, setTime]  = useState('09:00')

  async function handleConfirm() {
    const startAt = new Date(`${date}T${time}`)
    const event   = await addToCalendar(action, startAt)
    if (event) { onAdded?.(); onClose() }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add to Calendar">
      {!available ? (
        <div className="text-center py-4 space-y-3">
          <Calendar size={32} className="text-primary-ink/50 mx-auto" />
          <p className="text-content-secondary text-sm">Calendar sync is a Pro feature.</p>
          <p className="text-content-muted text-xs">Upgrade to schedule actions in your device calendar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-content-primary font-medium truncate">{action.text}</p>

          {/* Date picker */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-content-muted flex items-center gap-1.5">
              <Calendar size={11} /> Date
            </label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-surface-elevated border border-border-default rounded-xl px-3 py-2.5 text-sm text-content-primary focus:outline-none focus:border-primary/50"
            />
          </div>

          {/* Time picker */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-content-muted flex items-center gap-1.5">
              <Clock size={11} /> Time
            </label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full bg-surface-elevated border border-border-default rounded-xl px-3 py-2.5 text-sm text-content-primary focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={() => void handleConfirm()} disabled={adding}>
              {adding ? 'Adding…' : 'Add to Calendar'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
