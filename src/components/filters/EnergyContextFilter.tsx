'use client'
import { X } from 'lucide-react'
import { useGTDStore } from '@/store/gtdStore'
import { Chip } from '@/components/ui/Chip'
import type { EnergyLevel } from '@/types'

const ENERGY_OPTIONS: { value: EnergyLevel | null; label: string; emoji: string }[] = [
  { value: null, label: 'Any', emoji: '' },
  { value: 'high', label: 'High', emoji: '⚡' },
  { value: 'medium', label: 'Medium', emoji: '🔸' },
  { value: 'low', label: 'Low', emoji: '🌱' },
]

export function EnergyContextFilter() {
  const { inboxFilters, setInboxFilter, clearInboxFilters } = useGTDStore(s => ({
    inboxFilters: s.inboxFilters,
    setInboxFilter: s.setInboxFilter,
    clearInboxFilters: s.clearInboxFilters,
  }))
  const contexts = useGTDStore(s => s.contexts)

  const hasFilters = inboxFilters.energy || inboxFilters.contextId

  return (
    <div className="px-6 pb-3 space-y-3">
      {/* Context row */}
      {contexts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar -mx-6 px-6">
          <Chip
            active={!inboxFilters.contextId}
            onClick={() => setInboxFilter('contextId', null)}
            label="All"
          />
          {contexts.map(ctx => (
            <Chip
              key={ctx.id}
              active={inboxFilters.contextId === ctx.id}
              onClick={() => setInboxFilter('contextId', inboxFilters.contextId === ctx.id ? null : ctx.id)}
              label={ctx.name}
              emoji={ctx.emoji}
            />
          ))}
        </div>
      )}

      {/* Energy + clear row */}
      <div className="flex items-center gap-2">
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar flex-1">
          {ENERGY_OPTIONS.map(opt => (
            <Chip
              key={opt.label}
              active={inboxFilters.energy === opt.value}
              onClick={() => setInboxFilter('energy', opt.value)}
              label={opt.label}
              emoji={opt.emoji || undefined}
            />
          ))}
        </div>
        {hasFilters && (
          <button
            onClick={clearInboxFilters}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary-ink shrink-0 ml-2"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>
    </div>
  )
}
