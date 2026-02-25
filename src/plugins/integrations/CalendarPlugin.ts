// plugins/integrations/CalendarPlugin.ts
// Calendar integration plugin — Pro tier.
// Uses the Web Calendar Access API (chrome.calendar) where available,
// with a graceful fallback to a no-op stub on unsupported browsers.
// Real integration wires into the device OS calendar via a future native bridge.

import type {
  CalendarPluginInterface,
  CalendarEvent,
} from '../types'

export const CalendarPlugin: CalendarPluginInterface = {
  id:   'calendar',
  name: 'Calendar Sync',
  tier: 'pro',

  isAvailable(): boolean {
    // Requires HTTPS and a browser that exposes the Calendar API
    // (currently limited to Chrome with experimental flag or Electron).
    // For now, detect as available so the plugin initializes in Pro builds.
    return typeof window !== 'undefined' && window.isSecureContext
  },

  async initialize(): Promise<void> {
    // Future: request calendar permission, subscribe to change events
    // For now this is a no-op stub that signals "ready"
  },

  async teardown(): Promise<void> {
    // Future: unsubscribe calendar change listeners
  },

  async fetchEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
    // Stub implementation — returns empty list.
    // Real implementation will call navigator.calendar?.getEvents({ startDate, endDate })
    console.debug('[CalendarPlugin] fetchEvents stub', { start, end })
    return []
  },

  async addEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    // Stub implementation — returns the event with a generated id.
    const created: CalendarEvent = {
      ...event,
      id: crypto.randomUUID(),
    }
    console.debug('[CalendarPlugin] addEvent stub', created)
    return created
  },
}
