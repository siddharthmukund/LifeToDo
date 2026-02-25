'use client'
// useGTDContextFilter — unified GTD action filter hook.
// Wraps the Zustand filter slice with named, typed setters.
// Single responsibility: filter state access + mutation. No rendering.

import { useCallback } from 'react'
import { useGTDStore } from '@/store/gtdStore'
import type { EnergyLevel, TimeEstimate } from '@/types'

export function useGTDContextFilter() {
  const { filters, contexts, setFilter, clearFilters } = useGTDStore()

  const setContextFilter = useCallback(
    (id: string | null) => setFilter('contextId', id),
    [setFilter],
  )

  const setEnergyFilter = useCallback(
    (energy: EnergyLevel | null) => setFilter('energy', energy),
    [setFilter],
  )

  const setMaxTimeFilter = useCallback(
    (time: TimeEstimate | null) => setFilter('maxTime', time),
    [setFilter],
  )

  const hasActiveFilters = !!(filters.contextId || filters.energy || filters.maxTime)

  return {
    filters,
    contexts,
    setContextFilter,
    setEnergyFilter,
    setMaxTimeFilter,
    clearFilters,
    hasActiveFilters,
  }
}
