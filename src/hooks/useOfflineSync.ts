'use client'
// useOfflineSync — tracks network connectivity and pending sync state.
// Offline-first: the app works without network; this hook surfaces status.
// Pro tier: when back online, triggers Firestore sync queue flush.

import { useState, useEffect } from 'react'

export interface OfflineSyncState {
  /** True when navigator.onLine is true. */
  isOnline: boolean
  /** Convenience inverse of isOnline. */
  isOffline: boolean
  /** True when there are local-only mutations waiting to sync (Pro tier). */
  hasPendingSync: boolean
}

export function useOfflineSync(): OfflineSyncState {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return true
    return navigator.onLine
  })

  // Future: read pending sync count from db
  const hasPendingSync = false

  useEffect(() => {
    function handleOnline()  { setIsOnline(true)  }
    function handleOffline() { setIsOnline(false) }

    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline, isOffline: !isOnline, hasPendingSync }
}
