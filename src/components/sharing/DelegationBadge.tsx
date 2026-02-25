'use client'
// components/sharing/DelegationBadge.tsx
// Compact badge showing who an action is delegated to.
// Appears on WaitingCard and ActionCard when action.waitingFor is set.

import { UserCheck } from 'lucide-react'
import type { Action } from '@/types'

interface DelegationBadgeProps {
  action:    Action
  compact?:  boolean
}

export function DelegationBadge({ action, compact = false }: DelegationBadgeProps) {
  if (!action.waitingFor?.person) return null

  const { person, followUpDate } = action.waitingFor
  const isOverdue = followUpDate && new Date(followUpDate) < new Date()

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
        <UserCheck size={9} />
        {person}
      </span>
    )
  }

  return (
    <div className={[
      'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium',
      isOverdue
        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
        : 'bg-white/5 text-slate-400 border border-white/8',
    ].join(' ')}>
      <UserCheck size={12} />
      <span>
        Waiting on <strong>{person}</strong>
        {followUpDate && (
          <span className={isOverdue ? ' text-yellow-400' : ' text-slate-500'}>
            {' '}· {isOverdue ? 'overdue' : `by ${new Date(followUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </span>
        )}
      </span>
    </div>
  )
}
