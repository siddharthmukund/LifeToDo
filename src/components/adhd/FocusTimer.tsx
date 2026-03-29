'use client'
// FocusTimer — ADHD Mode only.
// Externalises time perception (ADHD time-blindness accommodation).
// User picks 15 / 25 / 45 min; timer counts down with a calm progress ring.
// Fires onComplete when time expires; onClose dismisses early.

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'

const DURATIONS = [15, 25, 45] as const
type Duration = typeof DURATIONS[number]

interface FocusTimerProps {
  taskText: string
  onComplete: () => void
  onClose: () => void
}

export function FocusTimer({ taskText, onComplete, onClose }: FocusTimerProps) {
  const t = useTranslations('adhd.focus')

  const [selected, setSelected] = useState<Duration | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)

  const totalSeconds = selected ? selected * 60 : 0
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0

  const start = useCallback((dur: Duration) => {
    setSelected(dur)
    setSecondsLeft(dur * 60)
    setRunning(true)
  }, [])

  useEffect(() => {
    if (!running || secondsLeft <= 0) return
    const id = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(id)
          setRunning(false)
          setFinished(true)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running, secondsLeft])

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const seconds = String(secondsLeft % 60).padStart(2, '0')

  // SVG progress ring
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center
                 bg-surface-base/98 backdrop-blur-xl px-8 text-center"
      role="dialog"
      aria-modal="true"
      aria-label={selected ? t('start') : t('title')}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-safe right-6 p-2 rounded-xl text-content-secondary
                   hover:text-content-primary hover:bg-overlay-hover transition-colors"
        aria-label={t('cancel')}
      >
        <X size={20} />
      </button>

      <AnimatePresence mode="wait">
        {/* ── Finished state ── */}
        {finished && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <span className="text-7xl" aria-hidden="true">🌿</span>
            <p className="text-2xl font-display font-bold text-content-primary">
              {t('done')}
            </p>
            <button
              onClick={onComplete}
              className="px-8 py-4 rounded-2xl bg-primary text-on-brand font-bold text-base
                         shadow-glow-accent active:scale-95 transition-transform"
            >
              {t('cancel')}
            </button>
          </motion.div>
        )}

        {/* ── Running state ── */}
        {running && !finished && (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-8"
          >
            {/* Progress ring */}
            <div className="relative w-32 h-32" aria-hidden="true">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60" cy="60" r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-border-subtle"
                />
                <circle
                  cx="60" cy="60" r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="text-primary transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-display font-bold text-content-primary tabular-nums">
                  {minutes}:{seconds}
                </span>
              </div>
            </div>

            <p className="text-sm font-medium text-content-secondary max-w-xs line-clamp-2">
              {taskText}
            </p>

            <p className="text-xs font-bold uppercase tracking-widest text-content-muted">
              {t('timeRemaining', { minutes, seconds })}
            </p>
          </motion.div>
        )}

        {/* ── Picker state ── */}
        {!selected && !running && !finished && (
          <motion.div
            key="picker"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-8 w-full max-w-xs"
          >
            <div>
              <h2 className="text-2xl font-display font-bold text-content-primary mb-2">
                {t('title')}
              </h2>
              <p className="text-sm text-content-secondary">{t('subtitle')}</p>
            </div>

            <p className="text-sm font-medium text-content-primary px-2 line-clamp-2 text-center">
              {taskText}
            </p>

            <div className="flex gap-3 w-full">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  onClick={() => start(d)}
                  className="flex-1 py-5 rounded-2xl bg-surface-card border border-border-default
                             font-bold text-content-primary hover:border-primary/50 hover:bg-primary/5
                             active:scale-95 transition-all text-lg"
                >
                  {d}
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-content-muted mt-0.5">
                    min
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
