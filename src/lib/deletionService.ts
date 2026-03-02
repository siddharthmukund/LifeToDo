// src/lib/deletionService.ts
// Client-side account deletion orchestration.
// Step 1: writes DeletionRequest to local Dexie (source of truth)
// Step 2: best-effort server notification for Firestore mirror + Stripe cleanup
// D8 deliverable.

import { db } from '@/lib/db'
import type { DeletionRequest } from '@/types'

const COOLING_DAYS = 7

/**
 * Schedules account deletion.
 * - Cancels any existing pending requests for this user.
 * - Writes a new DeletionRequest to Dexie (pending, +7 days).
 * - Notifies the server API (best-effort; fails gracefully offline).
 */
export async function scheduleAccountDeletion(uid: string): Promise<DeletionRequest> {
  // Cancel any pre-existing pending request for this user
  await db.deletion_requests
    .where('status').equals('pending')
    .and(r => r.uid === uid)
    .modify({ status: 'cancelled', cancelledAt: new Date().toISOString() })

  const now = new Date()
  const scheduledAt = new Date(now.getTime() + COOLING_DAYS * 24 * 60 * 60 * 1000)

  const request: DeletionRequest = {
    uid,
    requestedAt: now.toISOString(),
    scheduledDeletionAt: scheduledAt.toISOString(),
    status: 'pending',
  }

  const id = await db.deletion_requests.add(request)

  // Notify server (best-effort — fails gracefully if offline or unconfigured)
  try {
    await fetch('/api/account/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, scheduledDeletionAt: scheduledAt.toISOString() }),
    })
  } catch {
    console.warn('[deletion] Server notification failed — will retry on next session')
  }

  return { ...request, id: id as number }
}

/**
 * Cancels a pending deletion request for the given user.
 * Updates Dexie locally and notifies the server.
 */
export async function cancelAccountDeletion(uid: string): Promise<void> {
  await db.deletion_requests
    .where('status').equals('pending')
    .and(r => r.uid === uid)
    .modify({ status: 'cancelled', cancelledAt: new Date().toISOString() })

  try {
    await fetch('/api/account/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    })
  } catch {
    console.warn('[deletion] Cancel notification failed')
  }
}

/**
 * Wipes all local IndexedDB data.
 * Called automatically once the cooling period expires (or by the server job).
 */
export async function executeLocalDeletion(): Promise<void> {
  const tables = [
    db.inbox_items,
    db.actions,
    db.projects,
    db.contexts,
    db.reviews,
    db.settings,
    db.analytics_events,
    db.perf_logs,
    db.error_log,
    db.sync_queue,
    db.profile,
    db.subscription,
    db.lifetime_stats,
    db.deletion_requests,
  ] as const

  await Promise.all(tables.map(t => t.clear()))
}
