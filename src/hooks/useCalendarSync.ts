'use client'
// hooks/useCalendarSync.ts
// Hook that bridges GTD actions with the CalendarPlugin.
// Reads scheduled actions from the Zustand store and can add them
// to the device calendar via CalendarPlugin.addEvent().
// Pro tier only — returns { available: false } for Free users.

import { useState, useCallback, useMemo } from 'react'
import { useGTDStore }                    from '@/store/gtdStore'
import { usePlugin }                      from '@/plugins/usePlugin'
import type { CalendarPluginInterface, CalendarEvent } from '@/plugins/types'
import type { Action }                    from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface UseCalendarSyncResult {
  /** Actions that have a scheduledDate set */
  scheduledActions: Action[]
  /** Add a GTD action as a calendar event */
  addToCalendar:    (action: Action, startAt: Date, durationMins?: number) => Promise<CalendarEvent | null>
  /** Whether the calendar plugin is available and initialized */
  available:        boolean
  /** Loading state for addToCalendar */
  adding:           boolean
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCalendarSync(): UseCalendarSyncResult {
  const actions = useGTDStore(s => s.actions)
  const tier    = useGTDStore(s => s.settings?.tier ?? 'free')

  const { plugin: calPlugin, isReady } =
    usePlugin<CalendarPluginInterface>('calendar')

  const [adding, setAdding] = useState(false)

  const scheduledActions = useMemo(
    () => actions.filter(a => a.status === 'active' && a.scheduledDate != null),
    [actions],
  )

  const addToCalendar = useCallback(
    async (action: Action, startAt: Date, durationMins: number = action.timeEstimate): Promise<CalendarEvent | null> => {
      if (tier !== 'pro' || !isReady) return null
      setAdding(true)
      try {
        const endAt = new Date(startAt.getTime() + durationMins * 60_000)
        return await calPlugin.addEvent({
          title:    action.text,
          startAt,
          endAt,
          allDay:   false,
          actionId: action.id,
        })
      } catch {
        return null
      } finally {
        setAdding(false)
      }
    },
    [tier, isReady, calPlugin],
  )

  return {
    scheduledActions,
    addToCalendar,
    available: tier === 'pro' && isReady,
    adding,
  }
}
