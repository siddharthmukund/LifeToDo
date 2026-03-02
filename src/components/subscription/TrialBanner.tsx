// src/components/subscription/TrialBanner.tsx
// Persistent banner shown during a Pro trial period.
// iCCW #6 D5C deliverable.
'use client'

import { Zap } from 'lucide-react'
import { useSubscriptionStore } from '@/subscription/subscriptionStore'

export function TrialBanner() {
  const { subState, currentPeriodEnd } = useSubscriptionStore()

  if (subState !== 'PRO_ACTIVE') return null

  // Only show when we have a trial end date in the next 7 days
  // (currentPeriodEnd repurposed as trial end for trialing state)
  if (!currentPeriodEnd) return null

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  if (daysLeft > 7) return null

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/10 border-b border-primary/20">
      <Zap size={14} className="text-primary-ink flex-shrink-0" />
      <p className="flex-1 text-xs font-medium text-primary-ink">
        <strong>{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</strong> left in your Pro trial.
        Subscribe to keep your Pro features.
      </p>
    </div>
  )
}
