'use client'
// useEnergy — reads and writes the persisted energy filter.
// Single responsibility: manage EnergyLevel | null selection.
// Persists to IndexedDB via settings store so it survives app restarts.

import { useCallback } from 'react'
import { useGTDStore } from '@/store/gtdStore'
import type { EnergyLevel } from '@/types'

interface UseEnergyResult {
  energy: EnergyLevel | null
  setEnergy: (level: EnergyLevel | null) => void
}

export function useEnergy(): UseEnergyResult {
  const settings      = useGTDStore(s => s.settings)
  const updateSettings = useGTDStore(s => s.updateSettings)

  const energy = settings?.lastEnergyLevel ?? null

  const setEnergy = useCallback(
    (level: EnergyLevel | null) => {
      updateSettings({ lastEnergyLevel: level })
    },
    [updateSettings],
  )

  return { energy, setEnergy }
}
