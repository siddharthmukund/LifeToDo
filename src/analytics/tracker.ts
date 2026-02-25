// analytics/tracker.ts
// Core tracking function — batches events in memory, flushes to Dexie every 30s
// or immediately when the batch reaches MAX_QUEUE size.
// On page unload a best-effort synchronous flush is attempted.
// Analytics are NON-CRITICAL: errors are swallowed silently.

import { db } from '@/lib/db'
import type { AnalyticsEvent } from '@/types'
import type { GTDEventName, EventProps } from './events'

// ── Config ────────────────────────────────────────────────────────────────────
const FLUSH_INTERVAL_MS = 30_000   // 30 seconds
const MAX_QUEUE         = 50       // flush early if queue fills up
const PRUNE_AFTER_DAYS  = 90       // delete events older than this

// ── In-memory queue ───────────────────────────────────────────────────────────
let queue: AnalyticsEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Track a GTD analytics event.
 * Fire-and-forget — call without await from mutations and hooks.
 */
export async function track(name: GTDEventName, props?: EventProps): Promise<void> {
  // Guard: only track in browser environments
  if (typeof window === 'undefined') return

  const event: AnalyticsEvent = {
    id:    crypto.randomUUID(),
    name,
    ts:    Date.now(),
    ...(props ? { props } : {}),
  }

  queue.push(event)

  if (queue.length >= MAX_QUEUE) {
    await flush()
  } else if (!flushTimer) {
    flushTimer = setTimeout(() => { void flush() }, FLUSH_INTERVAL_MS)
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function flush(): Promise<void> {
  if (flushTimer) { clearTimeout(flushTimer); flushTimer = null }
  if (queue.length === 0) return

  const batch = queue.splice(0)   // drain queue atomically
  try {
    await db.analytics_events.bulkAdd(batch)
  } catch {
    // analytics must never crash the app — re-queue would risk infinite loop
  }
}

/**
 * Delete events older than PRUNE_AFTER_DAYS.
 * Call from a background effect once per session (e.g. on app mount).
 */
export async function pruneOldEvents(): Promise<void> {
  try {
    const cutoff = Date.now() - PRUNE_AFTER_DAYS * 24 * 60 * 60 * 1000
    await db.analytics_events.where('ts').below(cutoff).delete()
  } catch {
    // non-critical
  }
}

// ── Page-unload best-effort flush ─────────────────────────────────────────────
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // IndexedDB writes are async; we can only best-effort fire here.
    // The next session will have the same data via the queue (if tab wasn't killed).
    void flush()
  })
}
