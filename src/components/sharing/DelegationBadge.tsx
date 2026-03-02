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
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-content-secondary bg-overlay-hover px-2 py-0.5 rounded-full">
        <UserCheck size={9} />
        {person}
      </span>
    )
  }

  return (
    <div className={[
      'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium',
      isOverdue
        ? 'bg-status-warning/10 text-status-warning border border-status-warn'
        : 'bg-overlay-hover text-content-secondary border border-border-subtle',
    ].join(' ')}>
      <UserCheck size={12} />
      <span>
        Waiting on <strong>{person}</strong>
        {followUpDate && (
          <span className={isOverdue ? ' text-status-warning' : ' text-content-muted'}>
            {' '}· {isOverdue ? 'overdue' : `by ${new Date(followUpDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </span>
        )}
      </span>
    </div>
  )
}
