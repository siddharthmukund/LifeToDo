'use client'
// MorningThree — ADHD Mode only.
// Morning ritual: AI suggests 3 tasks; user arranges by gut feel.
// Shown once per day before noon when ADHD Mode is ON and picks not yet set.
// Picks are persisted in localStorage keyed by date.

import { useState, useMemo } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { RefreshCw, Zap, Clock, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Action, EnergyLevel } from '@/types'

export const MORNING3_DATE_KEY = 'ltd_morning3_date'
export const MORNING3_IDS_KEY  = 'ltd_morning3_ids'

const ENERGY_EMOJI: Record<EnergyLevel, string> = {
  high: '⚡',
  medium: '🔵',
  low: '🌿',
}

/** Heuristic AI suggestion: prefer short, low-energy, standalone tasks. */
function suggestThree(actions: Action[]): Action[] {
  const scored = actions
    .filter(a => a.status === 'active')
    .map(a => {
      let score = 0
      if (a.timeEstimate <= 15) score += 3
      else if (a.timeEstimate <= 30) score += 1
      if (a.energy === 'low') score += 2
      else if (a.energy === 'medium') score += 1
      if (!a.projectId) score += 1 // standalone actions first
      if (a.scheduledDate) score += 2 // scheduled items are higher priority
      return { action: a, score }
    })
    .sort((a, b) => b.score - a.score)
    .map(s => s.action)

  return scored.slice(0, 3)
}

interface MorningThreeProps {
  actions: Action[]
  onComplete: (picks: Action[]) => void
  onSkip: () => void
}

export function MorningThree({ actions, onComplete, onSkip }: MorningThreeProps) {
  const t = useTranslations('adhd.morning')

  const suggested = useMemo(() => suggestThree(actions), [actions])
  const [picks, setPicks] = useState<Action[]>(suggested)
  const [confirmed, setConfirmed] = useState(false)

  function swap(index: number) {
    // Replace the pick at `index` with the next unused suggestion
    const used = new Set(picks.map(p => p.id))
    const bench = actions.filter(a => !used.has(a.id) && a.status === 'active')
    if (!bench.length) return
    const next = bench[0]
    setPicks(prev => prev.map((p, i) => (i === index ? next : p)))
  }

  function handleConfirm() {
    setConfirmed(true)
    // Persist to localStorage
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(MORNING3_DATE_KEY, today)
    localStorage.setItem(MORNING3_IDS_KEY, JSON.stringify(picks.map(p => p.id)))
    setTimeout(() => onComplete(picks), 600)
  }

  return (
    <div className="flex flex-col h-full px-6 pt-14 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-ink mb-2">
          {t('pickingFor')}
        </p>
        <h1 className="text-2xl font-display font-bold text-content-primary">
          {t('greeting')}
        </h1>
        <p className="text-sm text-content-secondary mt-1">{t('aiSuggesting')}</p>
      </motion.div>

      {/* Draggable picks */}
      <Reorder.Group
        axis="y"
        values={picks}
        onReorder={setPicks}
        className="space-y-3 flex-1"
        as="div"
      >
        <AnimatePresence>
          {picks.map((action, i) => (
            <Reorder.Item
              key={action.id}
              value={action}
              as="div"
              className="cursor-grab active:cursor-grabbing"
            >
              <motion.div
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-2xl px-5 py-4 border border-border-default
                           flex items-start gap-4 select-none"
              >
                {/* Drag handle / number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 border border-primary/20
                               flex items-center justify-center font-bold text-primary-ink text-sm mt-0.5">
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-content-primary leading-snug">{action.text}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold text-content-muted uppercase tracking-wide">
                      {ENERGY_EMOJI[action.energy]} {action.energy}
                    </span>
                    <span className="text-[10px] font-bold text-content-muted uppercase tracking-wide">
                      · {action.timeEstimate}m
                    </span>
                  </div>
                </div>

                {/* Swap button */}
                <button
                  onClick={() => swap(i)}
                  className="flex-shrink-0 p-2 rounded-xl text-content-muted hover:text-content-secondary
                             hover:bg-overlay-hover transition-colors"
                  aria-label={t('swapPrompt')}
                >
                  <RefreshCw size={15} />
                </button>
              </motion.div>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3 mt-8"
      >
        <motion.button
          onClick={handleConfirm}
          disabled={confirmed || picks.length === 0}
          whileTap={{ scale: 0.97 }}
          className="w-full py-5 rounded-2xl bg-primary text-on-brand font-bold text-base
                     shadow-glow-accent disabled:opacity-60 transition-opacity
                     flex items-center justify-center gap-2"
        >
          {confirmed ? t('confirm') : (
            <>
              {t('confirm')} <ArrowRight size={18} />
            </>
          )}
        </motion.button>

        <button
          onClick={onSkip}
          className="w-full py-3.5 text-sm font-bold text-content-muted hover:text-content-secondary
                     transition-colors"
        >
          {t('skip')}
        </button>
      </motion.div>
    </div>
  )
}
