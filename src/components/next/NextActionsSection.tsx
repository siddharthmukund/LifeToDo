import { useState, useEffect } from 'react'
import { useGTDStore } from '@/store/gtdStore'
import { getNextActions } from '@/lib/db'
import { ActionCard } from '../today/ActionCard'
import { EnergyContextFilter } from '@/components/filters/EnergyContextFilter'
import type { Action } from '@/types'

export function NextActionsSection() {
  const { filters, completeAction } = useGTDStore(s => ({ filters: s.filters, completeAction: s.completeAction }))
  const [actions, setActions] = useState<Action[]>([])

  useEffect(() => {
    const f: { contextId?: string; energy?: string; maxTime?: number } = {}
    if (filters.contextId) f.contextId = filters.contextId
    if (filters.energy) f.energy = filters.energy
    if (filters.maxTime) f.maxTime = filters.maxTime
    getNextActions(f).then(setActions)
  }, [filters])

  return (
    <div className="flex flex-col h-full">
      <EnergyContextFilter />
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {actions.map(a => (
          <ActionCard key={a.id} action={a} onComplete={completeAction} />
        ))}
      </div>
    </div>
  )
}
