// src/components/settings/GTDPreferences.tsx
// GTD behaviour thresholds — stale items, default energy, 2-min rule.
// iCCW #6 D3C deliverable.
'use client'

import { Zap, Clock, Archive, Users } from 'lucide-react'
import { useGTDStore } from '@/store/gtdStore'
import type { EnergyLevel } from '@/types'

const ENERGY_OPTIONS: EnergyLevel[] = ['high', 'medium', 'low']

/** Reusable toggle — explicit state-driven styling, no Tailwind peer-checked tricks */
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{ backgroundColor: checked ? 'var(--primary)' : 'var(--surface-bright)' }}
      className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
                 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base active:scale-95"
    >
      <span
        className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(22px)' : 'translateX(3px)' }}
      />
    </button>
  )
}

export function GTDPreferences() {
  const { settings, updateSettings } = useGTDStore()
  if (!settings) return null

  const staleInboxDays      = settings.staleInboxDays      ?? 7
  const waitingForDays      = settings.waitingForDays      ?? 14
  const twoMinuteRuleEnabled = settings.twoMinuteRuleEnabled ?? true

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
                onClick={() => void updateSettings({ staleInboxDays: days })}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-95
                  ${staleInboxDays === days
                    ? 'bg-primary text-on-brand shadow-glow-accent'
                    : 'bg-surface-elevated text-content-secondary border border-border-default hover:text-content-primary'
                  }`}
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
                onClick={() => void updateSettings({ waitingForDays: days })}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-95
                  ${waitingForDays === days
                    ? 'bg-primary text-on-brand shadow-glow-accent'
                    : 'bg-surface-elevated text-content-secondary border border-border-default hover:text-content-primary'
                  }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* 2-minute rule toggle */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock size={15} className="text-content-secondary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-content-primary">2-minute rule</p>
              <p className="text-xs text-content-secondary mt-0.5">
                Suggest "do it now" for tasks under 2 minutes
              </p>
            </div>
          </div>
          <Toggle
            checked={twoMinuteRuleEnabled}
            onChange={v => void updateSettings({ twoMinuteRuleEnabled: v })}
          />
        </div>

      </div>
    </div>
  )
}
