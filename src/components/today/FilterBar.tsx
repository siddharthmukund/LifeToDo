'use client'
import { useTranslations } from 'next-intl'
import { useGTDStore } from '@/store/gtdStore'
import type { EnergyLevel } from '@/types'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Chip } from '@/components/ui/Chip'

export function FilterBar() {
  const { contexts, filters, setFilter, clearFilters } = useGTDStore()
  const t = useTranslations('engage.filter')

  const ENERGY_STEPS: { value: EnergyLevel | null; labelKey: string; pct: number }[] = [
    { value: null, labelKey: 'any', pct: 0 },
    { value: 'low', labelKey: 'low', pct: 33.33 },
    { value: 'medium', labelKey: 'medium', pct: 66.66 },
    { value: 'high', labelKey: 'high', pct: 100 },
  ]

  const hasFilters = filters.contextId || filters.energy || filters.maxTime

  const activeEnergyStep = ENERGY_STEPS.findIndex(s => s.value === filters.energy)
  const energyLabel = t(ENERGY_STEPS[activeEnergyStep]?.labelKey ?? 'any')
  const energyPct = ENERGY_STEPS[activeEnergyStep]?.pct ?? 0

  return (
    <div className="space-y-8 pb-4">
      {/* Context Chips row */}
      <div className="px-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-content-secondary">{t('context')}</h2>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-[10px] font-bold uppercase tracking-widest text-primary-ink hover:text-primary-ink/80 flex items-center gap-1"
            >
              {t('clearAll')} <X size={12} />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-2 px-2">
          <Chip
            active={!filters.contextId}
            onClick={() => setFilter('contextId', null)}
            label={t('allContexts')}
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
          <h2 className="text-xs font-bold uppercase tracking-widest text-content-secondary">{t('energyFilter')}</h2>
          <span className="text-primary-ink text-xs font-bold">{energyLabel}</span>
        </div>

        <div className="relative h-2 w-full rounded-full bg-surface-card border border-border-default cursor-pointer">
          {/* Track */}
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full bg-primary active-glow"
            animate={{ width: `${energyPct}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />

          {/* Thumb */}
          <motion.div
            className="absolute -top-2 size-6 rounded-full border-4 border-surface-base bg-primary shadow-glow-accent cursor-grab active:cursor-grabbing"
            animate={{ left: `calc(${energyPct}% - 12px)` }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />

          {/* Click targets for steps */}
          <div className="absolute inset-x-0 -top-4 -bottom-4 flex justify-between">
            {ENERGY_STEPS.map((step) => (
              <div
                key={step.labelKey}
                className="flex-1 h-full"
                onClick={() => setFilter('energy', step.value)}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-content-secondary">
          {ENERGY_STEPS.map((step, idx) => (
            <span
              key={step.labelKey}
              className={cn(
                "cursor-pointer transition-colors px-2 -mx-2",
                activeEnergyStep === idx ? "text-primary-ink" : "hover:text-content-primary"
              )}
              onClick={() => setFilter('energy', step.value)}
            >
              {t(step.labelKey)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

