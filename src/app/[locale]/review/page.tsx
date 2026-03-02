'use client'
// Weekly Review — guided wizard with stale-item nudges.
// Updated in iCCW #3: added StreakCalendar to completion screen.

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Flame, ChevronRight, Check, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StreakCalendar } from '@/components/ui/StreakCalendar'
import { useWeeklyReview } from '@/hooks/useWeeklyReview'
import { useStaleItems } from '@/hooks/useStaleItems'
import { db } from '@/lib/db'
import type { ReviewSection } from '@/types'
import Link from 'next/link'
import { ReviewChat } from '@/components/ai/ReviewChat'
import { useFeatureFlag } from '@/flags/useFeatureFlag'

const PHASE_LABELS = { get_clear: 'Get Clear', get_current: 'Get Current', get_creative: 'Get Creative' }

export default function ReviewPage() {
  const { data, isLoading, completedIds, isAllDone, completeSection, finalize } = useWeeklyReview()
  const stale = useStaleItems()
  const [intentions, setIntentions] = useState(['', '', ''])
  const [finalStreak, setFinalStreak] = useState<number | null>(null)
  const [finishing, setFinishing] = useState(false)
  const [reviewDates, setReviewDates] = useState<string[]>([])

  const isAiEnabled = useFeatureFlag('ai_coach')

  async function handleFinish() {
    setFinishing(true)
    const streak = await finalize(intentions)
    setFinalStreak(streak)
    setFinishing(false)
  }

  // Load past review dates for the StreakCalendar when we reach the completion screen
  useEffect(() => {
    if (finalStreak !== null) {
      db.reviews.orderBy('completedAt').toArray().then(reviews => {
        setReviewDates(
          reviews.map(r => new Date(r.completedAt).toISOString().split('T')[0])
        )
      })
    }
  }, [finalStreak])

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-primary-ink animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest text-content-secondary">Building your review…</p>
        </div>
      </div>
    )
  }

  // ── Completion screen ────────────────────────────────────────────────────
  if (finalStreak !== null) {
    return (
      <div className="flex flex-col items-center px-6 pt-safe pb-10 text-center animate-fade-in overflow-y-auto custom-scrollbar min-h-screen justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="text-7xl mb-5"
        >
          🔥
        </motion.div>
        <h1 className="text-3xl font-display font-bold text-content-primary mb-2">Week {finalStreak} streak!</h1>
        <p className="text-content-secondary font-medium mb-8">You have a trusted system. Keep it alive.</p>

        {/* Streak calendar */}
        {reviewDates.length > 0 && (
          <div className="w-full max-w-sm mb-8">
            <p className="text-[10px] font-bold text-content-secondary uppercase tracking-widest mb-3 text-left">
              Your review history
            </p>
            <StreakCalendar completedDates={reviewDates} weeks={6} />
          </div>
        )}

        {/* Intentions recap */}
        {intentions.filter(Boolean).length > 0 && (
          <div className="w-full max-w-sm glass-card rounded-2xl p-6 mb-8 text-left border-l-4 border-l-primary">
            <p className="text-[10px] font-bold text-content-secondary uppercase tracking-widest mb-4">
              This week&rsquo;s intentions
            </p>
            {intentions.filter(Boolean).map((intent, i) => (
              <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                <span className="text-primary-ink font-bold text-sm mt-0.5 flex-shrink-0">{i + 1}.</span>
                <p className="text-base font-medium text-content-primary">{intent}</p>
              </div>
            ))}
          </div>
        )}

        <Link href="/" className="w-full max-w-sm">
          <Button fullWidth size="lg">Go to Today →</Button>
        </Link>
      </div>
    )
  }

  if (!data) return null

  const grouped = {
    get_clear: data.sections.filter(s => s.phase === 'get_clear'),
    get_current: data.sections.filter(s => s.phase === 'get_current'),
    get_creative: data.sections.filter(s => s.phase === 'get_creative'),
  }

  const completedCount = data.sections.filter(s => completedIds.has(s.id)).length

  return (
    <div className="flex h-full animate-fade-in bg-surface-base">
      <div className="flex-1 flex flex-col h-full bg-surface-base lg:max-w-3xl lg:mx-auto">
        {/* ── Sticky header ──────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 bg-surface-base/95 backdrop-blur-xl border-b border-border-default px-6 pt-14 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-content-primary flex items-center gap-2">
                <RefreshCw size={22} className="text-primary-ink" />
                Weekly Review
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-content-secondary mt-1.5">
                ~{data.estimatedMinutes} min · {data.totalItems} items
                {data.currentStreak > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-status-warning">
                    <Flame size={13} /> {data.currentStreak} streak
                  </span>
                )}
              </p>
            </div>
          </div>
          <ProgressBar
            value={completedCount}
            max={data.sections.length}
            label={`${completedCount}/${data.sections.length} steps`}
            showLabel
            size="sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">

          {/* ── Stale nudge ─────────────────────────────────────────────────── */}
          {stale.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-status-warning-border bg-status-warning-bg p-5 shadow-inner"
            >
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-status-warning flex-shrink-0" />
                <p className="text-[10px] font-bold text-status-warning uppercase tracking-widest">
                  Needs Attention ({stale.total})
                </p>
              </div>
              <div className="space-y-3">
                {stale.inbox > 0 && (
                  <Link href="/inbox" className="block">
                    <div className="flex items-center justify-between text-base font-medium py-1">
                      <span className="text-content-primary">
                        📥 {stale.inbox} inbox item{stale.inbox !== 1 ? 's' : ''} older than 7 days
                      </span>
                      <span className="text-primary-ink text-xs font-bold uppercase tracking-wider ml-3 flex-shrink-0">Process →</span>
                    </div>
                  </Link>
                )}
                {stale.someday > 0 && (
                  <div className="text-base font-medium py-1 text-content-secondary">
                    ☁️ {stale.someday} someday item{stale.someday !== 1 ? 's' : ''} not reviewed in 30+ days
                  </div>
                )}
                {stale.waitingFor > 0 && (
                  <Link href="/waiting" className="block">
                    <div className="flex items-center justify-between text-base font-medium py-1">
                      <span className="text-content-secondary">
                        👤 {stale.waitingFor} waiting-for item{stale.waitingFor !== 1 ? 's' : ''} need a follow-up
                      </span>
                      <span className="text-primary-ink text-xs font-bold uppercase tracking-wider ml-3 flex-shrink-0">Review →</span>
                    </div>
                  </Link>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Review phases ───────────────────────────────────────────────── */}
          {(['get_clear', 'get_current', 'get_creative'] as const).map(phase => (
            <div key={phase}>
              <p className="text-[10px] font-bold text-content-secondary uppercase tracking-widest mb-4 px-2">
                {PHASE_LABELS[phase]}
              </p>
              <div className="space-y-2">
                {grouped[phase].map(section => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    completed={completedIds.has(section.id)}
                    onComplete={() => completeSection(section.id)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* ── Set intentions ──────────────────────────────────────────────── */}
          {isAllDone && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 pt-4 border-t border-border-default"
            >
              <p className="text-[10px] font-bold text-content-secondary uppercase tracking-widest px-2">Set Intentions</p>
              <p className="text-base font-medium text-content-primary px-2 mb-2">
                What are the 3 most important outcomes for next week?
              </p>
              {intentions.map((val, i) => (
                <input
                  key={i}
                  value={val}
                  onChange={e => {
                    const next = [...intentions]
                    next[i] = e.target.value
                    setIntentions(next)
                  }}
                  placeholder={`Intention ${i + 1}…`}
                  className="w-full bg-surface-card border border-border-default rounded-2xl px-5 py-4 text-base font-medium text-content-primary placeholder-content-muted focus:outline-none focus:border-brand shadow-inner"
                />
              ))}
              <div className="pt-4">
                <Button fullWidth size="lg" loading={finishing} onClick={handleFinish}>
                  🔥 Complete Review
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {
          isAiEnabled && (
            <div className="hidden lg:block w-[400px] border-l border-border-default h-full shrink-0">
              <ReviewChat />
            </div>
          )
        }
      </div >
    </div >
  )
}

// ── Section card ─────────────────────────────────────────────────────────────
function SectionCard({
  section, completed, onComplete,
}: {
  section: ReviewSection
  completed: boolean
  onComplete: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`glass-card rounded-2xl transition-colors
      ${completed ? 'border-primary/30 opacity-60' : 'border-border-default border'}`}
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-overlay-hover rounded-2xl"
      >
        <div
          onClick={e => { e.stopPropagation(); onComplete() }}
          className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all bg-surface-card active:scale-95
            ${completed
              ? 'bg-primary/20 border-primary text-primary-ink shadow-glow-accent'
              : 'border-border-default hover:border-brand'}`}
        >
          {completed && <Check size={16} strokeWidth={3} />}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-base font-bold ${completed ? 'line-through text-content-secondary' : 'text-content-primary'}`}>
            {section.title}
          </p>
          {section.count > 0 && (
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary-ink mt-1">
              {section.count} items
            </p>
          )}
        </div>

        <ChevronRight
          size={20}
          className={`text-content-muted transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1">
              <p className="text-sm font-medium text-content-secondary mb-4">{section.description}</p>
              {section.items && section.items.length > 0 && (
                <div className="space-y-2">
                  {section.items.slice(0, 5).map((item, i) => (
                    <div
                      key={i}
                      className="text-sm font-medium text-content-primary bg-overlay-dim rounded-xl px-4 py-3 truncate border border-border-subtle"
                    >
                      {'text' in item ? item.text : 'name' in item ? (item as { name: string }).name : ''}
                    </div>
                  ))}
                  {section.items.length > 5 && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-content-secondary pl-4 mt-2">
                      +{section.items.length - 5} more
                    </p>
                  )}
                </div>
              )}
              {!completed && (
                <button
                  onClick={onComplete}
                  className="mt-5 text-[10px] font-bold uppercase tracking-widest text-primary-ink hover:underline hover:text-primary-ink/80 transition-colors"
                >
                  Mark as reviewed ✓
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
