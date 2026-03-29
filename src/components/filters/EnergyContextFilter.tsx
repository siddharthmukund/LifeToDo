import { useGTDStore } from '@/store/gtdStore'
import type { EnergyLevel } from '@/types'

export function EnergyContextFilter() {
  const { inboxFilters, setInboxFilter, clearInboxFilters } = useGTDStore(s => ({
    inboxFilters: s.inboxFilters,
    setInboxFilter: s.setInboxFilter,
    clearInboxFilters: s.clearInboxFilters,
  }))
  const contexts = useGTDStore(s => s.contexts)

  return (
    <div className="flex gap-2 items-center py-2 px-6">
      <select
        value={inboxFilters.energy ?? ''}
        onChange={e => setInboxFilter('energy', (e.target.value as EnergyLevel) || null)}
        className="px-3 py-1 rounded bg-surface-card border border-border-default"
      >
        <option value="">All energy</option>
        {(['high', 'medium', 'low'] as EnergyLevel[]).map(e => (
          <option key={e} value={e}>
            {e.charAt(0).toUpperCase() + e.slice(1)}
          </option>
        ))}
      </select>

      <select
        value={inboxFilters.contextId ?? ''}
        onChange={e => setInboxFilter('contextId', e.target.value || null)}
        className="px-3 py-1 rounded bg-surface-card border border-border-default"
      >
        <option value="">All contexts</option>
        {contexts.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <button
        onClick={clearInboxFilters}
        className="text-xs text-content-secondary ml-auto"
      >
        Reset
      </button>
    </div>
  )
}
