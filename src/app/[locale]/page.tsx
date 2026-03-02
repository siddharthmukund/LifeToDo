'use client'
// Today / Next Actions — answers "What should I do right now?"
// ADHD-friendly: energy filter, progress bar, 7-item pagination.

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { ActionCard } from '@/components/today/ActionCard'
import { FilterBar } from '@/components/today/FilterBar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { XPBar } from '@/components/gamification/XPBar'
import { InsightWidget } from '@/components/ai/InsightWidget'
import { useActions } from '@/hooks/useActions'
import { useEnergy } from '@/hooks/useEnergy'
import { useGTDStore } from '@/store/gtdStore'
import { db } from '@/lib/db'
import { ADHD_MAX_ITEMS } from '@/constants/gtd'
import Link from 'next/link'

export default function TodayPage() {
  const { actions, waitingFor, filters, setFilter, completeAction, refresh } = useActions()
  const inboxCount = useGTDStore(s => s.inboxCount)
  const adhdMode = useGTDStore(s => s.settings?.adhdMode)

  // Persisted energy preference — sync to action filter on mount
  const { energy: savedEnergy, setEnergy: persistEnergy } = useEnergy()

  const [projectNames, setProjectNames] = useState<Record<string, string>>({})
  const [completed, setCompleted] = useState<string[]>([])
  const [doneToday, setDoneToday] = useState(0)
  const [page, setPage] = useState(0)

  // On first mount: restore last-used energy level from settings
  useEffect(() => {
    if (savedEnergy && !filters.energy) {
      setFilter('energy', savedEnergy)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset page whenever filter changes
  useEffect(() => { setPage(0) }, [filters.energy, filters.contextId, filters.maxTime])

  // Pre-load project names for action cards
  useEffect(() => {
    async function loadProjectNames() {
      const ids = Array.from(new Set(actions.map(a => a.projectId).filter(Boolean) as string[]))
      const map: Record<string, string> = {}
      await Promise.all(ids.map(async id => {
        const p = await db.projects.get(id)
        if (p) map[id] = p.name
      }))
      setProjectNames(map)
    }
    loadProjectNames()
  }, [actions])

  async function handleComplete(id: string) {
    setCompleted(prev => [...prev, id])
    setDoneToday(n => n + 1)
    await completeAction(id)
    setTimeout(() => setCompleted(prev => prev.filter(c => c !== id)), 600)
    refresh()
  }

  function handleEnergyChange(level: typeof savedEnergy) {
    setFilter('energy', level)
    persistEnergy(level)
    setPage(0)
  }

  // Actions minus in-flight completions (useActions already applies energy filter)
  const pendingActions = actions.filter(a => !completed.includes(a.id))
  const totalItems = pendingActions.length

  // ADHD pagination
  const totalPages = adhdMode ? Math.max(1, Math.ceil(totalItems / ADHD_MAX_ITEMS)) : 1
  const visibleActions = adhdMode
    ? pendingActions.slice(page * ADHD_MAX_ITEMS, (page + 1) * ADHD_MAX_ITEMS)
    : pendingActions

  // Progress: done / (done + remaining)
  const totalForProgress = doneToday + totalItems

  return (
    <div className="flex flex-col h-full animate-fade-in">

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-surface-base/95 backdrop-blur-xl border-b border-border-default px-6 pt-14 pb-4">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <h1 className="text-2xl font-display font-bold text-content-primary flex items-center gap-2">
              <Zap size={22} className="text-primary-ink fill-primary/20" />
              Focus
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-secondary mt-1 mb-2">
              {totalItems > 0
                ? `${totalItems} next action${totalItems !== 1 ? 's' : ''}${doneToday > 0 ? ` · ${doneToday} done` : ''}`
                : doneToday > 0 ? `${doneToday} done — inbox zero! 🚀` : 'All clear'}
            </p>
            <XPBar />
          </div>
        </div>

        {/* Progress bar — only show when there's meaningful progress */}
        {totalForProgress > 0 && (
          <div className="mt-4">
            <ProgressBar
              value={doneToday}
              max={totalForProgress}
              showLabel={doneToday > 0}
              label={`${doneToday} done today`}
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
              <span>{inboxCount} items need clarifying</span>
              <span className="ml-auto">→</span>
            </div>
          </Link>
        )}

        {/* AI Bottleneck Coach */}
        <div className="mt-4">
          <InsightWidget />
        </div>

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
        {adhdMode && totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 pt-4 pb-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-3 rounded-full bg-surface-card text-content-secondary border border-border-subtle disabled:opacity-30 hover:bg-overlay-hover transition-colors active:scale-95"
              aria-label="Previous page"
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
              aria-label="Next page"
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
              title={filters.energy ? `No ${filters.energy} energy actions` : "You're clear"}
              description={
                filters.energy
                  ? `No actions match the ${filters.energy} energy level. Try a different level or clear the filter.`
                  : 'No next actions match your filters. Try broadening your search or capture something new.'
              }
              action={
                filters.energy ? (
                  <button
                    onClick={() => handleEnergyChange(null)}
                    className="text-sm font-bold text-primary-ink hover:underline"
                  >
                    Clear energy filter
                  </button>
                ) : (
                  <Link href="/inbox">
                    <Button variant="secondary" size="sm">Go to Inbox</Button>
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
                Waiting For ({waitingFor.length})
              </p>
              <Link href="/waiting" className="text-[10px] font-bold text-primary-ink uppercase tracking-widest hover:text-primary-ink/80 transition-colors">
                See all →
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
