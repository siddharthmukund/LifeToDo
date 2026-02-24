'use client'
import { useGTDStore } from '@/store/gtdStore'
import type { EnergyLevel, TimeEstimate } from '@/types'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

const ENERGY_STEPS: { value: EnergyLevel | null; label: string; pct: number }[] = [
  { value: null, label: 'Any', pct: 0 },
  { value: 'low', label: 'Low', pct: 33.33 },
  { value: 'medium', label: 'Medium', pct: 66.66 },
  { value: 'high', label: 'High', pct: 100 },
]

export function FilterBar() {
  const { contexts, filters, setFilter, clearFilters } = useGTDStore()

  const hasFilters = filters.contextId || filters.energy || filters.maxTime

  // Current energy step index
  const activeEnergyStep = ENERGY_STEPS.findIndex(s => s.value === filters.energy)
  const energyLabel = ENERGY_STEPS[activeEnergyStep]?.label ?? 'Any'
  const energyPct = ENERGY_STEPS[activeEnergyStep]?.pct ?? 0

  return (
    <div className="space-y-8 pb-4">
      {/* Context Chips row */}
      <div className="px-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Context</h2>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 flex items-center gap-1"
            >
              Clear All <X size={12} />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-2 px-2">
          <Chip
            active={!filters.contextId}
            onClick={() => setFilter('contextId', null)}
            label="All Contexts"
          />
          {contexts.map(ctx => (
            <Chip
              key={ctx.id}
              active={filters.contextId === ctx.id}
              onClick={() =>
                setFilter('contextId', filters.contextId === ctx.id ? null : ctx.id)
              }
              label={ctx.name}
              emoji={ctx.emoji}
            />
          ))}
        </div>
      </div>

      {/* Energy Filter Slider */}
      <div className="px-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Energy Filter</h2>
          <span className="text-primary text-xs font-bold">{energyLabel}</span>
        </div>

        <div className="relative h-2 w-full rounded-full bg-card-dark border border-white/5 cursor-pointer">
          {/* Track */}
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full bg-primary active-glow"
            animate={{ width: `${energyPct}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />

          {/* Thumb */}
          <motion.div
            className="absolute -top-2 size-6 rounded-full border-4 border-background-dark bg-primary shadow-glow-accent cursor-grab active:cursor-grabbing"
            animate={{ left: `calc(${energyPct}% - 12px)` }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />

          {/* Click targets for steps */}
          <div className="absolute inset-x-0 -top-4 -bottom-4 flex justify-between">
            {ENERGY_STEPS.map((step) => (
              <div
                key={step.label}
                className="flex-1 h-full"
                onClick={() => setFilter('energy', step.value)}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {ENERGY_STEPS.map((step, idx) => (
            <span
              key={step.label}
              className={cn(
                "cursor-pointer transition-colors px-2 -mx-2",
                activeEnergyStep === idx ? "text-primary" : "hover:text-slate-300"
              )}
              onClick={() => setFilter('energy', step.value)}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Chip({ active, onClick, label, emoji }: { active: boolean; onClick: () => void; label: string; emoji?: string | null }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm transition-all active:scale-95 border',
        active
          ? 'bg-primary text-background-dark font-bold border-transparent shadow-glow-accent'
          : 'bg-card-dark border-white/5 font-medium text-slate-400 hover:border-white/10'
      )}
    >
      {emoji && <span className="text-lg">{emoji}</span>}
      {label}
    </button>
  )
}
