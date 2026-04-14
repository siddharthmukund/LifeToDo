'use client'
import { useCallback, useEffect } from 'react'
import { useGTDStore } from '@/store/gtdStore'
import type { InboxItem, ClarifyDecision } from '@/types'

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
    inboxFilters,
    setInboxFilter,
    clearInboxFilters,
    addAction,
    addProject,
    updateProject,
  } = useGTDStore()

  useEffect(() => {
    loadInbox()
  }, [loadInbox])

  /**
   * GTD clarify dispatch — routes a processed inbox item to the correct bucket.
   * Lives here (not in InboxSection) because it is business logic, not UI.
   */
  const dispatchClarified = useCallback(async (
    item: InboxItem,
    decision: ClarifyDecision,
  ): Promise<void> => {
    const {
      destination,
      contextId = 'ctx-anywhere',
      energy = 'medium',
      timeEstimate = 15,
      projectName,
      nextActionText,
      waitingForPerson,
      waitingForDate,
    } = decision

    switch (destination) {
      case 'next_action':
        await addAction({ text: item.text, contextId, energy, timeEstimate, status: 'active' })
        break
      case 'project': {
        const project = await addProject({
          name: projectName ?? item.text,
          outcome: projectName ?? item.text,
          status: 'active',
        })
        const action = await addAction({
          text: nextActionText ?? item.text,
          contextId, energy, timeEstimate,
          status: 'active',
          projectId: project.id,
        })
        await updateProject(project.id, { nextActionId: action.id })
        break
      }
      case 'waiting_for':
        await addAction({
          text: item.text, contextId, energy, timeEstimate,
          status: 'waiting',
          waitingFor: waitingForPerson
            ? { person: waitingForPerson, followUpDate: waitingForDate ?? new Date() }
            : undefined,
        })
        break
      case 'someday':
        await addAction({ text: item.text, contextId, energy, timeEstimate, status: 'someday' })
        break
      default:
        break
    }

    await markInboxProcessed(item.id)
  }, [addAction, addProject, updateProject, markInboxProcessed])

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
    filters: inboxFilters,
    setFilter: setInboxFilter,
    clearFilters: clearInboxFilters,
    dispatchClarified,
  }
}
