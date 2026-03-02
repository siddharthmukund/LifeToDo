'use client'
// EnergyToggle — 3-pill selector for High / Med / Low energy.
// Single responsibility: emit the selected energy level.
// Tapping the active pill deselects (shows all energy levels).

import { motion } from 'framer-motion'
import type { EnergyLevel } from '@/types'
import { ENERGY_CONFIG } from '@/constants/gtd'
import { cn } from '@/lib/utils'

interface EnergyToggleProps {
  value: EnergyLevel | null
  onChange: (level: EnergyLevel | null) => void
  className?: string
}

const LEVELS: EnergyLevel[] = ['high', 'medium', 'low']

export function EnergyToggle({ value, onChange, className }: EnergyToggleProps) {
  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="group"
      aria-label="Filter by energy level"
    >
      <span className="text-xs text-content-secondary flex-shrink-0">Energy:</span>
      <div className="flex gap-1.5">
        {LEVELS.map(level => {
          const cfg     = ENERGY_CONFIG[level]
          const active  = value === level

          return (
            <motion.button
              key={level}
              whileTap={{ scale: 0.92 }}
              onClick={() => onChange(active ? null : level)}
              className={cn(
                'relative flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium',
                'transition-colors duration-200 select-none',
                active
                  ? 'text-content-primary shadow-md'
                  : 'bg-overlay-hover text-content-secondary hover:bg-overlay-hover',
              )}
              style={active ? { backgroundColor: cfg.color } : undefined}
              aria-pressed={active}
              aria-label={`${cfg.label} energy`}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
              {active && (
                <motion.span
                  layoutId="energy-active"
                  className="absolute inset-0 rounded-full opacity-20 bg-white"
                  style={{ zIndex: -1 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
      {value && (
        <button
          onClick={() => onChange(null)}
          className="text-xs text-content-secondary hover:text-status-error transition-colors"
          aria-label="Clear energy filter"
        >
          ✕
        </button>
      )}
    </div>
  )
}
