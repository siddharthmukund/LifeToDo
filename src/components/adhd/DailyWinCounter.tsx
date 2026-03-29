'use client'
// DailyWinCounter — ADHD Mode only.
// Persistent banner showing "X things done today ✓".
// Always visible; celebrates partial progress (never shows 0 as failure).

import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

interface DailyWinCounterProps {
  count: number
  total?: number  // if set, shows "X of Y"
}

export function DailyWinCounter({ count, total }: DailyWinCounterProps) {
  const t = useTranslations('adhd.winCounter')

  const label =
    total && total > 0 && count >= total
      ? t('allClear')
      : count === 0
        ? t('zero')
        : count === 1
          ? t('one', { count })
          : t('other', { count })

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={label}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl
                   bg-primary/8 border border-primary/20 text-primary-ink"
      >
        <span className="text-base leading-none" aria-hidden="true">🌱</span>
        <span className="text-xs font-bold tracking-wide">{label}</span>
        {count > 0 && total && total > 0 && count < total && (
          <span className="ml-auto text-[10px] font-bold text-primary-ink/60 tabular-nums">
            {count}/{total}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
