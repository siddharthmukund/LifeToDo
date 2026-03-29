'use client'
// EveningWindDown — ADHD Mode only.
// Lightweight end-of-day check-in: shows Morning 3 completion status,
// provides a quick capture input, then shows a calming closing message.

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { useGTDStore } from '@/store/gtdStore'
import { MORNING3_DATE_KEY, MORNING3_IDS_KEY } from './MorningThree'

export function EveningWindDown() {
  const t = useTranslations('adhd.evening')
  const { actions, addInboxItem } = useGTDStore()

  const [morning3Done, setMorning3Done]   = useState(0)
  const [morning3Total, setMorning3Total] = useState(0)
  const [captureText, setCaptureText]     = useState('')
  const [saved, setSaved]                 = useState(false)
  const [closed, setClosed]               = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const today     = new Date().toDateString()
    const savedDate = localStorage.getItem(MORNING3_DATE_KEY)
    if (savedDate !== today) return

    const raw = localStorage.getItem(MORNING3_IDS_KEY)
    if (!raw) return
    let ids: string[] = []
    try { ids = JSON.parse(raw) } catch { return }

    const picked = ids
      .map(id => actions.find(a => a.id === id))
      .filter(Boolean)

    setMorning3Total(picked.length)
    setMorning3Done(picked.filter(a => a!.status === 'complete').length)
  }, [actions])

  function handleCaptureSave() {
    const text = captureText.trim()
    if (!text) return
    addInboxItem(text, 'text')
    setSaved(true)
    setCaptureText('')
  }

  // ── Closing screen ────────────────────────────────────────────────────────
  if (closed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full px-8 text-center gap-6"
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="text-6xl"
          aria-hidden="true"
        >
          🌙
        </motion.span>
        <p className="text-base font-medium text-content-secondary max-w-xs">
          {t('closing')}
        </p>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-surface-base/95 backdrop-blur-xl
                      border-b border-border-default px-6 pt-14 pb-4">
        <div className="flex items-center gap-2">
          <Moon size={18} className="text-primary-ink" />
          <div>
            <h1 className="text-xl font-display font-bold text-content-primary">
              {t('title')}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mt-0.5">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 custom-scrollbar">

        {/* Morning 3 summary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl bg-surface-card border border-border-default p-5 space-y-3"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">
            {t('morning3Heading')}
          </p>

          {morning3Total === 0 ? (
            <p className="text-sm font-medium text-content-secondary">
              {t('morning3None')}
            </p>
          ) : morning3Done === morning3Total ? (
            <p className="text-base font-bold text-primary-ink">
              {t('morning3AllDone')}
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-content-secondary">
                {t('morning3Done', { done: morning3Done, total: morning3Total })}
              </p>
              {/* Progress dots */}
              <div className="flex gap-2">
                {Array.from({ length: morning3Total }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className={`w-3 h-3 rounded-full ${
                      i < morning3Done ? 'bg-primary-ink' : 'bg-border-default'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick capture */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-2xl bg-surface-card border border-border-default p-5 space-y-3"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">
            {t('captureHeading')}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={captureText}
              onChange={e => { setCaptureText(e.target.value); setSaved(false) }}
              onKeyDown={e => e.key === 'Enter' && handleCaptureSave()}
              placeholder={t('capturePlaceholder')}
              className="flex-1 bg-surface-base border border-border-default rounded-xl
                         px-4 py-3 text-sm font-medium text-content-primary
                         placeholder-content-muted focus:outline-none focus:border-brand"
            />
            <button
              onClick={handleCaptureSave}
              disabled={!captureText.trim()}
              className="px-4 py-3 rounded-xl bg-primary text-white font-bold text-sm
                         disabled:opacity-40 transition-opacity"
            >
              <Send size={14} />
            </button>
          </div>

          <AnimatePresence>
            {saved && (
              <motion.p
                key="saved"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-bold text-primary-ink"
              >
                {t('captureSaved')}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-10 pt-4 border-t border-border-default bg-surface-base">
        <Button fullWidth size="lg" onClick={() => setClosed(true)}>
          {t('done')} 🌙
        </Button>
      </div>
    </div>
  )
}
