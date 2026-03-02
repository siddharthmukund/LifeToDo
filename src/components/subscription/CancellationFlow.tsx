// src/components/subscription/CancellationFlow.tsx
// Redirects to Stripe Customer Portal for cancellation — Stripe handles all confirmation UX.
'use client'

import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { useSubscription } from '@/subscription/useSubscription'

export function CancellationFlow() {
  const { subState, manage, isLoading } = useSubscription()

  if (subState !== 'PRO_ACTIVE' && subState !== 'CANCELLATION_REQUESTED') return null

  return (
    <div className="bg-surface-card rounded-2xl border border-border-default p-5 space-y-3">
      <p className="text-xs font-bold uppercase tracking-widest text-content-secondary">
        Manage subscription
      </p>
      {subState === 'CANCELLATION_REQUESTED' ? (
        <p className="text-sm text-status-warning font-medium">
          Your subscription is set to cancel at the end of the billing period.
          You can reactivate it in the billing portal.
        </p>
      ) : (
        <p className="text-sm text-content-secondary">
          Cancel anytime through the Stripe billing portal. Pro features remain
          active until the end of your current billing period.
        </p>
      )}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={manage}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 w-full h-11 rounded-xl
                   bg-surface-elevated border border-border-default
                   text-sm font-medium text-content-secondary
                   hover:bg-overlay-hover transition-colors disabled:opacity-50"
      >
        <ExternalLink size={14} />
        Open billing portal
      </motion.button>
    </div>
  )
}
