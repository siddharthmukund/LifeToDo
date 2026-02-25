// sync/deltaCalculator.ts
// Computes records that have changed since a given timestamp.
// Strategy: filter by syncStatus === 'local' | 'queued' (these need to be pushed).
// Only records explicitly marked for sync are included — privacy-preserving.

import { db } from '@/lib/db'
import type { Action, Project, InboxItem } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DeltaPayload {
  actions:     Action[]
  projects:    Project[]
  inbox_items: InboxItem[]
  computedAt:  number
  /** Rough byte estimate of this payload (for budget checks) */
  estimatedBytes: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function estimateBytes(obj: unknown): number {
  return new Blob([JSON.stringify(obj)]).size
}

// ── Core function ─────────────────────────────────────────────────────────────

/**
 * Return all records with syncStatus 'local' or 'queued' across the three
 * core mutable tables. These are records that were created/updated offline
 * and haven't been pushed to a remote yet.
 *
 * The payload stays small because only unsynced records are included.
 */
export async function calculateDelta(): Promise<DeltaPayload> {
  const pendingStatuses = ['local', 'queued'] as const

  const [actions, projects, inbox_items] = await Promise.all([
    db.actions.where('syncStatus').anyOf(pendingStatuses as unknown as string[]).toArray(),
    db.projects.where('syncStatus').anyOf(pendingStatuses as unknown as string[]).toArray(),
    db.inbox_items.where('syncStatus').anyOf(pendingStatuses as unknown as string[]).toArray(),
  ])

  const payload: DeltaPayload = {
    actions,
    projects,
    inbox_items,
    computedAt: Date.now(),
    estimatedBytes: 0,
  }
  payload.estimatedBytes = estimateBytes(payload)

  return payload
}

/** Total count of unsynced records across all tables */
export async function pendingSyncCount(): Promise<number> {
  const [a, p, i] = await Promise.all([
    db.actions.where('syncStatus').anyOf(['local', 'queued']).count(),
    db.projects.where('syncStatus').anyOf(['local', 'queued']).count(),
    db.inbox_items.where('syncStatus').anyOf(['local', 'queued']).count(),
  ])
  return a + p + i
}
