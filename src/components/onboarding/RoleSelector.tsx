// src/components/onboarding/RoleSelector.tsx
'use client'

import { motion } from 'framer-motion'
import { ROLE_OPTIONS } from './rolePresets'
import type { UserRole } from '@/types'

interface RoleSelectorProps {
  selected: UserRole | null
  onSelect: (role: UserRole) => void
}

export function RoleSelector({ selected, onSelect }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {ROLE_OPTIONS.map((preset, i) => {
        const isSelected = selected === preset.role
        return (
          <motion.button
            key={preset.role}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
            onClick={() => onSelect(preset.role)}
            className={`flex flex-col items-start gap-2 p-4 rounded-2xl border text-left
              transition-all active:scale-95 min-h-[112px]
              ${isSelected
                ? 'bg-primary/10 border-primary/40 ring-2 ring-primary/30'
                : 'bg-surface-card border-border-default hover:bg-overlay-hover'
              }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-2xl">{preset.emoji}</span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              )}
            </div>
            <div>
              <p className={`text-sm font-bold ${isSelected ? 'text-primary-ink' : 'text-content-primary'}`}>
                {preset.label}
              </p>
              <p className="text-xs text-content-secondary mt-0.5 leading-snug">
                {preset.tagline}
              </p>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
