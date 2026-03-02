// src/components/subscription/SubscriptionCard.tsx
'use client'

import { motion } from 'framer-motion'
import { Star, Zap, AlertCircle } from 'lucide-react'
import { useSubscription } from '@/subscription/useSubscription'

function PeriodEnd({ iso }: { iso: string }) {
  const d = new Date(iso)
  return (
    <span className="text-content-secondary">
      {d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
    </span>
  )
}

export function SubscriptionCard() {
  const { tier, subState, currentPeriodEnd, cancelAtPeriodEnd, isLoading, error, upgrade, manage } =
    useSubscription()

  return (
    <div className="bg-surface-card rounded-2xl border border-border-default p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {tier === 'pro' ? (
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/15 border border-primary/20">
              <Star size={17} className="text-primary-ink fill-primary/30" />
            </div>
          ) : (
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-elevated border border-border-default">
              <Zap size={17} className="text-content-secondary" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-content-primary">
              {tier === 'pro' ? 'Pro' : 'Free'} plan
            </p>
            <p className="text-xs text-content-secondary">
              {tier === 'pro'
                ? cancelAtPeriodEnd
                  ? <>Cancels <PeriodEnd iso={currentPeriodEnd!} /></>
                  : <>Renews <PeriodEnd iso={currentPeriodEnd!} /></>
                : '5 projects · 3 contexts · local only'
              }
            </p>
          </div>
        </div>

        {subState === 'PRO_GRACE_PERIOD' && (
          <div className="flex items-center gap-1 text-xs text-status-warning font-semibold">
            <AlertCircle size={13} />
            Payment issue
          </div>
        )}
      </div>

      {/* CTA */}
      {tier === 'free' ? (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={upgrade}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full h-12 rounded-xl
                     bg-primary text-text-on-brand font-semibold text-sm
                     hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50"
        >
          {isLoading
            ? <div className="w-4 h-4 rounded-full border-2 border-text-on-brand border-t-transparent animate-spin" />
            : <><Star size={15} /> Upgrade to Pro</>
          }
        </motion.button>
      ) : (
        <button
          onClick={manage}
          disabled={isLoading}
          className="flex items-center justify-center w-full h-11 rounded-xl
                     bg-surface-elevated border border-border-default
                     text-sm font-medium text-content-secondary
                     hover:bg-overlay-hover transition-colors active:scale-95 disabled:opacity-50"
        >
          {isLoading ? 'Loading…' : 'Manage billing'}
        </button>
      )}

      {error && <p className="text-xs text-status-error">{error}</p>}
    </div>
  )
}
