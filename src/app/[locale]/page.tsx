'use client'
// Today / Next Actions — answers "What should I do right now?"
// Default Mode: energy filter, progress bar, 7-item pagination.
// ADHD Mode ON: Welcome Back → Morning 3 → OneTaskCard → TransitionNudge flow.

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, AlertCircle, ChevronLeft, ChevronRight, Mic, Plus, Keyboard } from 'lucide-react'
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
  GardenView,
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
import { platform } from '@/native/platform'

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
                        border-b border-border-default px-6 pt-14 pb-3 space-y-3">
          <DailyWinCounter
            count={doneToday}
            total={morning3Actions.length}
          />
          <GardenView />
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

  // ── Default / ADHD fallback: mockups reconciled layout ────────────────────
  return (
    <div className="flex flex-col h-full animate-fade-in relative bg-surface-base">

      {/* ── TopAppBar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 w-full z-50 flex justify-between items-center px-6 min-h-[4rem] glass-header">
        <h1 className="font-display text-[1.75rem] font-extrabold tracking-tight text-[#37f6dd]">
          Today
        </h1>
        <Link href="/inbox" aria-label="Add task">
          <div className="w-10 h-10 rounded-xl bg-[#37f6dd] text-[#0d0d18] flex items-center justify-center shadow-[0_0_16px_rgba(55,246,221,0.4)] active:scale-90 transition-transform">
            <Plus size={22} strokeWidth={2.5} />
          </div>
        </Link>
      </header>

      {/* ── Scrollable Body ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-32 space-y-8 custom-scrollbar">

        {/* Stat + XP */}
        <section>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#aba9b9] mb-1">
            Today&rsquo;s Focus
          </p>
          <div className="flex items-end gap-4 mb-3">
            <span className="text-[3.5rem] font-extrabold tracking-tighter leading-none text-[#e9e6f7]">
              {totalItems}
            </span>
            <div className="pb-2 text-[#aba9b9] leading-tight text-sm">
              {totalItems === 1 ? 'action' : 'actions'} pending
              {doneToday > 0 && (
                <p className="text-[#37f6dd] font-bold text-xs">{doneToday} completed today</p>
              )}
            </div>
          </div>
          <XPBar />
          {totalForProgress > 0 && !isADHDMode && (
            <div className="mt-3">
              <ProgressBar value={doneToday} max={totalForProgress} showLabel size="sm" label={`${doneToday} done`} />
            </div>
          )}
          <div className="mt-4">
            <FilterBar />
          </div>
        </section>

        {/* Action Cards */}
        <section className="grid grid-cols-1 gap-4">
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
        </section>

        {/* Empty State */}
        {visibleActions.length === 0 && (
          <EmptyState
            icon={filters.energy ? '⚡' : '🚀'}
            title={filters.energy ? t('filter.noActionsForEnergy', { energy: filters.energy }) : t('today.allClear')}
            description={t('filter.noActionsMatch')}
            action={<Link href="/inbox"><Button variant="secondary" size="sm">{t('today.goToInbox')}</Button></Link>}
          />
        )}

        {/* Capture Orb */}
        {!isADHDMode && (
          <section className="flex flex-col items-center justify-center py-10 relative">
            <div className="relative flex items-center justify-center w-36 h-36">
              {!platform.isAndroid() && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-[#37f6dd]/20 scale-150 animate-pulse-ring pointer-events-none" />
                  <div className="absolute inset-0 rounded-full border border-[#37f6dd]/10 scale-[1.8] animate-pulse-ring-2 pointer-events-none" />
                </>
              )}
              <Link
                href="/inbox"
                className="relative z-10 w-full h-full rounded-full bg-[#37f6dd]/20 border border-[#37f6dd]/40 shadow-[0_0_40px_rgba(55,246,221,0.4)] flex items-center justify-center active:scale-90 transition-transform duration-300"
                aria-label="Add new task"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#37f6dd] to-[#00e5cc] flex items-center justify-center shadow-[0_0_20px_rgba(55,246,221,0.6)]">
                  <Mic className="text-[#0d0d18]" size={40} strokeWidth={1.5} />
                </div>
              </Link>
            </div>
            <p className="mt-16 font-bold tracking-widest text-[11px] uppercase text-[#37f6dd]/60 animate-pulse">
              Tap to Capture a Thought
            </p>
            <Link href="/inbox" className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#181826] border border-[#474754] text-[#aba9b9] text-xs font-bold uppercase tracking-widest hover:border-[#37f6dd]/40 transition-colors active:scale-95">
              <Plus size={14} />
              Add task
            </Link>
          </section>
        )}

      </main>
    </div>
  )
}
