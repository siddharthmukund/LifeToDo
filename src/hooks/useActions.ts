'use client'
import { useEffect, useMemo } from 'react'
import { useGTDStore } from '@/store/gtdStore'
import type { Action } from '@/types'

export function useActions() {
  const {
    actions,
    filters,
    loadActions,
    addAction,
    completeAction,
    updateAction,
    setFilter,
    clearFilters,
  } = useGTDStore()

  useEffect(() => {
    loadActions()
  }, [loadActions])

  // Apply filters in-memory — fast because list is <1000 items
  const filteredActions = useMemo<Action[]>(() => {
    return actions
      .filter(a => a.status === 'active')
      .filter(a => !filters.contextId || a.contextId === filters.contextId)
      .filter(a => !filters.energy    || a.energy   === filters.energy)
      .filter(a => !filters.maxTime   || a.timeEstimate <= filters.maxTime)
      // Sort: no-project first, then by creation date
      .sort((a, b) => {
        if (!a.projectId && b.projectId) return -1
        if (a.projectId && !b.projectId) return 1
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
  }, [actions, filters])

  const waitingForActions = useMemo(
    () => actions.filter(a => a.status === 'waiting'),
    [actions]
  )

  return {
    actions: filteredActions,
    waitingFor: waitingForActions,
    filters,
    addAction,
    completeAction,
    updateAction,
    setFilter,
    clearFilters,
    refresh: loadActions,
  }
}
