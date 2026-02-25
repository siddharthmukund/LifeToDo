// widget/widgetDataProvider.ts
// Data provider for home-screen widgets.
// Reads from Dexie and returns the minimal payload each widget needs.
// Widgets call these functions via the periodic widget refresh mechanism.
//
// PWA widget support is declared in widget-manifest.json and requires
// the Periodic Background Sync API (Chrome M124+, desktop-only for now).

import { db } from '@/lib/db'
import type { Action } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NextActionWidgetData {
  text:          string
  energy:        string
  timeEstimate:  number
  contextId:     string
  /** ISO string */
  updatedAt:     string
}

export interface InboxCountWidgetData {
  count:         number
  /** ISO string of last capture */
  lastCaptured:  string | null
}

// ── Providers ─────────────────────────────────────────────────────────────────

/**
 * Returns the single highest-priority active action.
 * Priority: high energy first, then oldest updatedAt.
 */
export async function getNextActionWidgetData(): Promise<NextActionWidgetData | null> {
  const actions = await db.actions
    .where('status')
    .equals('active')
    .toArray()

  if (actions.length === 0) return null

  const ENERGY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const sorted = actions.sort((a, b) => {
    const energyDiff = (ENERGY_ORDER[a.energy] ?? 1) - (ENERGY_ORDER[b.energy] ?? 1)
    if (energyDiff !== 0) return energyDiff
    return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
  })

  const top = sorted[0]
  return {
    text:         top.text,
    energy:       top.energy,
    timeEstimate: top.timeEstimate,
    contextId:    top.contextId,
    updatedAt:    new Date(top.updatedAt).toISOString(),
  }
}

/**
 * Returns inbox count and timestamp of most recent capture.
 */
export async function getInboxCountWidgetData(): Promise<InboxCountWidgetData> {
  const items = await db.inbox_items
    .where('status')
    .anyOf(['raw', 'clarifying'])
    .toArray()

  const sorted = items.sort(
    (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
  )

  return {
    count:        items.length,
    lastCaptured: sorted[0] ? new Date(sorted[0].capturedAt).toISOString() : null,
  }
}

/**
 * Populate the widget cache (for Periodic Background Sync handler).
 * Writes widget data to a known localStorage key so the widget
 * script can read it synchronously.
 */
export async function refreshWidgetCache(): Promise<void> {
  if (typeof window === 'undefined') return
  const [nextAction, inboxCount] = await Promise.all([
    getNextActionWidgetData(),
    getInboxCountWidgetData(),
  ])
  localStorage.setItem('widget:next-action', JSON.stringify(nextAction))
  localStorage.setItem('widget:inbox-count', JSON.stringify(inboxCount))
}
