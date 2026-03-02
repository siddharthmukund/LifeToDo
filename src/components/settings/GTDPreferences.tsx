// src/components/settings/GTDPreferences.tsx
// GTD behaviour thresholds — stale items, default energy, 2-min rule.
// iCCW #6 D3C deliverable.
'use client'

import { Zap, Clock, Archive, Users } from 'lucide-react'
import { useGTDStore } from '@/store/gtdStore'
import type { EnergyLevel } from '@/types'

const ENERGY_OPTIONS: EnergyLevel[] = ['high', 'medium', 'low']

export function GTDPreferences() {
  const { settings, updateSettings } = useGTDStore()
  if (!settings) return null

  return (
    <div className="space-y-3">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-content-secondary px-1">
        GTD Preferences
      </h2>
      <div className="bg-surface-card rounded-2xl border border-border-default p-5 space-y-6">

        {/* Default energy level */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={15} className="text-content-secondary" />
            <p className="text-sm font-medium text-content-primary">Default energy level</p>
          </div>
          <div className="flex gap-1.5">
            {ENERGY_OPTIONS.map(level => (
              <button
                key={level}
                onClick={() => updateSettings({ lastEnergyLevel: level })}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-colors active:scale-95
                  ${settings.lastEnergyLevel === level
                    ? 'bg-primary text-on-brand shadow-glow-accent'
                    : 'bg-surface-elevated text-content-secondary border border-border-default hover:text-content-primary'
                  }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Stale inbox threshold */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Archive size={15} className="text-content-secondary" />
            <p className="text-sm font-medium text-content-primary">Stale inbox nudge</p>
          </div>
          <p className="text-xs text-content-secondary mb-2">
            Alert when inbox items are unprocessed for longer than:
          </p>
          <div className="flex gap-1.5">
            {[3, 5, 7, 14].map(days => (
              <button
                key={days}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-surface-elevated
                           text-content-secondary border border-border-default hover:text-content-primary
                           transition-colors active:scale-95"
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* Waiting-for threshold */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users size={15} className="text-content-secondary" />
            <p className="text-sm font-medium text-content-primary">Waiting-for follow-up</p>
          </div>
          <p className="text-xs text-content-secondary mb-2">
            Nudge after no update for:
          </p>
          <div className="flex gap-1.5">
            {[7, 14, 21, 30].map(days => (
              <button
                key={days}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-surface-elevated
                           text-content-secondary border border-border-default hover:text-content-primary
                           transition-colors active:scale-95"
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* 2-minute rule threshold */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} className="text-content-secondary" />
            <p className="text-sm font-medium text-content-primary">2-minute rule</p>
          </div>
          <p className="text-xs text-content-secondary mb-2">
            Auto-suggest "do it now" for tasks under:
          </p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 5].map(mins => (
              <button
                key={mins}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-surface-elevated
                           text-content-secondary border border-border-default hover:text-content-primary
                           transition-colors active:scale-95"
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
