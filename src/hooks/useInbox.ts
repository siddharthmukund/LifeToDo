'use client'
import { useEffect } from 'react'
import { useGTDStore } from '@/store/gtdStore'

/** Thin wrapper — components read from the Zustand store, actions go through it. */
export function useInbox() {
  const {
    inboxItems,
    inboxCount,
    loadInbox,
    addInboxItem,
    markInboxProcessed,
    deleteInboxItem,
    clarifyingItemId,
    setClarifyingItem,
  } = useGTDStore()

  useEffect(() => {
    loadInbox()
  }, [loadInbox])

  return {
    items: inboxItems,
    count: inboxCount,
    addItem: addInboxItem,
    processItem: markInboxProcessed,
    deleteItem: deleteInboxItem,
    clarifyingItemId,
    startClarify: setClarifyingItem,
    stopClarify: () => setClarifyingItem(null),
    refresh: loadInbox,
  }
}
