'use client'
// GuidedReview — ADHD Mode only.
// Replaces the standard 60-step weekly review with a structured 5-step,
// ~10-minute guided flow. Each step has a single clear endpoint.
// Progress is saved to localStorage so the user can abort and resume.

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ArrowRight, ArrowLeft, Inbox, FolderOpen, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useWeeklyReview } from '@/hooks/useWeeklyReview'
import { useStaleItems } from '@/hooks/useStaleItems'
import { useGTDStore } from '@/store/gtdStore'

const SAVE_KEY  = 'ltd_guided_review_step'
const TOTAL_STEPS = 5

export function GuidedReview() {
  const t  = useTranslations('adhd.guidedReview')
  const tr = useTranslations('adhd.garden')

  const { data, isLoading, finalize } = useWeeklyReview()
  const stale   = useStaleItems()
  const { actions } = useGTDStore()

  const [step, setStep]             = useState<number>(() => {
    if (typeof window === 'undefined') return 1
    return parseInt(localStorage.getItem(SAVE_KEY) ?? '1', 10) || 1
  })
  const [intentions, setIntentions] = useState(['', '', ''])
  const [winText, setWinText]       = useState('')
  const [finishing, setFinishing]   = useState(false)
  const [done, setDone]             = useState(false)
  const [streak, setStreak]         = useState<number | null>(null)

  // Projects without a next action (stuck)
  const stuckCount = actions.filter(
    a => a.status === 'active' && !a.projectId
  ).length // heuristic — actions with no project association means project might be stuck

  useEffect(() => {
    localStorage.setItem(SAVE_KEY, String(step))
  }, [step])

  async function handleFinish() {
    setFinishing(true)
    const s = await finalize(intentions.filter(Boolean))
    setStreak(s)
    setFinishing(false)
    setDone(true)
    localStorage.removeItem(SAVE_KEY)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest text-content-secondary">
            {t('title')}…
          </p>
        </div>
      </div>
    )
  }

  // ── Completion screen ──────────────────────────────────────────────────────
  if (done) {
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
          className="text-7xl"
          aria-hidden="true"
        >
          🌸
        </motion.span>
        <div>
          <h1 className="text-2xl font-display font-bold text-content-primary mb-1">
            {t('finish')}
          </h1>
          <p className="text-sm text-content-secondary">{t('gardenBlooms')}</p>
          {streak !== null && streak > 0 && (
            <p className="text-xs font-bold text-primary-ink mt-2">
              {streak} week streak 🌱
            </p>
          )}
        </div>
        <Link href="/" className="w-full max-w-xs">
          <Button fullWidth size="lg">Go to Today →</Button>
        </Link>
      </motion.div>
    )
  }

  const inboxCount = data?.sections.find(s => s.id === 'process_inbox')?.count ?? 0

  const steps = [
    {
      id: 1,
      title: t('step1.title'),
      icon: <Inbox size={20} className="text-primary-ink" />,
    },
    {
      id: 2,
      title: t('step2.title'),
      icon: <span className="text-base" aria-hidden="true">⏳</span>,
    },
    {
      id: 3,
      title: t('step3.title'),
      icon: <FolderOpen size={20} className="text-primary-ink" />,
    },
    {
      id: 4,
      title: t('step4.title'),
      icon: <span className="text-base" aria-hidden="true">🗓</span>,
    },
    {
      id: 5,
      title: t('step5.title'),
      icon: <Sparkles size={20} className="text-primary-ink" />,
    },
  ]

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-surface-base/95 backdrop-blur-xl
                      border-b border-border-default px-6 pt-14 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-display font-bold text-content-primary">
              {t('title')}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mt-0.5">
              {t('stepOf', { step, total: TOTAL_STEPS })} · {steps[step - 1]?.title}
            </p>
          </div>
          <span className="text-[10px] font-bold text-content-muted uppercase tracking-widest">
            {t('minutes')}
          </span>
        </div>
        <ProgressBar value={step - 1} max={TOTAL_STEPS} size="sm" />
      </div>

      {/* ── Step content ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >

            {/* ── Step 1: Clear Inbox ── */}
            {step === 1 && (
              <>
                <div>
                  <h2 className="text-2xl font-display font-bold text-content-primary mb-2">
                    {t('step1.question')}
                  </h2>
                  {inboxCount > 0 && (
                    <p className="text-sm text-content-secondary">
                      {t('step1.count', { count: inboxCount })}
                    </p>
                  )}
                </div>
                {inboxCount > 0 ? (
                  <Link href="/inbox">
                    <Button fullWidth size="lg" variant="secondary">
                      <Inbox size={16} /> {t('step1.goToInbox')}
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-5 py-4 rounded-2xl
                                  bg-primary/10 border border-primary/30 text-primary-ink font-bold">
                    <CheckCircle2 size={18} />
                    {t('step1.markDone')}
                  </div>
                )}
              </>
            )}

            {/* ── Step 2: Stale Stuff ── */}
            {step === 2 && (
              <>
                <h2 className="text-2xl font-display font-bold text-content-primary">
                  {t('step2.question')}
                </h2>
                {stale.total === 0 ? (
                  <div className="flex items-center gap-3 px-5 py-4 rounded-2xl
                                  bg-primary/10 border border-primary/30 text-primary-ink font-bold">
                    <CheckCircle2 size={18} />
                    {t('step2.noStale')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stale.inbox > 0 && (
                      <Link href="/inbox">
                        <div className="flex items-center justify-between px-5 py-4 rounded-2xl
                                        glass-card border border-border-default hover:border-primary/30 transition-colors">
                          <span className="text-sm font-medium text-content-primary">
                            📥 {t('step2.inboxStale', { count: stale.inbox })}
                          </span>
                          <span className="text-xs font-bold text-primary-ink">{t('step2.processInbox')}</span>
                        </div>
                      </Link>
                    )}
                    {stale.someday > 0 && (
                      <div className="px-5 py-4 rounded-2xl glass-card border border-border-default">
                        <span className="text-sm font-medium text-content-secondary">
                          ☁️ {t('step2.somedayStale', { count: stale.someday })}
                        </span>
                      </div>
                    )}
                    {stale.waitingFor > 0 && (
                      <Link href="/waiting">
                        <div className="flex items-center justify-between px-5 py-4 rounded-2xl
                                        glass-card border border-border-default hover:border-primary/30 transition-colors">
                          <span className="text-sm font-medium text-content-secondary">
                            👤 {t('step2.waitingStale', { count: stale.waitingFor })}
                          </span>
                          <span className="text-xs font-bold text-primary-ink">Review →</span>
                        </div>
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ── Step 3: Projects Check ── */}
            {step === 3 && (
              <>
                <h2 className="text-2xl font-display font-bold text-content-primary">
                  {t('step3.question')}
                </h2>
                {stuckCount === 0 ? (
                  <div className="flex items-center gap-3 px-5 py-4 rounded-2xl
                                  bg-primary/10 border border-primary/30 text-primary-ink font-bold">
                    <CheckCircle2 size={18} />
                    {t('step3.allGood')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-content-secondary">
                      {t('step3.stuckCount', { count: stuckCount })}
                    </p>
                    <Link href="/projects">
                      <Button fullWidth variant="secondary" size="lg">
                        <FolderOpen size={16} /> {t('step3.goToProjects')}
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* ── Step 4: Next Week Intentions ── */}
            {step === 4 && (
              <>
                <h2 className="text-2xl font-display font-bold text-content-primary">
                  {t('step4.question')}
                </h2>
                <div className="space-y-3">
                  {intentions.map((val, i) => (
                    <input
                      key={i}
                      value={val}
                      onChange={e => {
                        const next = [...intentions]
                        next[i] = e.target.value
                        setIntentions(next)
                      }}
                      placeholder={t('step4.placeholder', { number: i + 1 })}
                      className="w-full bg-surface-card border border-border-default rounded-2xl
                                 px-5 py-4 text-base font-medium text-content-primary
                                 placeholder-content-muted focus:outline-none focus:border-brand shadow-inner"
                    />
                  ))}
                  <p className="text-xs text-content-muted px-1">{t('step4.optional')}</p>
                </div>
              </>
            )}

            {/* ── Step 5: Win of the Week ── */}
            {step === 5 && (
              <>
                <h2 className="text-2xl font-display font-bold text-content-primary">
                  {t('step5.question')}
                </h2>
                <textarea
                  value={winText}
                  onChange={e => setWinText(e.target.value)}
                  placeholder={t('step5.placeholder')}
                  rows={4}
                  className="w-full bg-surface-card border border-border-default rounded-2xl
                             px-5 py-4 text-base font-medium text-content-primary resize-none
                             placeholder-content-muted focus:outline-none focus:border-brand shadow-inner"
                />
              </>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <div className="px-6 pb-10 pt-4 space-y-3 border-t border-border-default bg-surface-base">
        {step < TOTAL_STEPS ? (
          <Button
            fullWidth
            size="lg"
            onClick={() => setStep(s => Math.min(TOTAL_STEPS, s + 1))}
          >
            {t('next')} <ArrowRight size={16} />
          </Button>
        ) : (
          <Button fullWidth size="lg" loading={finishing} onClick={handleFinish}>
            {t('finish')}
          </Button>
        )}

        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-content-secondary
                         hover:text-content-primary transition-colors flex items-center justify-center gap-1"
            >
              <ArrowLeft size={14} /> {t('back')}
            </button>
          )}
          <button
            onClick={() => {
              localStorage.setItem(SAVE_KEY, String(step))
              window.history.back()
            }}
            className="flex-1 py-3 rounded-xl text-xs font-bold text-content-muted
                       hover:text-content-secondary transition-colors text-center"
          >
            {t('saveLater')}
          </button>
        </div>
      </div>
    </div>
  )
}
