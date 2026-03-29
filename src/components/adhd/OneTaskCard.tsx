'use client'
// OneTaskCard — ADHD Mode only.
// Full-screen single-task engage view. Eliminates comparison paralysis
// by showing exactly one action at a time. User completes, skips, or focuses.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, SkipForward, CheckCircle2, Zap, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FocusTimer } from './FocusTimer'
import type { Action } from '@/types'

const ENERGY_EMOJI: Record<string, string> = {
  high: '⚡',
  medium: '🔵',
  low: '🌿',
}

interface OneTaskCardProps {
  action: Action
  projectName?: string
  doneCount: number
  totalCount: number
  onComplete: (id: string) => void
  onSkip: (id: string) => void
}

export function OneTaskCard({
  action,
  projectName,
  doneCount,
  totalCount,
  onComplete,
  onSkip,
}: OneTaskCardProps) {
  const t = useTranslations('adhd')
  const [showFocus, setShowFocus] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [skipping, setSkipping] = useState(false)

  async function handleComplete() {
    setCompleting(true)
    await onComplete(action.id)
  }

  function handleSkip() {
    setSkipping(true)
    setTimeout(() => {
      onSkip(action.id)
      setSkipping(false)
    }, 400)
  }

  const progress = totalCount > 0 ? doneCount / totalCount : 0

  return (
    <>
      <AnimatePresence>
        {showFocus && (
          <FocusTimer
            taskText={action.text}
            onComplete={() => {
              setShowFocus(false)
              handleComplete()
            }}
            onClose={() => setShowFocus(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: completing ? 0 : skipping ? 0 : 1, y: completing || skipping ? -20 : 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col h-full px-6 pt-6 pb-10"
      >
        {/* Progress dots */}
        {totalCount > 0 && (
          <div className="flex items-center gap-2 mb-8" aria-label={t('engage.doneOf', { done: doneCount, total: totalCount })}>
            {Array.from({ length: totalCount }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all duration-300
                  ${i < doneCount ? 'bg-primary' : 'bg-border-subtle'}`}
              />
            ))}
          </div>
        )}

        {/* Prompt */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-ink mb-6">
          {t('engage.doThisNext')}
        </p>

        {/* Task card — main content */}
        <motion.div
          className="glass-card rounded-3xl p-7 flex-1 flex flex-col justify-between
                     border border-border-default shadow-lg mb-6"
          whileHover={{ scale: 1.005 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {/* Project tag */}
          {projectName && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-4">
              📁 {projectName}
            </p>
          )}

          {/* Task text */}
          <p className="text-2xl font-display font-bold text-content-primary leading-snug flex-1">
            {action.text}
          </p>

          {/* Metadata chips */}
          <div className="flex flex-wrap gap-2 mt-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-content-secondary
                             bg-surface-elevated border border-border-subtle px-3 py-1.5 rounded-full">
              {ENERGY_EMOJI[action.energy]} {action.energy}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-content-secondary
                             bg-surface-elevated border border-border-subtle px-3 py-1.5 rounded-full">
              <Clock size={12} /> {action.timeEstimate}m
            </span>
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="space-y-3">
          {/* Primary: Complete */}
          <motion.button
            onClick={handleComplete}
            disabled={completing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-5 rounded-2xl bg-primary text-on-brand font-bold text-base
                       shadow-glow-accent disabled:opacity-60 transition-colors
                       flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={20} />
            Done!
          </motion.button>

          <div className="flex gap-3">
            {/* Focus timer */}
            <button
              onClick={() => setShowFocus(true)}
              className="flex-1 py-4 rounded-2xl bg-surface-card border border-border-default
                         text-content-secondary font-bold text-sm active:scale-95 transition-transform
                         flex items-center justify-center gap-2"
            >
              <Timer size={16} />
              {t('engage.focus')}
            </button>

            {/* Skip */}
            <button
              onClick={handleSkip}
              disabled={skipping}
              className="flex-1 py-4 rounded-2xl bg-surface-card border border-border-default
                         text-content-secondary font-bold text-sm active:scale-95 transition-transform
                         flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <SkipForward size={16} />
              {t('engage.skip')}
            </button>
          </div>
        </div>

        {/* Win counter inline */}
        {doneCount > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs font-bold text-content-muted mt-5"
          >
            {doneCount === totalCount && totalCount > 0
              ? t('engage.allDone')
              : t('engage.doneOf', { done: doneCount, total: totalCount })}
          </motion.p>
        )}
      </motion.div>
    </>
  )
}
