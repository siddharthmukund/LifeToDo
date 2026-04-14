'use client'
// ActionCard — swipeable task card for the Today view.
// iCCW #13: complete button has aria-label, swipe has keyboard alternative,
//           Check icon is aria-hidden, completion is announced via useAnnounce.

import { useRef, useState } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Check, Zap, BatteryMedium, BatteryLow, FolderOpen } from 'lucide-react'
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
  const t = useTranslations('engage')

  const contexts = useGTDStore(s => s.contexts)
  const context = contexts.find(c => c.id === action.contextId)

  const isStale = Date.now() - new Date(action.updatedAt).getTime() > 7 * 24 * 60 * 60 * 1000

  const borderColorName =
    action.energy === 'high'   ? 'border-l-primary' :
    action.energy === 'medium' ? 'border-l-status-warning' :
                                 'border-l-border-default'

  const energyLabel =
    action.energy === 'high'   ? t('filter.high') :
    action.energy === 'medium' ? t('filter.medium') :
    action.energy === 'low'    ? t('filter.low') : ''

  const EnergyIcon =
    action.energy === 'high'   ? Zap :
    action.energy === 'medium' ? BatteryMedium :
                                 BatteryLow

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

  const contextLabel = projectName || (context ? `${context.emoji || ''} ${context.name}` : '')

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3">
      {/* Complete hint background (aria-hidden — visual affordance only) */}
      <div
        className="absolute inset-0 flex items-center justify-start pl-5 bg-primary rounded-2xl"
        aria-hidden="true"
      >
        <Check size={22} className="text-on-brand" />
        <span className="ml-2 text-on-brand text-sm font-bold">{t('action.done')}</span>
      </div>

      {/* Draggable card */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        animate={completing ? { scale: 0.95, opacity: 0 } : {}}
        aria-hidden="true"
        className={cn(
          'relative glass-card flex flex-col justify-between h-44 rounded-[12px] p-6 transition-all',
          'cursor-grab active:cursor-grabbing select-none border border-border-default hover:shadow-glow-primary bg-surface-card w-full',
        )}
      >
        <div className="flex justify-between items-start w-full">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
             <EnergyIcon className="text-primary-ink" size={20} />
          </div>
          {energyLabel && (
             <span className="text-[10px] font-bold uppercase tracking-widest text-primary-ink bg-primary/10 px-2 py-1 rounded-full text-right ml-2">
               {energyLabel} Energy
             </span>
          )}
        </div>

        <div className="w-full">
          <h3 className="text-xl font-bold leading-tight text-content-primary line-clamp-2">
            {action.text}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm font-medium text-content-secondary line-clamp-1">
              {contextLabel || 'Inbox'}
              {isStale && <span className="ml-2 rounded bg-status-warning/10 px-1.5 py-0.5 text-[8px] font-bold text-status-warning animate-pulse-slow">{t('action.stale')}</span>}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); handleComplete() }}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30
                         bg-primary/5 text-primary-ink transition-all active:bg-primary active:text-on-brand hover:scale-105"
            >
              <Check size={16} strokeWidth={3} aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.div>

      {/*
        Keyboard-accessible complete button — visible to AT, visually hidden.
        Provides a swipe alternative for keyboard and switch-access users.
      */}
      <button
        type="button"
        onClick={handleComplete}
        aria-label={`Complete task: ${action.text}${energyLabel ? `, ${energyLabel}` : ''}${isStale ? `, ${t('action.staleLabel')}` : ''}${contextLabel ? `, ${t('action.contextLabel')} ${contextLabel}` : ''}`}
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
          {isStale && ` — ${t('action.staleLabel')}`}
          {contextLabel && `. ${t('action.contextLabel')} ${contextLabel}.`}
          {` ${t('action.pressToComplete')}`}
        </span>
      </button>
    </div>
  )
}
