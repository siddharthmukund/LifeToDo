'use client'
// Today / Next Actions — answers "What should I do right now?"
// Default Mode: energy filter, progress bar, 7-item pagination.
// ADHD Mode ON: Welcome Back → Morning 3 → OneTaskCard → TransitionNudge flow.

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { ActionCard } from '@/components/today/ActionCard'
import { FilterBar } from '@/components/today/FilterBar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { XPBar } from '@/components/gamification/XPBar'
import { InsightWidget } from '@/components/ai/InsightWidget'
import {
  OneTaskCard,
  MorningThree,
  WelcomeBack,
  TransitionNudge,
  DailyWinCounter,
  shouldShowWelcomeBack,
  stampLastActive,
  MORNING3_DATE_KEY,
  MORNING3_IDS_KEY,
} from '@/components/adhd'
import { useActions } from '@/hooks/useActions'
import { useEnergy } from '@/hooks/useEnergy'
import { useGTDStore } from '@/store/gtdStore'
import { useADHDMode } from '@/hooks/useADHDMode'
import { db } from '@/lib/db'
import { ADHD_MAX_ITEMS } from '@/constants/gtd'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { Action } from '@/types'

export default function TodayPage() {
  const t = useTranslations('engage')
  const { isADHDMode } = useADHDMode()
  const { actions, waitingFor, filters, setFilter, completeAction, updateAction, refresh } = useActions()
  const inboxCount = useGTDStore(s => s.inboxCount)

  // Persisted energy preference
  const { energy: savedEnergy, setEnergy: persistEnergy } = useEnergy()

  // ── Standard state ─────────────────────────────────────────────────────────
  const [projectNames, setProjectNames] = useState<Record<string, string>>({})
  const [completed, setCompleted] = useState<string[]>([])
  const [doneToday, setDoneToday] = useState(0)
  const [page, setPage] = useState(0)

  // ── ADHD Mode state ────────────────────────────────────────────────────────
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)
  const [showMorningThree, setShowMorningThree] = useState(false)
  const [morning3Actions, setMorning3Actions] = useState<Action[]>([])
  const [morning3Index, setMorning3Index] = useState(0)
  const [showTransition, setShowTransition] = useState(false)
  const adhdInitialised = useRef(false)

  // On first mount: restore energy preference
  useEffect(() => {
    if (savedEnergy && !filters.energy) setFilter('energy', savedEnergy)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset page on filter change
  useEffect(() => { setPage(0) }, [filters.energy, filters.contextId, filters.maxTime])

  // Pre-load project names
  useEffect(() => {
    async function load() {
      const ids = Array.from(new Set(actions.map(a => a.projectId).filter(Boolean) as string[]))
      const map: Record<string, string> = {}
      await Promise.all(ids.map(async id => {
        const p = await db.projects.get(id)
        if (p) map[id] = p.name
      }))
      setProjectNames(map)
    }
    load()
  }, [actions])

  // ADHD Mode initialisation — runs once after actions are loaded
  useEffect(() => {
    if (!isADHDMode || adhdInitialised.current || actions.length === 0) return
    adhdInitialised.current = true

    // Stamp today as last active (after reading, to detect the gap correctly)
    const isReturn = shouldShowWelcomeBack()
    stampLastActive()

    if (isReturn) {
      setShowWelcomeBack(true)
      return
    }

    initialiseMorning3()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isADHDMode, actions])

  function initialiseMorning3() {
    const today = new Date().toISOString().split('T')[0]
    const m3Date = localStorage.getItem(MORNING3_DATE_KEY)

    if (m3Date === today) {
      // Restore today's picks (filter out completed)
      try {
        const ids: string[] = JSON.parse(localStorage.getItem(MORNING3_IDS_KEY) || '[]')
        const picks = ids
          .map(id => actions.find(a => a.id === id))
          .filter(Boolean) as Action[]
        if (picks.length > 0) {
          setMorning3Actions(picks)
          // Start at the first still-active pick
          const idx = picks.findIndex(p => p.status === 'active')
          setMorning3Index(idx >= 0 ? idx : picks.length)
        }
      } catch { /* ignore corrupt localStorage */ }
      return
    }

    // Before noon → show Morning 3 ritual
    if (new Date().getHours() < 12) {
      setShowMorningThree(true)
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  async function handleComplete(id: string) {
    setCompleted(prev => [...prev, id])
    setDoneToday(n => n + 1)
    await completeAction(id)
    setTimeout(() => setCompleted(prev => prev.filter(c => c !== id)), 600)
    refresh()

    // In ADHD one-task mode: show transition nudge before next task
    if (isADHDMode && morning3Actions.length > 0) {
      setShowTransition(true)
    }
  }

  function handleEnergyChange(level: typeof savedEnergy) {
    setFilter('energy', level)
    persistEnergy(level)
    setPage(0)
  }

  function handleTransitionReady() {
    setShowTransition(false)
    setMorning3Index(i => i + 1)
  }

  function handleTransitionBreak() {
    // User wants a break — fall through to standard paginated view
    setShowTransition(false)
    setMorning3Actions([])
  }

  function handleMorningThreeComplete(picks: Action[]) {
    setMorning3Actions(picks)
    setMorning3Index(0)
    setShowMorningThree(false)
  }

  function handleMorningThreeSkip() {
    setShowMorningThree(false)
  }

  function handleWelcomeBackComplete(wantsMorning3: boolean) {
    setShowWelcomeBack(false)
    if (wantsMorning3) {
      setShowMorningThree(true)
    } else {
      initialiseMorning3()
    }
  }

  function handleWelcomeBackArchive(id: string) {
    updateAction(id, { status: 'someday' })
  }

  function handleWelcomeBackReschedule(id: string) {
    // Deferred: move to someday for now; full reschedule date-picker in a future session
    updateAction(id, { status: 'someday' })
  }

  // ── Derived data ───────────────────────────────────────────────────────────
  const pendingActions = actions.filter(a => !completed.includes(a.id))
  const totalItems = pendingActions.length
  const totalPages = isADHDMode ? Math.max(1, Math.ceil(totalItems / ADHD_MAX_ITEMS)) : 1
  const visibleActions = isADHDMode
    ? pendingActions.slice(page * ADHD_MAX_ITEMS, (page + 1) * ADHD_MAX_ITEMS)
    : pendingActions
  const totalForProgress = doneToday + totalItems

  // Current Morning 3 task (undefined when all done or list empty)
  const currentMorning3Task = morning3Actions[morning3Index] ?? null
  const morning3AllDone = morning3Actions.length > 0 && morning3Index >= morning3Actions.length

  // Time-sensitive items for WelcomeBack sweep (scheduled first, then recent active)
  const timeSensitiveItems = [...pendingActions]
    .sort((a, b) => {
      const aHasDate = a.scheduledDate ? 1 : 0
      const bHasDate = b.scheduledDate ? 1 : 0
      return bHasDate - aHasDate
    })
    .slice(0, 5)

  // ── ADHD Mode: full-screen overlays ───────────────────────────────────────
  if (isADHDMode && showWelcomeBack) {
    return (
      <WelcomeBack
        timeSensitiveItems={timeSensitiveItems}
        onArchive={handleWelcomeBackArchive}
        onReschedule={handleWelcomeBackReschedule}
        onComplete={handleWelcomeBackComplete}
      />
    )
  }

  if (isADHDMode && showMorningThree) {
    return (
      <MorningThree
        actions={pendingActions}
        onComplete={handleMorningThreeComplete}
        onSkip={handleMorningThreeSkip}
      />
    )
  }

  // ── ADHD Mode: one-task-at-a-time view ────────────────────────────────────
  if (isADHDMode && currentMorning3Task && !morning3AllDone) {
    return (
      <div className="flex flex-col h-full animate-fade-in">
        {/* Slim ADHD header */}
        <div className="sticky top-0 z-10 bg-surface-base/95 backdrop-blur-xl
                        border-b border-border-default px-6 pt-14 pb-3">
          <DailyWinCounter
            count={doneToday}
            total={morning3Actions.length}
          />
        </div>

        {/* Transition nudge overlay */}
        <AnimatePresence>
          {showTransition && (
            <TransitionNudge
              onReady={handleTransitionReady}
              onBreak={handleTransitionBreak}
            />
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-hidden">
          <OneTaskCard
            action={currentMorning3Task}
            projectName={currentMorning3Task.projectId ? projectNames[currentMorning3Task.projectId] : undefined}
            doneCount={doneToday}
            totalCount={morning3Actions.length}
            onComplete={handleComplete}
            onSkip={(id) => {
              // Move skipped task to end of morning3 list
              setMorning3Actions(prev => {
                const rest = prev.filter(a => a.id !== id)
                const skipped = prev.find(a => a.id === id)
                return skipped ? [...rest, skipped] : rest
              })
              setMorning3Index(i => Math.min(i, morning3Actions.length - 2))
            }}
          />
        </div>
      </div>
    )
  }

  // ── ADHD all-done state ───────────────────────────────────────────────────
  if (isADHDMode && morning3AllDone) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center animate-fade-in">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-7xl mb-6"
        >
          🌱
        </motion.div>
        <h1 className="text-2xl font-display font-bold text-content-primary mb-2">
          {doneToday} {doneToday === 1 ? 'thing' : 'things'} done today.
        </h1>
        <p className="text-base text-content-secondary mb-8">
          Anything else, or call it a win?
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => { setMorning3Actions([]); setMorning3Index(0) }}
            className="w-full py-4 rounded-2xl bg-primary text-on-brand font-bold
                       shadow-glow-accent active:scale-95 transition-transform"
          >
            Keep going
          </button>
          <Link href="/inbox">
            <Button variant="secondary" fullWidth>Go to Inbox</Button>
          </Link>
        </div>
      </div>
    )
  }

  // ── Default / ADHD fallback: standard paginated list ──────────────────────
  return (
    <div className="flex flex-col h-full animate-fade-in">

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-surface-base/95 backdrop-blur-xl border-b border-border-default px-6 pt-14 pb-4">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <h1 className="text-2xl font-display font-bold text-content-primary flex items-center gap-2">
              <Zap size={22} className="text-primary-ink fill-primary/20" />
              {t('today.heading')}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-secondary mt-1 mb-2">
              {totalItems > 0
                ? `${totalItems} ${t('today.nextAction')}${totalItems !== 1 ? 's' : ''}${doneToday > 0 ? ` · ${doneToday} ${t('today.doneToday')}` : ''}`
                : doneToday > 0 ? `${doneToday} ${t('today.inboxZero')}` : t('today.allClear')}
            </p>
            <XPBar />
          </div>
        </div>

        {/* ADHD win counter (fallback list view) */}
        {isADHDMode && (
          <div className="mt-3">
            <DailyWinCounter count={doneToday} />
          </div>
        )}

        {/* Progress bar */}
        {totalForProgress > 0 && !isADHDMode && (
          <div className="mt-4">
            <ProgressBar
              value={doneToday}
              max={totalForProgress}
              showLabel={doneToday > 0}
              label={`${doneToday} ${t('today.doneToday')}`}
              size="sm"
            />
          </div>
        )}

        {/* Inbox nudge */}
        {inboxCount > 3 && (
          <Link href="/inbox">
            <div className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-status-warning/10
                            border border-status-warn rounded-xl text-sm font-bold text-status-warning active:scale-95 transition-transform">
              <AlertCircle size={16} />
              <span>{inboxCount} {t('today.needsClarifying')}</span>
              <span className="ml-auto">→</span>
            </div>
          </Link>
        )}

        {/* AI Bottleneck Coach — hidden in ADHD mode to reduce clutter */}
        {!isADHDMode && (
          <div className="mt-4">
            <InsightWidget />
          </div>
        )}

        {/* Filters row */}
        <div className="mt-6">
          <FilterBar />
        </div>
      </div>

      {/* ── Action list ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 custom-scrollbar">
        <AnimatePresence initial={false}>
          {visibleActions.map((action, i) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 300, transition: { duration: 0.2 } }}
              transition={{ delay: i * 0.04 }}
            >
              <ActionCard
                action={action}
                onComplete={handleComplete}
                projectName={action.projectId ? projectNames[action.projectId] : undefined}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ADHD pagination controls */}
        {isADHDMode && totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 pt-4 pb-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-3 rounded-full bg-surface-card text-content-secondary border border-border-subtle disabled:opacity-30 hover:bg-overlay-hover transition-colors active:scale-95"
              aria-label={t('today.previousPage')}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-content-secondary tabular-nums">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-3 rounded-full bg-surface-card text-content-secondary border border-border-subtle disabled:opacity-30 hover:bg-overlay-hover transition-colors active:scale-95"
              aria-label={t('today.nextPage')}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Empty state */}
        {visibleActions.length === 0 && (
          <div className="pt-8">
            <EmptyState
              icon={filters.energy ? '⚡' : '🚀'}
              title={filters.energy ? t('filter.noActionsForEnergy', { energy: filters.energy }) : t('today.allClear')}
              description={
                filters.energy
                  ? `No actions match the ${filters.energy} energy level. Try a different level or clear the filter.`
                  : t('filter.noActionsMatch')
              }
              action={
                filters.energy ? (
                  <button
                    onClick={() => handleEnergyChange(null)}
                    className="text-sm font-bold text-primary-ink hover:underline"
                  >
                    {t('filter.clearEnergyFilter')}
                  </button>
                ) : (
                  <Link href="/inbox">
                    <Button variant="secondary" size="sm">{t('today.goToInbox')}</Button>
                  </Link>
                )
              }
            />
          </div>
        )}

        {/* Waiting For section */}
        {waitingFor.length > 0 && (
          <div className="pt-6">
            <div className="flex items-center justify-between mb-4 px-2">
              <p className="text-[10px] font-bold text-content-secondary uppercase tracking-widest">
                {t('today.waitingFor')} ({waitingFor.length})
              </p>
              <Link href="/waiting" className="text-[10px] font-bold text-primary-ink uppercase tracking-widest hover:text-primary-ink/80 transition-colors">
                {t('today.seeAll')}
              </Link>
            </div>
            <div className="space-y-3">
              {waitingFor.map(a => (
                <div key={a.id} className="glass-card px-5 py-4 rounded-2xl border-l-4 border-l-status-warning">
                  <p className="text-sm font-medium text-content-primary">{a.text}</p>
                  {a.waitingFor && (
                    <p className="text-xs font-bold text-status-warning mt-2 tracking-wide">👤 {a.waitingFor.person}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
