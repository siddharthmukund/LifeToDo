'use client'
// WelcomeBack — ADHD Mode only.
// Shown after 3+ days of inactivity. No mention of days away, no overdue counts.
// Guides a gentle 2-minute sweep of time-sensitive items, then offers Morning 3.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Archive, Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Action } from '@/types'

export const LAST_ACTIVE_KEY = 'ltd_last_active'

/** Returns true if the user has been away 3+ days. Call on mount. */
export function shouldShowWelcomeBack(): boolean {
  if (typeof window === 'undefined') return false
  const raw = localStorage.getItem(LAST_ACTIVE_KEY)
  if (!raw) return false
  const diff = (Date.now() - new Date(raw).getTime()) / (1000 * 60 * 60 * 24)
  return diff >= 3
}

/** Stamp the current time as last-active. Call on any meaningful interaction. */
export function stampLastActive(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAST_ACTIVE_KEY, new Date().toISOString())
  }
}

type ItemDecision = 'keep' | 'archive' | 'reschedule'

interface WelcomeBackProps {
  timeSensitiveItems: Action[]    // top 5 recent/scheduled items shown in sweep
  onArchive: (id: string) => void
  onReschedule: (id: string) => void
  onComplete: (wantsMorning3: boolean) => void
}

export function WelcomeBack({
  timeSensitiveItems,
  onArchive,
  onReschedule,
  onComplete,
}: WelcomeBackProps) {
  const t = useTranslations('adhd.welcomeBack')

  type Screen = 'greeting' | 'sweep' | 'done'
  const [screen, setScreen] = useState<Screen>('greeting')
  const [decisions, setDecisions] = useState<Record<string, ItemDecision>>({})
  const [currentIndex, setCurrentIndex] = useState(0)

  const items = timeSensitiveItems.slice(0, 5)
  const currentItem = items[currentIndex]
  const archivedCount = Object.values(decisions).filter(d => d === 'archive').length

  function decide(decision: ItemDecision) {
    if (!currentItem) return
    setDecisions(prev => ({ ...prev, [currentItem.id]: decision }))
    if (decision === 'archive') onArchive(currentItem.id)
    if (decision === 'reschedule') onReschedule(currentItem.id)

    if (currentIndex < items.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      setScreen('done')
    }
  }

  function startSweep() {
    if (items.length === 0) {
      setScreen('done')
    } else {
      setScreen('sweep')
    }
  }

  return (
    <div className="flex flex-col h-full px-6 pt-safe pb-10 justify-center">
      <AnimatePresence mode="wait">

        {/* ── Greeting ── */}
        {screen === 'greeting' && (
          <motion.div
            key="greeting"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex flex-col items-center text-center gap-6"
          >
            <span className="text-7xl" aria-hidden="true">🌿</span>
            <div>
              <h1 className="text-2xl font-display font-bold text-content-primary mb-2">
                {t('greeting')}
              </h1>
              {items.length > 0 && (
                <p className="text-base text-content-secondary">{t('sweepPrompt')}</p>
              )}
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              {items.length > 0 ? (
                <>
                  <button
                    onClick={startSweep}
                    className="w-full py-4 rounded-2xl bg-primary text-on-brand font-bold
                               shadow-glow-accent active:scale-95 transition-transform"
                  >
                    {t('sweepStart')}
                  </button>
                  <button
                    onClick={() => onComplete(false)}
                    className="w-full py-4 rounded-2xl bg-surface-card border border-border-default
                               text-content-secondary font-bold active:scale-95 transition-transform"
                  >
                    {t('sweepSkip')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onComplete(true)}
                  className="w-full py-4 rounded-2xl bg-primary text-on-brand font-bold
                             shadow-glow-accent active:scale-95 transition-transform"
                >
                  {t('morning3Yes')}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Sweep — one item at a time ── */}
        {screen === 'sweep' && currentItem && (
          <motion.div
            key={`sweep-${currentItem.id}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex flex-col gap-6"
          >
            {/* Progress */}
            <div className="flex gap-1.5">
              {items.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all
                    ${i < currentIndex ? 'bg-primary' : i === currentIndex ? 'bg-primary/40' : 'bg-border-subtle'}`}
                />
              ))}
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-3">
                {t('keepQuestion')}
              </p>
              <div className="glass-card rounded-2xl px-5 py-5 border border-border-default">
                <p className="text-lg font-bold text-content-primary leading-snug">
                  {currentItem.text}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => decide('keep')}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl
                           bg-primary/10 border border-primary/30 text-primary-ink font-bold
                           active:scale-95 transition-transform"
              >
                <Check size={18} />
                {t('keep')}
              </button>
              <button
                onClick={() => decide('archive')}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl
                           bg-surface-card border border-border-default text-content-secondary font-bold
                           active:scale-95 transition-transform"
              >
                <Archive size={18} />
                {t('archive')}
              </button>
              <button
                onClick={() => decide('reschedule')}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl
                           bg-surface-card border border-border-default text-content-secondary font-bold
                           active:scale-95 transition-transform"
              >
                <Calendar size={18} />
                {t('reschedule')}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Done ── */}
        {screen === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-6"
          >
            <span className="text-6xl" aria-hidden="true">🌱</span>
            <div>
              {archivedCount > 0 && (
                <p className="text-sm font-medium text-content-secondary mb-2">
                  {t('archived', { count: archivedCount })}
                </p>
              )}
              <p className="text-base font-bold text-content-primary">
                {t('allCleared')}
              </p>
            </div>

            <p className="text-sm text-content-secondary">{t('morning3Prompt')}</p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button
                onClick={() => onComplete(true)}
                className="w-full py-4 rounded-2xl bg-primary text-on-brand font-bold
                           shadow-glow-accent active:scale-95 transition-transform"
              >
                {t('morning3Yes')}
              </button>
              <button
                onClick={() => onComplete(false)}
                className="w-full py-4 rounded-2xl bg-surface-card border border-border-default
                           text-content-secondary font-bold active:scale-95 transition-transform"
              >
                {t('morning3Skip')}
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
