// sync/syncQueue.ts
// CRUD helpers for the sync_queue Dexie table.
// The queue holds operations to replay against a remote when connectivity returns.
// All queue manipulation is transactional where possible.

import { db } from '@/lib/db'
import type { SyncQueueItem } from '@/types'

const MAX_ATTEMPTS = 5   // give up after this many retries

// ── Enqueue ───────────────────────────────────────────────────────────────────

/**
 * Add a write operation to the sync queue.
 *
 * @param tableName  e.g. 'actions', 'projects', 'inbox_items'
 * @param operation  'add' | 'update' | 'delete'
 * @param recordId   Primary key of the affected record
 * @param payload    The full record JSON (omit for delete operations)
 */
export async function enqueue(
  tableName: string,
  operation: SyncQueueItem['operation'],
  recordId:  string,
  payload?:  Record<string, unknown>,
): Promise<SyncQueueItem> {
  const item: SyncQueueItem = {
    id:        crypto.randomUUID(),
    tableName,
    operation,
    recordId,
    payload:   payload ? JSON.stringify(payload) : undefined,
    ts:        Date.now(),
    attempts:  0,
  }
  await db.sync_queue.add(item)
  return item
}

// ── Dequeue ───────────────────────────────────────────────────────────────────

/** Remove a successfully synced item from the queue */
export async function dequeue(id: string): Promise<void> {
  await db.sync_queue.delete(id)
}

/** Remove all successfully synced items for a record */
export async function dequeueRecord(tableName: string, recordId: string): Promise<void> {
  await db.sync_queue
    .where('tableName').equals(tableName)
    .filter(item => item.recordId === recordId)
    .delete()
}

// ── Read ──────────────────────────────────────────────────────────────────────

/** All queued items, oldest first */
export async function getQueue(): Promise<SyncQueueItem[]> {
  return db.sync_queue.orderBy('ts').toArray()
}

/** Items that haven't exceeded the retry limit */
export async function getRetryableQueue(): Promise<SyncQueueItem[]> {
  return db.sync_queue
    .filter(item => item.attempts < MAX_ATTEMPTS)
    .sortBy('ts')
}

/** Count of all queued items */
export async function queueCount(): Promise<number> {
  return db.sync_queue.count()
}

// ── Update ────────────────────────────────────────────────────────────────────

/** Increment attempt counter after a failed sync */
export async function markFailed(id: string): Promise<void> {
  const item = await db.sync_queue.get(id)
  if (!item) return
  await db.sync_queue.update(id, { attempts: item.attempts + 1 })
}

/** Purge items that have exhausted all retries */
export async function purgeExhausted(): Promise<void> {
  await db.sync_queue
    .filter(item => item.attempts >= MAX_ATTEMPTS)
    .delete()
}
