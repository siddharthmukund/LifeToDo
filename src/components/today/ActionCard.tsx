'use client'
// ActionCard — swipeable task card for the Today view.
// iCCW #13: complete button has aria-label, swipe has keyboard alternative,
//           Check icon is aria-hidden, completion is announced via useAnnounce.

import { useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Action } from '@/types'
import { useGTDStore } from '@/store/gtdStore'
import { cn } from '@/lib/utils'
import { useAnnounce } from '@/a11y/useAnnounce'

interface ActionCardProps {
  action: Action
  onComplete: (id: string) => void
  projectName?: string
}

export function ActionCard({ action, onComplete, projectName }: ActionCardProps) {
  const x = useMotionValue(0)
  const hasActed = useRef(false)
  const [completing, setCompleting] = useState(false)
  const { announceAction } = useAnnounce()

  const contexts = useGTDStore(s => s.contexts)
  const context = contexts.find(c => c.id === action.contextId)

  // A task is stale if it hasn't been updated in 7 days
  const isStale = Date.now() - new Date(action.updatedAt).getTime() > 7 * 24 * 60 * 60 * 1000

  // Energy dictates border color
  const borderColorName =
    action.energy === 'high'   ? 'border-l-primary' :
    action.energy === 'medium' ? 'border-l-yellow-500' :
                                 'border-l-slate-700/50'

  // Screen-reader-friendly energy label (non-color indicator)
  const energyLabel =
    action.energy === 'high'   ? 'High energy' :
    action.energy === 'medium' ? 'Medium energy' :
    action.energy === 'low'    ? 'Low energy' : ''

  function handleComplete() {
    if (hasActed.current) return
    hasActed.current = true
    setCompleting(true)
    announceAction(`Task completed: ${action.text}`)
    setTimeout(() => onComplete(action.id), 250)
  }

  function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (hasActed.current) return

    if (info.offset.x > 90) {
      hasActed.current = true
      setCompleting(true)
      announceAction(`Task completed: ${action.text}`)
      animate(x, 500, { duration: 0.25 }).then(() =>
        setTimeout(() => onComplete(action.id), 100)
      )
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 40 })
    }
  }

  const contextLabel = projectName || (context ? `${context.emoji || ''} ${context.name}` : 'Unknown')

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3">
      {/* Complete hint background (aria-hidden — visual affordance only) */}
      <div
        className="absolute inset-0 flex items-center justify-start pl-5 bg-primary rounded-2xl"
        aria-hidden="true"
      >
        <Check size={22} className="text-on-brand" />
        <span className="ml-2 text-on-brand text-sm font-bold">Done!</span>
      </div>

      {/* Draggable card */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        animate={completing ? { scale: 0.95, opacity: 0 } : {}}
        // aria-hidden on the drag wrapper — the complete button is the keyboard path
        aria-hidden="true"
        className={cn(
          'relative glass-card flex items-start gap-4 rounded-2xl p-4 transition-all',
          'cursor-grab active:cursor-grabbing select-none border-l-4',
          borderColorName,
        )}
      >
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-ink/70">
              {contextLabel}
            </span>
            {isStale && (
              <span className="rounded bg-status-warning/10 px-1.5 py-0.5 text-[8px] font-bold text-status-warning animate-pulse-slow">
                STALE
              </span>
            )}
          </div>

          <h3 className="text-base font-bold leading-tight text-content-primary line-clamp-2">
            {action.text}
          </h3>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); handleComplete() }}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-primary/30
                     bg-primary/10 text-primary-ink transition-all active:bg-primary active:text-on-brand hover:scale-105"
        >
          <Check size={18} strokeWidth={3} aria-hidden="true" />
        </button>
      </motion.div>

      {/*
        Keyboard-accessible complete button — visible to AT, visually hidden.
        Provides a swipe alternative for keyboard and switch-access users.
        (WCAG 2.5.1: all functionality available via pointer must also be
         available via keyboard / single pointer.)
      */}
      <button
        type="button"
        onClick={handleComplete}
        aria-label={`Complete task: ${action.text}${energyLabel ? `, ${energyLabel}` : ''}${isStale ? ', stale' : ''}, in ${contextLabel}`}
        className={cn(
          'absolute inset-0 w-full opacity-0',
          'focus-visible:opacity-100',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/60 focus-visible:ring-inset',
          'focus-visible:rounded-2xl focus-visible:bg-primary/10',
          'transition-opacity duration-150',
        )}
        tabIndex={0}
      >
        <span className="sr-only">
          {action.text}
          {energyLabel && ` — ${energyLabel}`}
          {isStale && ' — stale task'}
          {`. Context: ${contextLabel}. Press Enter or Space to mark as complete.`}
        </span>
      </button>
    </div>
  )
}
