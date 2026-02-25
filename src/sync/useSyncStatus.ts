'use client'
// sync/useSyncStatus.ts
// Hook that surfaces sync health to UI components.
// Combines online/offline state with queue depth and exposes a syncNow trigger.
//
// The actual sync-to-remote logic lives in a future Pro-tier integration layer.
// For now syncNow() marks all 'local' records as 'queued' and logs the intent.

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/db'
import { queueCount } from './syncQueue'
import { pendingSyncCount } from './deltaCalculator'

// ── Types ─────────────────────────────────────────────────────────────────────

export type SyncStatusCode =
  | 'idle'           // online, nothing to sync
  | 'pending'        // online, records waiting to push
  | 'syncing'        // actively pushing (future)
  | 'offline'        // no network
  | 'error'          // last sync failed

export interface SyncStatus {
  code:         SyncStatusCode
  isOnline:     boolean
  pendingCount: number
  queueDepth:   number
  lastSyncAt:   Date | null
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSyncStatus(): SyncStatus & { syncNow: () => Promise<void> } {
  const [isOnline,     setIsOnline]     = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [pendingCount, setPendingCount] = useState(0)
  const [queueDepth,   setQueueDepth]   = useState(0)
  const [lastSyncAt,   setLastSyncAt]   = useState<Date | null>(null)
  const [code,         setCode]         = useState<SyncStatusCode>('idle')

  // Refresh counts from Dexie
  const refresh = useCallback(async () => {
    const [pending, queued] = await Promise.all([
      pendingSyncCount(),
      queueCount(),
    ])
    setPendingCount(pending)
    setQueueDepth(queued)

    if (!isOnline) { setCode('offline'); return }
    if (pending + queued > 0) { setCode('pending'); return }
    setCode('idle')
  }, [isOnline])

  // Network events
  useEffect(() => {
    const goOnline  = () => { setIsOnline(true);  void refresh() }
    const goOffline = () => { setIsOnline(false); setCode('offline') }
    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    void refresh()
    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [refresh])

  /**
   * Attempt to push pending records.
   * In the current Free/local-only architecture this marks records as 'queued'
   * so they're ready when a Pro sync adapter is attached.
   */
  const syncNow = useCallback(async () => {
    if (!isOnline || code === 'syncing') return
    setCode('syncing')
    try {
      // Mark all 'local' actions/projects/inbox_items as 'queued'
      await Promise.all([
        db.actions.where('syncStatus').equals('local').modify({ syncStatus: 'queued' }),
        db.projects.where('syncStatus').equals('local').modify({ syncStatus: 'queued' }),
        db.inbox_items.where('syncStatus').equals('local').modify({ syncStatus: 'queued' }),
      ])
      setLastSyncAt(new Date())
      await refresh()
    } catch {
      setCode('error')
    }
  }, [isOnline, code, refresh])

  const status: SyncStatusCode =
    !isOnline                       ? 'offline'
    : pendingCount + queueDepth > 0 ? 'pending'
    :                                  code === 'error' ? 'error' : 'idle'

  return { code: status, isOnline, pendingCount, queueDepth, lastSyncAt, syncNow }
}
