'use client'
// TransitionNudge — ADHD Mode only.
// Full-screen pause overlay between completed task and the next one.
// Prevents impulsive task-switching by creating a deliberate micro-ritual.

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface TransitionNudgeProps {
  onReady: () => void
  onBreak: () => void
}

export function TransitionNudge({ onReady, onBreak }: TransitionNudgeProps) {
  const t = useTranslations('adhd.transition')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center
                 bg-surface-base/98 backdrop-blur-xl px-8 text-center"
      role="dialog"
      aria-modal="true"
      aria-label={t('heading')}
    >
      {/* Calm checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/30
                   flex items-center justify-center mb-8"
      >
        <span className="text-4xl" aria-hidden="true">✓</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-display font-bold text-content-primary mb-2"
      >
        {t('heading')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-base text-content-secondary mb-12"
      >
        {t('subtitle')}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <button
          onClick={onReady}
          className="w-full py-4 rounded-2xl bg-primary text-on-brand font-bold text-base
                     shadow-glow-accent active:scale-95 transition-transform"
        >
          {t('ready')}
        </button>
        <button
          onClick={onBreak}
          className="w-full py-4 rounded-2xl bg-surface-card border border-border-default
                     text-content-secondary font-bold text-base active:scale-95 transition-transform"
        >
          {t('break')}
        </button>
      </motion.div>
    </motion.div>
  )
}
