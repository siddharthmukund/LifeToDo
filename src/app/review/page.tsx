'use client'
// Weekly Review — guided wizard with stale-item nudges.
// StaleNudge section surfaces overdue items before the review checklist.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Flame, ChevronRight, Check, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useWeeklyReview } from '@/hooks/useWeeklyReview'
import { useStaleItems } from '@/hooks/useStaleItems'
import type { ReviewSection } from '@/types'
import Link from 'next/link'

const PHASE_LABELS = { get_clear: 'Get Clear', get_current: 'Get Current', get_creative: 'Get Creative' }

export default function ReviewPage() {
  const { data, isLoading, completedIds, isAllDone, completeSection, finalize } = useWeeklyReview()
  const stale = useStaleItems()
  const [intentions, setIntentions] = useState(['', '', ''])
  const [finalStreak, setFinalStreak] = useState<number | null>(null)
  const [finishing, setFinishing] = useState(false)

  async function handleFinish() {
    setFinishing(true)
    const streak = await finalize(intentions)
    setFinalStreak(streak)
    setFinishing(false)
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-primary animate-spin" />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Building your review…</p>
        </div>
      </div>
    )
  }

  // ── Completion screen ────────────────────────────────────────────────────
  if (finalStreak !== null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center animate-fade-in">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="text-7xl mb-6"
        >
          🔥
        </motion.div>
        <h1 className="text-3xl font-display font-bold text-white mb-3">Week {finalStreak} streak!</h1>
        <p className="text-slate-400 font-medium mb-10">You have a trusted system. Keep it alive.</p>
        {intentions.filter(Boolean).length > 0 && (
          <div className="w-full max-w-sm glass-card rounded-2xl p-6 mb-10 text-left border-l-4 border-l-primary">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">This week&rsquo;s intentions</p>
            {intentions.filter(Boolean).map((intent, i) => (
              <div key={i} className="flex items-start gap-3 mb-3">
                <span className="text-primary font-bold text-sm mt-0.5 flex-shrink-0">{i + 1}.</span>
                <p className="text-base font-medium text-white">{intent}</p>
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
    <div className="flex flex-col h-full animate-fade-in">

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background-dark/95 backdrop-blur-xl border-b border-primary/10 px-6 pt-14 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <RefreshCw size={22} className="text-primary" />
              Weekly Review
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1.5">
              ~{data.estimatedMinutes} min · {data.totalItems} items
              {data.currentStreak > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-yellow-500">
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
            className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 shadow-inner"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0" />
              <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">
                Needs Attention ({stale.total})
              </p>
            </div>
            <div className="space-y-3">
              {stale.inbox > 0 && (
                <Link href="/inbox" className="block">
                  <div className="flex items-center justify-between text-base font-medium py-1">
                    <span className="text-white">
                      📥 {stale.inbox} inbox item{stale.inbox !== 1 ? 's' : ''} older than 7 days
                    </span>
                    <span className="text-primary text-xs font-bold uppercase tracking-wider ml-3 flex-shrink-0">Process →</span>
                  </div>
                </Link>
              )}
              {stale.someday > 0 && (
                <div className="text-base font-medium py-1 text-slate-300">
                  ☁️ {stale.someday} someday item{stale.someday !== 1 ? 's' : ''} not reviewed in 30+ days
                </div>
              )}
              {stale.waitingFor > 0 && (
                <div className="text-base font-medium py-1 text-slate-300">
                  👤 {stale.waitingFor} waiting-for item{stale.waitingFor !== 1 ? 's' : ''} need a follow-up
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Review phases ───────────────────────────────────────────────── */}
        {(['get_clear', 'get_current', 'get_creative'] as const).map(phase => (
          <div key={phase}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">
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
            className="space-y-5 pt-4 border-t border-primary/10"
          >
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Set Intentions</p>
            <p className="text-base font-medium text-white px-2 mb-2">What are the 3 most important outcomes for next week?</p>
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
                className="w-full bg-card-dark border border-white/10 rounded-2xl px-5 py-4
                           text-base font-medium text-white placeholder-slate-500 focus:outline-none
                           focus:border-primary/50 shadow-inner"
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
    </div>
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
      ${completed ? 'border-primary/30 opacity-60' : 'border-white/5 border'}`}
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        <div
          onClick={e => { e.stopPropagation(); onComplete() }}
          className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all bg-card-dark active:scale-95
            ${completed ? 'bg-primary/20 border-primary text-primary shadow-glow-accent' : 'border-white/20 hover:border-primary/50'}`}
        >
          {completed && <Check size={16} strokeWidth={3} />}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-base font-bold ${completed ? 'line-through text-slate-500' : 'text-white'}`}>
            {section.title}
          </p>
          {section.count > 0 && (
            <p className="text-[10px] uppercase tracking-widest font-bold text-primary mt-1">{section.count} items</p>
          )}
        </div>

        <ChevronRight
          size={20}
          className={`text-slate-500 transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}
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
              <p className="text-sm font-medium text-slate-400 mb-4">{section.description}</p>
              {section.items && section.items.length > 0 && (
                <div className="space-y-2">
                  {section.items.slice(0, 5).map((item, i) => (
                    <div key={i} className="text-sm font-medium text-slate-300 bg-black/20 rounded-xl px-4 py-3 truncate border border-white/5">
                      {'text' in item ? item.text : 'name' in item ? (item as { name: string }).name : ''}
                    </div>
                  ))}
                  {section.items.length > 5 && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-4 mt-2">+{section.items.length - 5} more</p>
                  )}
                </div>
              )}
              {!completed && (
                <button onClick={onComplete} className="mt-5 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline hover:text-primary/80 transition-colors">
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
