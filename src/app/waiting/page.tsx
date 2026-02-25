'use client'
// Waiting For — track delegated tasks and follow-ups.
// New screen in iCCW #3 (Figma: waiting_for_list, delegate_task, follow_up_reminder_alert).
// Data: actions with status === 'waiting', enriched with waitingFor.person + followUpDate.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, UserCheck, Plus, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { useGTDStore } from '@/store/gtdStore'
import { timeAgo } from '@/lib/utils'
import type { Action } from '@/types'
import Link from 'next/link'

// Overdue = follow-up date has passed
function isOverdue(action: Action): boolean {
  if (!action.waitingFor?.followUpDate) return false
  return new Date(action.waitingFor.followUpDate) < new Date()
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000)
}

export default function WaitingForPage() {
  const { actions, addAction, completeAction } = useGTDStore()
  const [tab, setTab]           = useState<'active' | 'resolved'>('active')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newText, setNewText]   = useState('')
  const [newPerson, setNewPerson] = useState('')
  const [saving, setSaving]     = useState(false)

  const waitingItems  = actions.filter(a => a.status === 'waiting')
  const overdueItems  = waitingItems.filter(isOverdue)

  async function handleMarkResolved(id: string) {
    await completeAction(id)
  }

  async function handleAddWaiting() {
    if (!newText.trim() || !newPerson.trim()) return
    setSaving(true)
    const followUpDate = new Date(Date.now() + 14 * 86_400_000) // default: follow up in 2 weeks
    await addAction({
      text: newText.trim(),
      contextId: 'ctx-anywhere',
      energy: 'medium',
      timeEstimate: 5,
      status: 'waiting',
      waitingFor: {
        person: newPerson.trim(),
        followUpDate,
      },
    })
    setNewText('')
    setNewPerson('')
    setShowAddModal(false)
    setSaving(false)
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background-dark/95 backdrop-blur-xl border-b border-primary/10 px-6 pt-14 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-full bg-card-dark border border-white/5 text-slate-400 hover:text-white active:scale-95 transition-all">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <Clock size={22} className="text-primary fill-primary/20" />
                Waiting For
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">
                {waitingItems.length} item{waitingItems.length !== 1 ? 's' : ''}
                {overdueItems.length > 0 && (
                  <span className="text-yellow-500 ml-2">· {overdueItems.length} need follow-up</span>
                )}
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add
          </Button>
        </div>

        {/* ── Segmented tabs ──────────────────────────────────────────────── */}
        <div className="flex gap-2">
          {(['active', 'resolved'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all active:scale-95
                ${tab === t
                  ? 'bg-primary text-background-dark shadow-glow-accent'
                  : 'bg-card-dark text-slate-500 border border-white/8 hover:text-white'}`}
            >
              {t === 'active' ? 'Active' : 'Resolved'}
              {t === 'active' && waitingItems.length > 0 && (
                <span className="ml-1.5 opacity-75">({waitingItems.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 custom-scrollbar">

        {tab === 'active' && (
          <AnimatePresence initial={false}>
            {waitingItems.length === 0 ? (
              <EmptyState
                icon="⏳"
                title="Nothing waiting"
                description="Delegated tasks and follow-ups will appear here. Tap + Add to track a response you're waiting for."
                action={
                  <Button size="sm" onClick={() => setShowAddModal(true)}>
                    Add waiting item
                  </Button>
                }
              />
            ) : (
              <>
                {/* Overdue banner */}
                {overdueItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl mb-2"
                  >
                    <AlertCircle size={16} className="text-yellow-500 flex-shrink-0" />
                    <p className="text-xs font-bold text-yellow-500">
                      {overdueItems.length} follow-up{overdueItems.length !== 1 ? 's' : ''} past due — time to nudge
                    </p>
                  </motion.div>
                )}

                {/* Sorted: overdue first */}
                {[...waitingItems]
                  .sort((a, b) => (isOverdue(a) ? -1 : isOverdue(b) ? 1 : 0))
                  .map((item, i) => (
                    <WaitingCard
                      key={item.id}
                      item={item}
                      index={i}
                      overdue={isOverdue(item)}
                      onResolved={handleMarkResolved}
                    />
                  ))}
              </>
            )}
          </AnimatePresence>
        )}

        {tab === 'resolved' && (
          <EmptyState
            icon="✅"
            title="All clear"
            description="When you receive a response and mark an item resolved, it will move here."
          />
        )}
      </div>

      {/* ── Add modal ──────────────────────────────────────────────────────── */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Track Follow-up">
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              What are you waiting for? *
            </label>
            <input
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="e.g. Response to the proposal email"
              className="w-full bg-card-dark border border-white/10 rounded-2xl px-5 py-4
                         text-base font-medium text-white placeholder-slate-500
                         focus:outline-none focus:border-primary/50 shadow-inner"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Waiting from *
            </label>
            <input
              value={newPerson}
              onChange={e => setNewPerson(e.target.value)}
              placeholder="Who? (e.g. Sarah, Legal Team, Client)"
              className="w-full bg-card-dark border border-white/10 rounded-2xl px-5 py-4
                         text-base font-medium text-white placeholder-slate-500
                         focus:outline-none focus:border-primary/50 shadow-inner"
            />
          </div>
          <p className="text-xs text-slate-500">
            A follow-up reminder will be set for 14 days from now.
          </p>
          <Button
            fullWidth
            size="lg"
            disabled={!newText.trim() || !newPerson.trim()}
            loading={saving}
            onClick={handleAddWaiting}
          >
            Track Follow-up
          </Button>
        </div>
      </Modal>
    </div>
  )
}

// ── WaitingCard ───────────────────────────────────────────────────────────────
function WaitingCard({
  item, index, overdue, onResolved,
}: {
  item: Action
  index: number
  overdue: boolean
  onResolved: (id: string) => void
}) {
  const days = daysSince(new Date(item.updatedAt))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`glass-card rounded-2xl px-5 py-4 border-l-4
        ${overdue ? 'border-l-yellow-500' : 'border-l-primary'}`}
    >
      {/* Overdue badge */}
      {overdue && (
        <div className="flex items-center gap-1.5 mb-2">
          <Badge color="warning">Follow-up Due</Badge>
        </div>
      )}

      {/* Task text */}
      <p className="text-base font-bold text-white leading-snug">{item.text}</p>

      {/* Person row */}
      {item.waitingFor && (
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex-shrink-0">
              <UserCheck size={14} className="text-primary" />
            </div>
            <span className="text-sm font-bold text-white">{item.waitingFor.person}</span>
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            {days === 0 ? 'today' : `${days}d ago`}
          </span>
        </div>
      )}

      {/* Fallback timestamp if no person */}
      {!item.waitingFor && (
        <p className="text-xs text-slate-500 mt-2">{timeAgo(new Date(item.updatedAt))}</p>
      )}

      {/* Action row */}
      <div className="mt-4">
        <button
          onClick={() => onResolved(item.id)}
          className="w-full py-2.5 rounded-xl bg-primary/10 border border-primary/20
                     text-xs font-bold text-primary hover:bg-primary/20 transition-colors active:scale-95"
        >
          ✓ Got Response — Mark Resolved
        </button>
      </div>
    </motion.div>
  )
}
